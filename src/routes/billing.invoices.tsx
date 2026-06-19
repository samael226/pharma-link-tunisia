import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { InvoiceList } from "@/components/billing/InvoiceList";
import { getInvoices } from "@/lib/api/invoices";
import { toast } from "sonner";

export const Route = createFileRoute("/billing/invoices")({
  head: () => ({ meta: [{ title: "PharmaLink — Invoices" }] }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { user, primaryRole } = useAuth();

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

  // Get subscription
  const { data: subscription } = useQuery({
    queryKey: ["subscription", pharmacy?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("pharmacy_id", pharmacy?.id)
        .single();
      return data;
    },
    enabled: !!pharmacy?.id,
  });

  // Get invoices
  const { data: invoices, refetch } = useQuery({
    queryKey: ["invoices", subscription?.id],
    queryFn: () => getInvoices(subscription!.id),
    enabled: !!subscription?.id,
  });

  const handleDownload = (invoiceId: string) => {
    toast.info("Invoice download will be available after payment processing");
  };

  const handlePay = (invoiceId: string) => {
    toast.info("Payment integration coming soon");
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
      <h1 className="text-3xl font-bold mb-8">Invoices</h1>
      {invoices ? (
        <InvoiceList invoices={invoices} onDownload={handleDownload} onPay={handlePay} />
      ) : (
        <p className="text-muted-foreground">No invoices yet</p>
      )}
    </div>
  );
}
