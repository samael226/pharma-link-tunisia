import { supabase } from "@/integrations/supabase/client";

export async function getSubscription(pharmacyId: string) {
  return supabase
    .from("subscriptions")
    .select("*, subscription_plans(*)")
    .eq("pharmacy_id", pharmacyId)
    .single();
}

export async function createSubscription(pharmacyId: string, planTier: string) {
  return supabase.rpc("create_subscription", {
    _pharmacy_id: pharmacyId,
    _plan_tier: planTier,
  });
}

export async function updateSubscription(subscriptionId: string, planId: string) {
  return supabase
    .from("subscriptions")
    .update({ plan_id: planId })
    .eq("id", subscriptionId);
}

export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPlanTier: string
) {
  return supabase.rpc("change_subscription_plan", {
    _subscription_id: subscriptionId,
    _new_plan_tier: newPlanTier,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return supabase.rpc("cancel_subscription", { _subscription_id: subscriptionId });
}

export async function getSubscriptionPlans() {
  return supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_tnd", { ascending: true });
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  // This would require adding a stripe_subscription_id column to subscriptions table
  // For now, we'll skip this
  return null;
}
