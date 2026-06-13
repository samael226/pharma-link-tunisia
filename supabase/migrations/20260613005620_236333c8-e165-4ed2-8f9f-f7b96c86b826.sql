
-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('patient', 'pharmacist', 'pharmacy_owner', 'supplier', 'admin');
CREATE TYPE public.pharmacy_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'ready', 'fulfilled', 'cancelled', 'expired');
CREATE TYPE public.transfer_status AS ENUM ('requested', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');
CREATE TYPE public.language_code AS ENUM ('fr', 'ar', 'en');

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  preferred_language public.language_code NOT NULL DEFAULT 'fr',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =========================================
-- USER ROLES (separate table for security)
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- PHARMACIES
-- =========================================
CREATE TABLE public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  status public.pharmacy_status NOT NULL DEFAULT 'pending',
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pharmacies_owner ON public.pharmacies(owner_id);
CREATE INDEX idx_pharmacies_status ON public.pharmacies(status);
GRANT SELECT, INSERT, UPDATE ON public.pharmacies TO authenticated;
GRANT ALL ON public.pharmacies TO service_role;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved pharmacies are public" ON public.pharmacies FOR SELECT TO authenticated USING (status = 'approved' OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners create their pharmacies" ON public.pharmacies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update their pharmacies" ON public.pharmacies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========================================
-- BRANCHES
-- =========================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  governorate TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  is_24_7 BOOLEAN NOT NULL DEFAULT false,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  opening_hours JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_branches_pharmacy ON public.branches(pharmacy_id);
CREATE INDEX idx_branches_geo ON public.branches(latitude, longitude);
CREATE INDEX idx_branches_city ON public.branches(city);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active branches viewable by authenticated" ON public.branches FOR SELECT TO authenticated USING (
  is_active OR EXISTS (SELECT 1 FROM public.pharmacies p WHERE p.id = pharmacy_id AND p.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Owners manage their branches" ON public.branches FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pharmacies p WHERE p.id = pharmacy_id AND p.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pharmacies p WHERE p.id = pharmacy_id AND p.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- =========================================
-- BRANCH STAFF (pharmacists working at a branch)
-- =========================================
CREATE TABLE public.branch_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'pharmacist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, user_id)
);
CREATE INDEX idx_branch_staff_user ON public.branch_staff(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branch_staff TO authenticated;
GRANT ALL ON public.branch_staff TO service_role;
ALTER TABLE public.branch_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff see their own assignments" ON public.branch_staff FOR SELECT TO authenticated USING (user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.branches b JOIN public.pharmacies p ON p.id = b.pharmacy_id WHERE b.id = branch_id AND p.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners manage staff" ON public.branch_staff FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.branches b JOIN public.pharmacies p ON p.id = b.pharmacy_id WHERE b.id = branch_id AND p.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.branches b JOIN public.pharmacies p ON p.id = b.pharmacy_id WHERE b.id = branch_id AND p.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Helper: is user staff (or owner) of a branch?
CREATE OR REPLACE FUNCTION public.is_branch_member(_user_id UUID, _branch_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.branch_staff WHERE branch_id = _branch_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.branches b JOIN public.pharmacies p ON p.id = b.pharmacy_id
    WHERE b.id = _branch_id AND p.owner_id = _user_id
  )
$$;

-- =========================================
-- MEDICINES (catalog, public)
-- =========================================
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  name_en TEXT,
  barcode TEXT UNIQUE,
  manufacturer TEXT,
  category TEXT,
  dosage TEXT,
  form TEXT,
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_medicines_brand ON public.medicines USING gin (to_tsvector('simple', brand_name));
CREATE INDEX idx_medicines_generic ON public.medicines USING gin (to_tsvector('simple', generic_name));
CREATE INDEX idx_medicines_barcode ON public.medicines(barcode);
CREATE INDEX idx_medicines_category ON public.medicines(category);
GRANT SELECT ON public.medicines TO authenticated, anon;
GRANT ALL ON public.medicines TO service_role;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medicines are public" ON public.medicines FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins manage medicines" ON public.medicines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- INVENTORY
-- =========================================
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  price_tnd NUMERIC(10,3) NOT NULL DEFAULT 0,
  batch_number TEXT,
  expiry_date DATE,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, medicine_id, batch_number)
);
CREATE INDEX idx_inventory_branch ON public.inventory(branch_id);
CREATE INDEX idx_inventory_medicine ON public.inventory(medicine_id);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory visible to authenticated" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Branch members manage inventory" ON public.inventory FOR ALL TO authenticated
  USING (public.is_branch_member(auth.uid(), branch_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_branch_member(auth.uid(), branch_id) OR public.has_role(auth.uid(), 'admin'));

-- =========================================
-- RESERVATIONS
-- =========================================
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status public.reservation_status NOT NULL DEFAULT 'pending',
  note TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservations_patient ON public.reservations(patient_id);
CREATE INDEX idx_reservations_branch ON public.reservations(branch_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients see their reservations" ON public.reservations FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Branch members see branch reservations" ON public.reservations FOR SELECT TO authenticated USING (public.is_branch_member(auth.uid(), branch_id) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Patients create reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients update their reservations" ON public.reservations FOR UPDATE TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Branch members update branch reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.is_branch_member(auth.uid(), branch_id) OR public.has_role(auth.uid(), 'admin'));

-- =========================================
-- TRANSFERS (inter-pharmacy)
-- =========================================
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  to_branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status public.transfer_status NOT NULL DEFAULT 'requested',
  note TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_branch_id <> to_branch_id)
);
CREATE INDEX idx_transfers_from ON public.transfers(from_branch_id);
CREATE INDEX idx_transfers_to ON public.transfers(to_branch_id);
CREATE INDEX idx_transfers_status ON public.transfers(status);
GRANT SELECT, INSERT, UPDATE ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involved branches see transfers" ON public.transfers FOR SELECT TO authenticated USING (
  public.is_branch_member(auth.uid(), from_branch_id)
  OR public.is_branch_member(auth.uid(), to_branch_id)
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Requesting branch creates transfers" ON public.transfers FOR INSERT TO authenticated WITH CHECK (
  public.is_branch_member(auth.uid(), to_branch_id) AND requested_by = auth.uid()
);
CREATE POLICY "Involved branches update transfers" ON public.transfers FOR UPDATE TO authenticated USING (
  public.is_branch_member(auth.uid(), from_branch_id)
  OR public.is_branch_member(auth.uid(), to_branch_id)
  OR public.has_role(auth.uid(), 'admin')
);

-- =========================================
-- AUDIT LOGS
-- =========================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- =========================================
-- TRIGGERS: updated_at + auto profile + default role
-- =========================================
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pharmacies_updated BEFORE UPDATE ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_medicines_updated BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_transfers_updated BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile + default 'patient' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
