import type { PaymentProvider, ProviderId } from "./types";
import { stripeProvider } from "./stripe.server";

const notYet = (id: ProviderId): PaymentProvider => ({
  id,
  available: false,
  createCheckout: async () => { throw new Error(`${id} not available yet`); },
  cancelAtPeriodEnd: async () => { throw new Error(`${id} not available yet`); },
  changePlan: async () => { throw new Error(`${id} not available yet`); },
  portalUrl: async () => { throw new Error(`${id} not available yet`); },
});

export function getProvider(id: ProviderId = "stripe"): PaymentProvider {
  switch (id) {
    case "stripe": return stripeProvider();
    default: return notYet(id);
  }
}
