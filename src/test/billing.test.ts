import { describe, expect, it } from "vitest";
import { computeBill } from "@/lib/billing";

describe("bill", () => {
  it("rice ₹100 x2 + milk ₹60 x1 = ₹260 subtotal; rice 5% GST, milk 0%", () => {
    const b = computeBill([{ id: "rice", qty: 2 }, { id: "milk", qty: 1 }]);
    expect(b.mrpTotal).toBe(260);
    expect(b.gst).toBe(10);
    expect(b.grandTotal).toBe(270);
  });
  it("applies product discount before GST", () => {
    const b = computeBill([{ id: "apple", qty: 1 }]); // 180, 10% off, 0% GST
    expect(b.discount).toBe(18);
    expect(b.grandTotal).toBe(162);
  });
  it("FRESH10 needs ₹500 spend", () => {
    expect(computeBill([{ id: "rice", qty: 2 }], "FRESH10").couponDiscount).toBe(0);
    expect(computeBill([{ id: "rice", qty: 5 }], "FRESH10").couponDiscount).toBe(50);
  });
});
