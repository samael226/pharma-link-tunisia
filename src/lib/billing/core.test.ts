import { describe, it, expect } from "vitest";
import { PLAN_CATALOG, hasFeature, withinLimit, applyCoupon, computeInvoice, canTransition, effectivePlan, trialDaysLeft } from "./core";

describe("plans", () => {
  it("prices are 39 / 79 / 199 TND", () => {
    expect(PLAN_CATALOG.starter.priceMillimes).toBe(39000);
    expect(PLAN_CATALOG.professional.priceMillimes).toBe(79000);
    expect(PLAN_CATALOG.enterprise.priceMillimes).toBe(199000);
  });
  it("starter cannot use inventory sync, multi-branch or API", () => {
    expect(hasFeature("starter", "inventory_sync")).toBe(false);
    expect(hasFeature("starter", "multi_branch")).toBe(false);
    expect(hasFeature("starter", "api_access")).toBe(false);
  });
  it("professional cannot use enterprise features but has inventory", () => {
    expect(hasFeature("professional", "multi_branch")).toBe(false);
    expect(hasFeature("professional", "inventory")).toBe(true);
    expect(hasFeature("enterprise", "api_access")).toBe(true);
  });
  it("employee limits 2 / 10 / unlimited", () => {
    expect(withinLimit("starter", "employees", 2)).toBe(false);
    expect(withinLimit("starter", "employees", 1)).toBe(true);
    expect(withinLimit("professional", "employees", 10)).toBe(false);
    expect(withinLimit("enterprise", "employees", 500)).toBe(true);
  });
});

describe("trial", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  it("active trial gets professional features", () => {
    expect(effectivePlan({ status: "trial", plan: "starter", trialEndsAt: "2026-01-20T00:00:00Z" }, now)).toBe("professional");
  });
  it("expired trial gets nothing", () => {
    expect(effectivePlan({ status: "trial", plan: "starter", trialEndsAt: "2025-12-01T00:00:00Z" }, now)).toBe(null);
  });
  it("counts days left", () => {
    expect(trialDaysLeft("2026-01-31T00:00:00Z", now)).toBe(30);
  });
});

describe("money", () => {
  it("coupons", () => {
    expect(applyCoupon(79000, { kind: "percent", value: 20 })).toBe(63200);
    expect(applyCoupon(39000, { kind: "fixed", value: 50000 })).toBe(0);
    expect(applyCoupon(199000, { kind: "free_months", value: 1 })).toBe(0);
  });
  it("19% VAT", () => {
    expect(computeInvoice(79000, 0)).toEqual({ net: 79000, tax: 15010, total: 94010 });
  });
});

describe("states", () => {
  it("allowed and forbidden transitions", () => {
    expect(canTransition("past_due", "grace_period")).toBe(true);
    expect(canTransition("grace_period", "suspended")).toBe(true);
    expect(canTransition("expired", "trial")).toBe(false);
  });
});
