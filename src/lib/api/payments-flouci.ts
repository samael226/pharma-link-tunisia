import { supabase } from "@/integrations/supabase/client";

const FLOUCI_API_KEY = import.meta.env.VITE_FLOUCI_API_KEY;
const FLOUCI_API_URL = "https://api.flouci.com/api/v1";

export interface FlouciPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: {
    subscription_id?: string;
    pharmacy_id?: string;
    invoice_id?: string;
  };
  success_url: string;
  cancel_url: string;
}

export async function createFlouciPayment(request: FlouciPaymentRequest) {
  const response = await fetch(`${FLOUCI_API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FLOUCI_API_KEY}`,
    },
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      metadata: request.metadata,
      success_url: request.success_url,
      cancel_url: request.cancel_url,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Flouci payment");
  }

  return response.json();
}

export async function getFlouciPayment(paymentId: string) {
  const response = await fetch(`${FLOUCI_API_URL}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${FLOUCI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Flouci payment");
  }

  return response.json();
}

// Bank transfer functions
export async function createBankTransferPayment(
  invoiceId: string,
  amount: number,
  pharmacyId: string,
) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      amount_tnd: amount,
      payment_method: "bank_transfer",
      status: "pending",
      metadata: {
        pharmacy_id: pharmacyId,
        payment_type: "bank_transfer",
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function confirmBankTransferPayment(paymentId: string) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "success" })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBankTransferInstructions() {
  return {
    bank_name: "Banque de Tunisie",
    account_name: "PharmaLink Tunisia",
    account_number: "12345678901234567890",
    rib: "00000000000000000000",
    swift_code: "BKTNTNTT",
    notes: "Please include your invoice number in the transfer reference",
  };
}
