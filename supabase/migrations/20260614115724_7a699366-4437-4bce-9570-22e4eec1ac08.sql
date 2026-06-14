
-- Auto-grant pharmacy_owner role on pharmacy creation
CREATE OR REPLACE FUNCTION public.grant_owner_role_on_pharmacy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.owner_id, 'pharmacy_owner')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pharmacy_owner_role ON public.pharmacies;
CREATE TRIGGER trg_pharmacy_owner_role
AFTER INSERT ON public.pharmacies
FOR EACH ROW EXECUTE FUNCTION public.grant_owner_role_on_pharmacy();

-- Bootstrap first admin (only if no admin exists)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_admin boolean;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO has_admin;
  IF has_admin THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- Admin pharmacy approval helper
CREATE OR REPLACE FUNCTION public.set_pharmacy_status(_pharmacy_id uuid, _status pharmacy_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.pharmacies SET status = _status, updated_at = now() WHERE id = _pharmacy_id;
END $$;

GRANT EXECUTE ON FUNCTION public.set_pharmacy_status(uuid, pharmacy_status) TO authenticated;

-- Allow admins to view all pharmacies including pending
DROP POLICY IF EXISTS "Admins see all pharmacies" ON public.pharmacies;
CREATE POLICY "Admins see all pharmacies" ON public.pharmacies
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
