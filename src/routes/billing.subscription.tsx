import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SubscriptionCard } from "@/components/billing/SubscriptionCard";
import { getSubscription, getSubscriptionPlans, changeSubscriptionPlan, cancelSubscription } from "@/lib/api/subscriptions";
import { getInvoices } from "@/lib/api/invoices";
import { InvoiceList } from "@/components/billing/InvoiceList";

export const Route = createFileRoute("/billing/subscription")({
  head: () => ({ meta: [{ title: "PharmaLink — Subscription" }] }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { user, primaryRole } = useAuth();
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  // Get pharmacy ID for the current user
  const { data: pharmacy } = useQuery({
    queryKey: ["pharmacy", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("pharmacies")
        .select("id")
        .eq("owner_id", user?.id)
        .single();
      return data;
    },
    enabled: !!user && primaryRole === "pharmacy_owner",
  });

  // Get current subscription
  const { data: subscription, refetch: refetchSubscription } = useQuery({
    queryKey: ["subscription", pharmacy?.id],
    queryFn: () => getSubscription(pharmacy!.id),
    enabled: !!pharmacy?.id,
  });

  // Get all plans
  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getSubscriptionPlans,
  });

  // Get invoices
  const { data: invoices } = useQuery({
    queryKey: ["invoices", subscription?.id],
    queryFn: () => getInvoices(subscription!.id),
    enabled: !!subscription?.id,
  });

  const handleUpgrade = async (planId: string) => {
    if (!subscription?.id) return;
    
    try {
      await changeSubscriptionPlan(subscription.id, planId);
      toast.success("Subscription upgraded successfully");
      refetchSubscription();
    } catch (error) {
      toast.error("Failed to upgrade subscription");
    }
  };

  const handleCancel = async () => {
    if (!subscription?.id) return;
    
    try {
      await cancelSubscription(subscription.id);
      toast.success("Subscription cancelled");
      refetchSubscription();
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  if (!pharmacy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

      {subscription && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          <SubscriptionCard
            plan={subscription.subscription_plans!}
            currentSubscription={subscription}
            isCurrentPlan={true}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans?.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              currentSubscription={subscription || undefined}
              isCurrentPlan={subscription?.plan_id === plan.id}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      </div>

      {invoices && invoices.length > 0 && (
        <InvoiceList invoices={invoices} />
      )}
    </div>
  );
}
