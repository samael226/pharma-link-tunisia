import { supabase } from "@/integrations/supabase/client";

export async function getInvoices(subscriptionId: string) {
  return supabase
    .from("invoices")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false });
}

export async function getInvoice(invoiceId: string) {
  return supabase.from("invoices").select("*").eq("id", invoiceId).single();
}

export async function generateInvoiceNumber() {
  return supabase.rpc("generate_invoice_number");
}

export async function createInvoice(subscriptionId: string, amountTnd: number, dueDate: string) {
  const { data: invoiceNumber } = await generateInvoiceNumber();
  
  return supabase.from("invoices").insert({
    subscription_id: subscriptionId,
    invoice_number: invoiceNumber,
    amount_tnd: amountTnd,
    due_date: dueDate,
  }).select().single();
}

export async function updateInvoiceStatus(invoiceId: string, status: string, paidAt?: string) {
  return supabase
    .from("invoices")
    .update({
      status,
      paid_at: paidAt || new Date().toISOString(),
    })
    .eq("id", invoiceId);
}

export async function createPayment(
  invoiceId: string,
  amountTnd: number,
  paymentMethod: string,
  paymentId?: string,
  metadata?: any
) {
  return supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount_tnd: amountTnd,
    payment_method: paymentMethod,
    payment_id: paymentId,
    status: "pending",
    metadata,
  }).select().single();
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  return supabase
    .from("payments")
    .update({ status })
    .eq("id", paymentId);
}

export async function getPayments(invoiceId: string) {
  return supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false });
}
