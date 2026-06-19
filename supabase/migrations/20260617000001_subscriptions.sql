-- =========================================
-- SUBSCRIPTIONS & BILLING
-- =========================================

-- Subscription tiers and statuses
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier public.subscription_tier NOT NULL UNIQUE,
  price_tnd NUMERIC(10,2) NOT NULL,
  billing_interval TEXT NOT NULL DEFAULT 'monthly',
  max_branches INTEGER NOT NULL,
  max_medicines INTEGER NOT NULL,
  features JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status public.subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pharmacy_id)
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_tnd NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount_tnd NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_subscriptions_pharmacy ON public.subscriptions(pharmacy_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX idx_invoices_subscription ON public.invoices(subscription_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);

-- RLS Policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.subscription_plans FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pharmacy owners see their subscription" ON public.subscriptions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.pharmacies p WHERE p.id = pharmacy_id AND p.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their invoices" ON public.invoices FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.subscriptions s JOIN public.pharmacies p ON p.id = s.pharmacy_id 
    WHERE s.id = invoices.subscription_id AND p.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their payments" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.invoices i JOIN public.subscriptions s ON s.id = i.subscription_id 
    JOIN public.pharmacies p ON p.id = s.pharmacy_id 
    WHERE i.id = payments.invoice_id AND p.owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed subscription plans
INSERT INTO public.subscription_plans (name, tier, price_tnd, max_branches, max_medicines, features) VALUES
('Free Trial', 'free', 0, 1, 50, '["search", "reservations", "basic_analytics"]'::jsonb),
('Starter', 'starter', 49, 3, 500, '["search", "reservations", "transfers", "analytics", "email_support"]'::jsonb),
('Professional', 'pro', 129, 10, 5000, '["search", "reservations", "transfers", "analytics", "priority_support", "api_access"]'::jsonb),
('Enterprise', 'enterprise', 299, 999, 999999, '["all_features", "dedicated_support", "custom_integrations", "sla"]'::jsonb);

-- RPC Function: Create subscription
CREATE OR REPLACE FUNCTION public.create_subscription(_pharmacy_id UUID, _plan_tier public.subscription_tier)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _plan_id UUID;
  _subscription_id UUID;
  _trial_end TIMESTAMPTZ := now() + interval '14 days';
BEGIN
  SELECT id INTO _plan_id FROM public.subscription_plans WHERE tier = _plan_tier AND is_active = true;
  
  IF _plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan not found: %', _plan_tier;
  END IF;
  
  INSERT INTO public.subscriptions (pharmacy_id, plan_id, status, trial_ends_at, current_period_ends_at)
  VALUES (_pharmacy_id, _plan_id, 'trial', _trial_end, _trial_end)
  RETURNING id INTO _subscription_id;
  
  RETURN _subscription_id;
END;
$$;

-- RPC Function: Change subscription plan
CREATE OR REPLACE FUNCTION public.change_subscription_plan(_subscription_id UUID, _new_plan_tier public.subscription_tier)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _new_plan_id UUID;
BEGIN
  SELECT id INTO _new_plan_id FROM public.subscription_plans WHERE tier = _new_plan_tier AND is_active = true;
  
  IF _new_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan not found: %', _new_plan_tier;
  END IF;
  
  UPDATE public.subscriptions 
  SET plan_id = _new_plan_id, 
      current_period_ends_at = now() + interval '1 month',
      cancel_at_period_end = false
  WHERE id = _subscription_id;
  
  RETURN true;
END;
$$;

-- RPC Function: Cancel subscription
CREATE OR REPLACE FUNCTION public.cancel_subscription(_subscription_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions 
  SET cancel_at_period_end = true 
  WHERE id = _subscription_id;
  
  RETURN true;
END;
$$;

-- RPC Function: Generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _invoice_number TEXT;
  _month TEXT := to_char(now(), 'YYYYMM');
  _seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(substring(invoice_number FROM 7) AS INTEGER)), 0) + 1 
  INTO _seq
  FROM public.invoices 
  WHERE invoice_number LIKE 'INV-' || _month || '%';
  
  _invoice_number := 'INV-' || _month || '-' || LPAD(_seq::TEXT, 4, '0');
  RETURN _invoice_number;
END;
$$;

-- Triggers
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
