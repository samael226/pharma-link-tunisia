import type { PaymentProvider } from "./types";
import { TND_PER_EUR } from "../core";

async function stripe(path: string, params?: Record<string, string>, method = "POST") {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("[stripe]", path, json?.error?.message);
    throw new Error("Payment provider error");
  }
  return json;
}

export function stripeProvider(): PaymentProvider {
  return {
    id: "stripe",
    available: true,
    async createCheckout(i) {
      let priceRef = i.priceRef ?? undefined;
      if (!priceRef) {
        const product = await stripe("products", { name: `PharmaLink ${i.planName}`, "metadata[plan_code]": i.planCode });
        const cents = Math.round((i.amountMillimes / 1000 / TND_PER_EUR) * 100);
        const price = await stripe("prices", {
          product: product.id, currency: "eur", unit_amount: String(cents), "recurring[interval]": "month",
        });
        priceRef = price.id as string;
      }
      let customerId = i.customerId ?? undefined;
      if (!customerId) {
        const c = await stripe("customers", { email: i.email, "metadata[pharmacy_id]": i.pharmacyId });
        customerId = c.id as string;
      }
      const params: Record<string, string> = {
        mode: "subscription", customer: customerId,
        "line_items[0][price]": priceRef, "line_items[0][quantity]": "1",
        success_url: i.successUrl, cancel_url: i.cancelUrl,
        client_reference_id: i.pharmacyId,
        "metadata[pharmacy_id]": i.pharmacyId, "metadata[plan_code]": i.planCode,
        "subscription_data[metadata][pharmacy_id]": i.pharmacyId,
        "subscription_data[metadata][plan_code]": i.planCode,
      };
      if (i.couponPercentOff) {
        const cp = await stripe("coupons", { percent_off: String(i.couponPercentOff), duration: "once" });
        params["discounts[0][coupon]"] = cp.id;
      }
      const s = await stripe("checkout/sessions", params);
      return { url: s.url as string, customerId, priceRef };
    },
    async cancelAtPeriodEnd(ref, cancel) {
      await stripe(`subscriptions/${ref}`, { cancel_at_period_end: String(cancel) });
    },
    async changePlan(ref, priceRef) {
      const sub = await stripe(`subscriptions/${ref}`, undefined, "GET");
      await stripe(`subscriptions/${ref}`, {
        "items[0][id]": sub.items.data[0].id, "items[0][price]": priceRef, proration_behavior: "create_prorations",
      });
    },
    async portalUrl(customerId, returnUrl) {
      const s = await stripe("billing_portal/sessions", { customer: customerId, return_url: returnUrl });
      return s.url as string;
    },
  };
}

export async function stripeGet(path: string) {
  return stripe(path, undefined, "GET");
}
