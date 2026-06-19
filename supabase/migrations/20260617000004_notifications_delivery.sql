-- =========================================
-- NOTIFICATIONS & DELIVERY MVP
-- =========================================

-- Notification types and statuses
CREATE TYPE public.notification_type AS ENUM (
  'reservation_created',
  'reservation_confirmed',
  'reservation_ready',
  'transfer_requested',
  'transfer_approved',
  'prescription_uploaded',
  'prescription_approved',
  'prescription_rejected',
  'delivery_assigned',
  'delivery_picked_up',
  'delivery_delivered'
);
CREATE TYPE public.notification_status AS ENUM ('unread', 'read');
CREATE TYPE public.delivery_status AS ENUM ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status public.notification_status NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deliveries
CREATE TABLE public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
  patient_address TEXT NOT NULL,
  patient_phone TEXT,
  patient_name TEXT NOT NULL,
  delivery_fee_tnd NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  status public.delivery_status NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_deliveries_branch ON public.deliveries(branch_id);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System creates notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update their notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branch staff see branch deliveries" ON public.deliveries FOR SELECT TO authenticated USING (public.is_branch_member(auth.uid(), branch_id));
CREATE POLICY "Patients see their deliveries" ON public.deliveries FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND r.patient_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.patient_id = auth.uid())
);
CREATE POLICY "Branch staff manage deliveries" ON public.deliveries FOR ALL TO authenticated USING (public.is_branch_member(auth.uid(), branch_id));

-- Triggers
CREATE TRIGGER trg_deliveries_updated BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RPC Function: Create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _type public.notification_type,
  _title TEXT,
  _body TEXT,
  _data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (_user_id, _type, _title, _body, _data)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;
