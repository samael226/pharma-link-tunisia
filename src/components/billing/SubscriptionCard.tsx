import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currentSubscription?: Subscription | null;
  isCurrentPlan?: boolean;
  onUpgrade?: (planId: string) => void;
  onDowngrade?: (planId: string) => void;
  onCancel?: () => void;
}

export function SubscriptionCard({
  plan,
  currentSubscription,
  isCurrentPlan = false,
  onUpgrade,
  onDowngrade,
  onCancel,
}: SubscriptionCardProps) {
  const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || "[]");
  const isTrial = currentSubscription?.status === "trial";
  const isCancelled = currentSubscription?.cancel_at_period_end;

  return (
    <Card
      className={`relative p-6 transition-all ${
        isCurrentPlan
          ? "border-primary shadow-lg scale-105"
          : "border-border hover:border-primary/50"
      }`}
    >
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Current Plan
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold">{plan.price_tnd} TND</span>
          <span className="text-sm text-muted-foreground">/{plan.billing_interval}</span>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-success" />
          <span>{plan.max_branches} branch{plan.max_branches > 1 ? "es" : ""}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-success" />
          <span>{plan.max_medicines} medicines</span>
        </div>
        {features.map((feature: string, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-success" />
            <span className="capitalize">{feature.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {isCurrentPlan ? (
          <>
            {isTrial && (
              <Badge variant="secondary" className="w-full justify-center">
                <Star className="h-3 w-3 mr-1" />
                Trial ends {new Date(currentSubscription.trial_ends_at || "").toLocaleDateString()}
              </Badge>
            )}
            {isCancelled ? (
              <Badge variant="destructive" className="w-full justify-center">
                Cancels {new Date(currentSubscription.current_period_ends_at).toLocaleDateString()}
              </Badge>
            ) : (
              <Button variant="outline" className="w-full" onClick={onCancel}>
                Cancel Subscription
              </Button>
            )}
          </>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              if (onUpgrade) onUpgrade(plan.id);
              if (onDowngrade) onDowngrade(plan.id);
            }}
          >
            {plan.price_tnd > (currentSubscription?.price_tnd || 0) ? "Upgrade" : "Downgrade"}
          </Button>
        )}
      </div>
    </Card>
  );
}
