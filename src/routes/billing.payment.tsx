import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PaymentMethod } from "@/components/billing/PaymentMethod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/billing/payment")({
  head: () => ({ meta: [{ title: "PharmaLink — Payment Method" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const handleSave = (paymentMethod: any) => {
    // Handle payment method save
    setShowForm(false);
    navigate({ to: "/billing/subscription" });
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: "/billing/subscription" })} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Subscription
      </Button>

      <h1 className="text-3xl font-bold mb-8">Payment Method</h1>

      {!showForm ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">Add a payment method to upgrade your subscription.</p>
          <Button onClick={() => setShowForm(true)}>Add Payment Method</Button>
        </div>
      ) : (
        <PaymentMethod onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  );
}
