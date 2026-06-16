
-- 1. Inventory: drop unrestricted authenticated SELECT, add restricted version
DROP POLICY IF EXISTS "Inventory visible to authenticated" ON public.inventory;
CREATE POLICY "Inventory availability for authenticated"
ON public.inventory FOR SELECT TO authenticated
USING (
  is_branch_member(auth.uid(), branch_id)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR quantity > 0
);

-- 2. Pharmacies: remove anon access to contact columns
REVOKE SELECT ON public.pharmacies FROM anon;
GRANT SELECT (id, name, license_number, status, owner_id, created_at, updated_at) ON public.pharmacies TO anon;

-- 3. Audit logs: drop client INSERT policy
DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.audit_logs;
REVOKE INSERT ON public.audit_logs FROM authenticated;

-- 4. SECURITY DEFINER functions: lock down execute
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_pharmacy_status(uuid, pharmacy_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_pharmacy_status(uuid, pharmacy_status) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_branch_member(uuid, uuid) FROM PUBLIC, anon;
