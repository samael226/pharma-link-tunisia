// Provider-agnostic payment contract. Business logic only talks to this interface.
export type ProviderId = "stripe" | "flouci" | "konnect" | "bank_transfer" | "corporate_invoice";

export interface CheckoutInput {
  pharmacyId: string;
  planCode: string;
  planName: string;
  amountMillimes: number;
  email: string;
  customerId?: string | null;
  priceRef?: string | null;
  couponPercentOff?: number | null;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentProvider {
  id: ProviderId;
  available: boolean;
  createCheckout(input: CheckoutInput): Promise<{ url: string; customerId?: string; priceRef?: string }>;
  cancelAtPeriodEnd(subscriptionRef: string, cancel: boolean): Promise<void>;
  changePlan(subscriptionRef: string, priceRef: string): Promise<void>;
  portalUrl(customerId: string, returnUrl: string): Promise<string>;
}
