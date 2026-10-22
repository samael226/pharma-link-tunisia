// Pure, client-safe billing rules. Amounts are in millimes (1 TND = 1000 millimes).
export type PlanCode = "starter" | "professional" | "enterprise";
export type SubStatus =
  | "trial" | "active" | "past_due" | "suspended" | "cancelled" | "expired" | "pending_payment" | "grace_period";

export type Feature =
  | "profile" | "listing" | "reservations" | "basic_analytics"
  | "prescriptions" | "inventory" | "notifications" | "advanced_analytics"
  | "multi_branch" | "api_access" | "inventory_sync" | "priority_support";

const STARTER: Feature[] = ["profile", "listing", "reservations", "basic_analytics"];
const PRO: Feature[] = [...STARTER, "prescriptions", "inventory", "notifications", "advanced_analytics"];
const ENT: Feature[] = [...PRO, "multi_branch", "api_access", "inventory_sync", "priority_support"];

export const PLAN_CATALOG: Record<PlanCode, { name: string; priceMillimes: number; maxEmployees: number | null; maxBranches: number | null; features: Feature[] }> = {
  starter: { name: "Starter", priceMillimes: 39000, maxEmployees: 2, maxBranches: 1, features: STARTER },
  professional: { name: "Professional", priceMillimes: 79000, maxEmployees: 10, maxBranches: 1, features: PRO },
  enterprise: { name: "Enterprise", priceMillimes: 199000, maxEmployees: null, maxBranches: null, features: ENT },
};

export const FEATURE_LABELS: Record<Feature, string> = {
  profile: "Profil pharmacie", listing: "Catalogue médicaments", reservations: "Gestion des réservations",
  basic_analytics: "Statistiques de base", prescriptions: "Vérification d'ordonnances", inventory: "Gestion de stock",
  notifications: "Notifications", advanced_analytics: "Statistiques avancées", multi_branch: "Multi-succursales",
  api_access: "Accès API", inventory_sync: "Synchronisation de stock", priority_support: "Support prioritaire",
};

export const TRIAL_DAYS = 30;
export const GRACE_DAYS = 7;
export const VAT_RATE = 19;
/** Approximate rate used to charge cards in EUR, since card networks don't settle in TND. */
export const TND_PER_EUR = 3.4;

export function hasFeature(plan: PlanCode | null, feature: Feature): boolean {
  return !!plan && PLAN_CATALOG[plan].features.includes(feature);
}

export function withinLimit(plan: PlanCode | null, key: "employees" | "branches", current: number): boolean {
  const p = PLAN_CATALOG[plan ?? "starter"];
  const lim = key === "employees" ? p.maxEmployees : p.maxBranches;
  return lim === null || current < lim;
}

/** The plan whose features the pharmacy actually gets right now. Trials get Professional. */
export function effectivePlan(s: { status: SubStatus; plan: PlanCode; trialEndsAt?: string | null; periodEnd?: string | null }, now = new Date()): PlanCode | null {
  if (s.status === "trial") return s.trialEndsAt && new Date(s.trialEndsAt) > now ? "professional" : null;
  if (s.status === "active" || s.status === "past_due" || s.status === "grace_period") return s.plan;
  if (s.status === "cancelled") return s.periodEnd && new Date(s.periodEnd) > now ? s.plan : null;
  return null;
}

export function trialDaysLeft(trialEndsAt: string | null | undefined, now = new Date()): number {
  if (!trialEndsAt) return 0;
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / 86400000));
}

export type Coupon = { kind: "percent" | "fixed" | "free_months"; value: number };
export function applyCoupon(amount: number, c: Coupon | null): number {
  if (!c) return amount;
  if (c.kind === "percent") return Math.max(0, Math.round(amount * (1 - Math.min(c.value, 100) / 100)));
  if (c.kind === "fixed") return Math.max(0, amount - c.value);
  return 0; // free_months: first period free
}

export function computeInvoice(subtotal: number, discount: number, rate = VAT_RATE) {
  const net = Math.max(0, subtotal - discount);
  const tax = Math.round((net * rate) / 100);
  return { net, tax, total: net + tax };
}

const TRANSITIONS: Record<SubStatus, SubStatus[]> = {
  trial: ["pending_payment", "active", "expired", "cancelled"],
  pending_payment: ["active", "expired", "cancelled"],
  active: ["past_due", "cancelled", "active"],
  past_due: ["active", "grace_period", "cancelled"],
  grace_period: ["active", "suspended", "cancelled"],
  suspended: ["active", "cancelled"],
  cancelled: ["active", "expired"],
  expired: ["pending_payment", "active"],
};
export function canTransition(from: SubStatus, to: SubStatus) {
  return TRANSITIONS[from].includes(to);
}

export function formatTND(millimes: number) {
  return `${(millimes / 1000).toLocaleString("fr-TN", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND`;
}

export const STATUS_LABELS: Record<SubStatus, string> = {
  trial: "Essai", active: "Actif", past_due: "Paiement en retard", suspended: "Suspendu",
  cancelled: "Annulé", expired: "Expiré", pending_payment: "Paiement en attente", grace_period: "Période de grâce",
};
