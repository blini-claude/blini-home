import { describe, it, expect } from "vitest";
import { applyMarkup } from "@/lib/sync/markup";

describe("applyMarkup", () => {
  it("adds 5% for kubik/benny/sivegeta", () => {
    expect(applyMarkup(100, "kubik")).toBeCloseTo(104.99, 2);
    expect(applyMarkup(100, "benny")).toBeCloseTo(104.99, 2);
    expect(applyMarkup(100, "sivegeta")).toBeCloseTo(104.99, 2);
  });
  it("leaves unknown/legacy stores unchanged", () => {
    expect(applyMarkup(100, "shporta")).toBe(100);
  });
  it("does not .99-round sub-1 prices", () => {
    expect(applyMarkup(0.5, "kubik")).toBeCloseTo(0.525, 3);
  });
  it("returns 0 for 0", () => {
    expect(applyMarkup(0, "kubik")).toBe(0);
  });
});
