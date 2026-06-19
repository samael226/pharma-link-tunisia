-- =========================================
-- PRESCRIPTION VERIFICATION
-- =========================================

-- Prescription statuses
CREATE TYPE public.prescription_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'expired', 'fulfilled');

-- Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  notes TEXT,
  status public.prescription_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prescription items (medicines in the prescription)
CREATE TABLE public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  quantity INTEGER NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_branch ON public.prescriptions(branch_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescriptions_expires ON public.prescriptions(expires_at);
CREATE INDEX idx_prescription_items_prescription ON public.prescription_items(prescription_id);

-- RLS Policies
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients see their prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Branch staff see branch prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (public.is_branch_member(auth.uid(), branch_id));
CREATE POLICY "Patients create prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Branch staff update prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (public.is_branch_member(auth.uid(), branch_id));

ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prescription items follow prescription" ON public.prescription_items FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND 
    (p.patient_id = auth.uid() OR public.is_branch_member(auth.uid(), p.branch_id))));

-- Triggers
CREATE TRIGGER trg_prescriptions_updated BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
