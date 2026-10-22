CREATE TYPE public.subscription_status AS ENUM ('trial','active','past_due','suspended','cancelled','expired','pending_payment','grace_period');
CREATE TYPE public.invoice_status AS ENUM ('draft','open','paid','void','uncollectible');
CREATE TYPE public.payment_status AS ENUM ('pending','succeeded','failed','refunded');
CREATE TYPE public.coupon_type AS ENUM ('percent','fixed','free_months');

CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_millimes integer NOT NULL CHECK (price_millimes >= 0),
  currency text NOT NULL DEFAULT 'TND',
  interval text NOT NULL DEFAULT 'month',
  max_employees integer,
  max_branches integer,
  features text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  stripe_price_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans readable" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.subscription_plans (code,name,description,price_millimes,max_employees,max_branches,features,sort_order) VALUES
('starter','Starter','Pour démarrer',39000,2,1,ARRAY['profile','listing','reservations','basic_analytics'],1),
('professional','Professional','Pour les pharmacies actives',79000,10,1,ARRAY['profile','listing','reservations','basic_analytics','prescriptions','inventory','notifications','advanced_analytics'],2),
('enterprise','Enterprise','Réseaux multi-sites',199000,NULL,NULL,ARRAY['profile','listing','reservations','basic_analytics','prescriptions','inventory','notifications','advanced_analytics','multi_branch','api_access','inventory_sync','priority_support'],3);

CREATE TABLE public.billing_profiles (
  pharmacy_id uuid PRIMARY KEY REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  tax_id text,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  country text NOT NULL DEFAULT 'TN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL UNIQUE REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancelled_at timestamptz,
  provider text NOT NULL DEFAULT 'stripe',
  provider_customer_id text,
  provider_subscription_id text UNIQUE,
  coupon_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subs_status ON public.subscriptions(status);

CREATE TABLE public.subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  pharmacy_id uuid NOT NULL,
  from_status public.subscription_status,
  to_status public.subscription_status NOT NULL,
  from_plan_id uuid,
  to_plan_id uuid,
  reason text,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subhist_pharmacy ON public.subscription_history(pharmacy_id, created_at DESC);

CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_method_id text NOT NULL,
  kind text NOT NULL DEFAULT 'card',
  brand text, last4 text, exp_month integer, exp_year integer,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pm_pharmacy ON public.payment_methods(pharmacy_id);

CREATE SEQUENCE public.invoice_number_seq;
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL DEFAULT ('INV-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text,6,'0')),
  pharmacy_id uuid NOT NULL REFERENCES public.pharmacies(id) ON DELETE RESTRICT,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  status public.invoice_status NOT NULL DEFAULT 'open',
  currency text NOT NULL DEFAULT 'TND',
  subtotal_millimes integer NOT NULL DEFAULT 0,
  discount_millimes integer NOT NULL DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 19,
  tax_millimes integer NOT NULL DEFAULT 0,
  total_millimes integer NOT NULL DEFAULT 0,
  period_start timestamptz, period_end timestamptz,
  customer_snapshot jsonb NOT NULL DEFAULT '{}',
  plan_name text,
  provider_invoice_id text UNIQUE,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_inv_pharmacy ON public.invoices(pharmacy_id, created_at DESC);

CREATE TABLE public.invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_millimes integer NOT NULL,
  amount_millimes integer NOT NULL
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES public.pharmacies(id) ON DELETE RESTRICT,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  provider text NOT NULL,
  provider_payment_id text UNIQUE,
  amount_millimes integer NOT NULL,
  currency text NOT NULL DEFAULT 'TND',
  status public.payment_status NOT NULL DEFAULT 'pending',
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_pharmacy ON public.payments(pharmacy_id, created_at DESC);
CREATE INDEX idx_pay_status ON public.payments(status);

CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount_millimes integer NOT NULL,
  reason text,
  provider_refund_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  kind public.coupon_type NOT NULL,
  value integer NOT NULL CHECK (value > 0),
  max_redemptions integer,
  redemptions integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  plan_codes text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  pharmacy_id uuid NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, pharmacy_id)
);
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.tax_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL UNIQUE,
  name text NOT NULL,
  rate numeric(5,2) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.tax_config (country,name,rate) VALUES ('TN','TVA',19);

CREATE TABLE public.usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  metric text NOT NULL,
  period date NOT NULL DEFAULT date_trunc('month', now())::date,
  quantity bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pharmacy_id, metric, period)
);
CREATE TABLE public.billing_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid,
  actor_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bal_pharmacy ON public.billing_audit_logs(pharmacy_id, created_at DESC);
CREATE TABLE public.billing_rate_limits (
  user_id uuid NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, action, window_start)
);
CREATE TABLE public.webhook_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- ownership helper
CREATE OR REPLACE FUNCTION public.is_pharmacy_owner(_user uuid, _pharmacy uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.pharmacies WHERE id = _pharmacy AND owner_id = _user)
$$;

-- grants + RLS
GRANT SELECT, INSERT, UPDATE ON public.billing_profiles TO authenticated;
GRANT SELECT ON public.subscriptions, public.subscription_history, public.payment_methods, public.invoices, public.invoice_line_items, public.payments, public.refunds, public.usage_metrics, public.billing_audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons, public.promotions, public.tax_config TO authenticated;
GRANT UPDATE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.billing_profiles, public.subscriptions, public.subscription_history, public.payment_methods, public.invoices, public.invoice_line_items, public.payments, public.refunds, public.coupons, public.coupon_redemptions, public.promotions, public.tax_config, public.usage_metrics, public.billing_audit_logs, public.billing_rate_limits, public.webhook_events TO service_role;
GRANT USAGE ON SEQUENCE public.invoice_number_seq TO service_role;

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans admin update" ON public.subscription_plans FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin read" ON public.billing_profiles FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner insert" ON public.billing_profiles FOR INSERT TO authenticated WITH CHECK (public.is_pharmacy_owner(auth.uid(), pharmacy_id));
CREATE POLICY "Owner update" ON public.billing_profiles FOR UPDATE TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id)) WITH CHECK (public.is_pharmacy_owner(auth.uid(), pharmacy_id));
CREATE POLICY "Owner/admin read" ON public.subscriptions FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.is_branch_member(auth.uid(), (SELECT b.id FROM public.branches b WHERE b.pharmacy_id = subscriptions.pharmacy_id LIMIT 1)) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin read" ON public.subscription_history FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin read" ON public.payment_methods FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin read" ON public.invoices FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin read" ON public.invoice_line_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND (public.is_pharmacy_owner(auth.uid(), i.pharmacy_id) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Owner/admin read" ON public.payments FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin read" ON public.refunds FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage" ON public.promotions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Read tax" ON public.tax_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage tax" ON public.tax_config FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner/admin read" ON public.usage_metrics FOR SELECT TO authenticated USING (public.is_pharmacy_owner(auth.uid(), pharmacy_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin read" ON public.billing_audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.is_pharmacy_owner(auth.uid(), pharmacy_id));

-- feature helpers
CREATE OR REPLACE FUNCTION public.effective_plan_code(_pharmacy uuid) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN s.status = 'trial' AND s.trial_ends_at > now() THEN 'professional'
    WHEN s.status IN ('active','past_due','grace_period') THEN p.code
    WHEN s.status = 'cancelled' AND s.current_period_end > now() THEN p.code
    ELSE NULL END
  FROM public.subscriptions s JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.pharmacy_id = _pharmacy
$$;
CREATE OR REPLACE FUNCTION public.has_feature(_pharmacy uuid, _feature text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT _feature = ANY(features) FROM public.subscription_plans WHERE code = public.effective_plan_code(_pharmacy)), false)
$$;
CREATE OR REPLACE FUNCTION public.plan_limit(_pharmacy uuid, _key text) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE _key WHEN 'employees' THEN max_employees WHEN 'branches' THEN max_branches END
  FROM public.subscription_plans WHERE code = COALESCE(public.effective_plan_code(_pharmacy),'starter')
$$;
GRANT EXECUTE ON FUNCTION public.effective_plan_code(uuid), public.has_feature(uuid,text), public.plan_limit(uuid,text), public.is_pharmacy_owner(uuid,uuid) TO authenticated, service_role;

-- trial on new pharmacy
CREATE OR REPLACE FUNCTION public.start_trial_for_pharmacy() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sid uuid;
BEGIN
  INSERT INTO public.subscriptions (pharmacy_id, plan_id, status, trial_ends_at)
  SELECT NEW.id, id, 'trial', now() + interval '30 days' FROM public.subscription_plans WHERE code = 'professional'
  ON CONFLICT (pharmacy_id) DO NOTHING RETURNING id INTO sid;
  IF sid IS NOT NULL THEN
    INSERT INTO public.subscription_history (subscription_id, pharmacy_id, to_status, reason, actor_id)
    VALUES (sid, NEW.id, 'trial', 'trial_started', NEW.owner_id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_pharmacy_trial AFTER INSERT ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION public.start_trial_for_pharmacy();
INSERT INTO public.subscriptions (pharmacy_id, plan_id, status, trial_ends_at)
SELECT ph.id, (SELECT id FROM public.subscription_plans WHERE code='professional'), 'trial', now() + interval '30 days'
FROM public.pharmacies ph ON CONFLICT DO NOTHING;

-- limits
CREATE OR REPLACE FUNCTION public.enforce_branch_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim integer; cnt integer;
BEGIN
  lim := public.plan_limit(NEW.pharmacy_id, 'branches');
  IF lim IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO cnt FROM public.branches WHERE pharmacy_id = NEW.pharmacy_id;
  IF cnt >= lim THEN RAISE EXCEPTION 'plan_limit_branches'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_branch_limit BEFORE INSERT ON public.branches FOR EACH ROW EXECUTE FUNCTION public.enforce_branch_limit();
CREATE OR REPLACE FUNCTION public.enforce_staff_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ph uuid; lim integer; cnt integer;
BEGIN
  SELECT pharmacy_id INTO ph FROM public.branches WHERE id = NEW.branch_id;
  lim := public.plan_limit(ph, 'employees');
  IF lim IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO cnt FROM public.branch_staff s JOIN public.branches b ON b.id = s.branch_id WHERE b.pharmacy_id = ph;
  IF cnt >= lim THEN RAISE EXCEPTION 'plan_limit_employees'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_staff_limit BEFORE INSERT ON public.branch_staff FOR EACH ROW EXECUTE FUNCTION public.enforce_staff_limit();

-- usage tracking
CREATE OR REPLACE FUNCTION public.record_usage(_pharmacy uuid, _metric text, _qty bigint DEFAULT 1) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.usage_metrics (pharmacy_id, metric, quantity) VALUES (_pharmacy, _metric, _qty)
  ON CONFLICT (pharmacy_id, metric, period) DO UPDATE SET quantity = usage_metrics.quantity + EXCLUDED.quantity, updated_at = now()
$$;
REVOKE EXECUTE ON FUNCTION public.record_usage(uuid,text,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_usage(uuid,text,bigint) TO service_role;
CREATE OR REPLACE FUNCTION public.track_reservation_usage() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ph uuid;
BEGIN
  SELECT pharmacy_id INTO ph FROM public.branches WHERE id = NEW.branch_id;
  IF ph IS NOT NULL THEN PERFORM public.record_usage(ph, 'reservations', 1); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_reservation_usage AFTER INSERT ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.track_reservation_usage();

-- inventory gated by plan
CREATE OR REPLACE FUNCTION public.enforce_inventory_feature() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ph uuid;
BEGIN
  SELECT pharmacy_id INTO ph FROM public.branches WHERE id = NEW.branch_id;
  IF NOT public.has_feature(ph, 'inventory') THEN RAISE EXCEPTION 'plan_feature_inventory'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_inventory_feature BEFORE INSERT OR UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.enforce_inventory_feature();

-- rate limit helper
CREATE OR REPLACE FUNCTION public.hit_rate_limit(_action text, _max integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w timestamptz := date_trunc('hour', now()); c integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  INSERT INTO public.billing_rate_limits (user_id, action, window_start, count) VALUES (auth.uid(), _action, w, 1)
  ON CONFLICT (user_id, action, window_start) DO UPDATE SET count = billing_rate_limits.count + 1 RETURNING count INTO c;
  RETURN c <= _max;
END $$;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(text,integer) TO authenticated;

CREATE TRIGGER trg_sub_touch BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_bp_touch BEFORE UPDATE ON public.billing_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_plan_touch BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();