# PharmaLink Billing & Subscription System

A complete way for pharmacies to pay: 3 monthly plans, 30-day free trial, card payments through your Stripe account, invoices, coupons, plan-based feature access, usage tracking, and an admin revenue dashboard.

## Plans

| Plan | TND / month | Employees | Branches | Adds |
|---|---|---|---|---|
| Starter | 39 | 2 | 1 | Profile, listings, reservations, basic analytics |
| Professional | 79 | 10 | 1 | Prescription checks, inventory, notifications, advanced analytics |
| Enterprise | 199 | Unlimited | Unlimited | Multi-branch, API access, inventory sync, priority support |

Patients stay free. Every new pharmacy starts a 30-day trial (Professional features, no card), with a countdown banner across the app and upgrade prompts when it runs out.

## Subscription lifecycle

```text
TRIAL -> PENDING_PAYMENT -> ACTIVE -> (payment fails) PAST_DUE -> GRACE_PERIOD (7d) -> SUSPENDED
TRIAL -> (no payment) EXPIRED
ACTIVE -> CANCELLED (at period end) -> reactivate -> ACTIVE
```
Every change is recorded in a history log with who did it and why.

## Screens

Pharmacy owner:
- Billing overview: current plan, status, renewal date, trial countdown, quick actions
- Plans page: 3-tier pricing, feature comparison, coupon field
- Checkout: plan -> review features -> billing info (legal name, tax ID, address) -> pay by card -> confirmation
- Invoices list + printable invoice (save as PDF)
- Payment history, payment methods, upgrade / downgrade / cancel / reactivate

Admin:
- Revenue dashboard: MRR, ARR, active subs, trials, churn, trial conversion, plan mix, failed payments, top customers, simple forecast
- Subscriptions table with filters
- Coupons manager (percent, fixed, free months, expiry, usage limits)
- Plans editor (prices, features, limits)

Design: clean Stripe/Linear-style cards, existing colors, light and dark mode, mobile friendly.

## Feature gating (enforced at every layer)

- Database: access rules check the pharmacy's plan before allowing gated actions
- Server: every gated action checks the plan first
- Screens: locked features show an "Upgrade to unlock" card
- Limits: adding employees/branches past the plan limit is blocked

## Invoices

Number format INV-2026-000001, Tunisia VAT 19%, customer + pharmacy details, plan, period, tax, total, status, payment date. Kept permanently; only the owner and admins can open them. PDF via a print-ready invoice page.

## Payments

Card payments (Visa, Mastercard) via Stripe's hosted checkout — card numbers never touch our servers. Built behind a provider layer so Tunisian gateways, mobile payments, bank transfer and corporate invoicing can be plugged in later without changing business rules (these ship as ready-to-implement slots, not live).

## Technical details

- One migration: enums (subscription_status, invoice_status, payment_status, coupon_type), tables `subscription_plans`, `billing_profiles`, `subscriptions`, `subscription_history`, `payment_methods`, `payments`, `invoices`, `invoice_line_items`, `coupons`, `coupon_redemptions`, `promotions`, `refunds`, `tax_config`, `usage_metrics`, `billing_audit_logs`; amounts in millimes (integer); indexes on pharmacy/status/date; RLS + GRANTs (owner reads own via pharmacy owner_id, admin via has_role).
- SQL helpers: `current_plan_code(pharmacy)`, `has_feature(pharmacy, code)`, `plan_limit(pharmacy, key)`, `start_trial` trigger on pharmacy insert (backfill existing pharmacies), `record_usage`, invoice number sequence, limit-check triggers on branch_staff/branches.
- Stripe: 3 products/prices created in TND; IDs stored on plans. If TND isn't supported by the account, fall back to EUR with a shown conversion note.
- Server functions (`src/lib/billing/*.functions.ts`, `requireSupabaseAuth`): subscription, billing profile, checkout session, change plan, cancel/resume, invoices, payments, coupon validation, admin metrics/coupons/plans (admin role checked).
- Provider interface `src/lib/billing/providers/` with Stripe implementation + stubs.
- Webhook `/api/public/stripe-webhook` with signature verification (needs STRIPE_WEBHOOK_SECRET — I'll request it after the URL exists) handling checkout completed, subscription updated/deleted, invoice paid/failed.
- Hourly-safe endpoint for trial expiry / grace period transitions (secret-protected).
- Simple per-user rate limit on checkout creation (DB counter).
- Tests (vitest): plan limits, feature matrix per plan, coupon math, VAT calc, state transitions.

## Not live in this round

Local Tunisian gateways, mobile money, bank transfer flows (slots only), invoice emails, dunning emails, server-generated PDFs.
