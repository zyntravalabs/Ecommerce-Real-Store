import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { beep, useBasket } from "@/lib/basket";
import { COUPONS, computeBill, inr } from "@/lib/billing";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Billing counter — FreshMart" },
      { name: "description", content: "Review your FreshMart basket, see GST and discounts, and pay." },
      { property: "og:title", content: "Billing counter — FreshMart" },
      { property: "og:description", content: "Review your basket and pay." },
    ],
  }),
  component: Checkout,
});

const METHODS = ["UPI QR Code", "Google Pay", "PhonePe", "Paytm", "Debit Card", "Credit Card", "Net Banking"];

function Checkout() {
  const { lines, coupon, setCoupon, completeTestPayment } = useBasket();
  const bill = computeBill(lines, coupon);
  const [code, setCode] = useState(coupon ?? "");
  const [step, setStep] = useState<"review" | "pay">("review");
  const [method, setMethod] = useState<string>(METHODS[0]!);
  const nav = useNavigate();

  const apply = () => {
    const c = COUPONS.find((x) => x.code === code.trim().toUpperCase());
    if (!c) { toast.error("Coupon not valid"); return; }
    const b = computeBill(lines, c.code);
    if (!b.couponDiscount) { toast.error(`Spend at least ${inr(c.minSpend)} to use ${c.code}`); return; }
    setCoupon(c.code); toast.success(`${c.code} applied`);
  };
  const pay = () => {
    const r = completeTestPayment(method); beep(523, 0.15); setTimeout(() => beep(784, 0.25), 150);
    nav({ to: "/receipt/$orderId", params: { orderId: r.orderId } });
  };

  return (
    <div className="min-h-dvh bg-secondary px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/store" className="text-sm font-medium text-primary">← Back to the aisles</Link>
        <h1 className="mt-2 font-display text-4xl font-extrabold">Billing counter</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border-8 border-foreground bg-pos p-5 font-mono text-sm text-pos-foreground shadow-2xl">
            <div className="flex justify-between border-b border-dashed border-pos-foreground/40 pb-2"><span>FRESHMART POS · TILL 01</span><span>{new Date().toLocaleDateString("en-IN")}</span></div>
            {bill.lines.length === 0 && <p className="py-10 text-center">NO ITEMS SCANNED</p>}
            <table className="mt-2 w-full">
              <thead><tr className="text-left opacity-70"><th>ITEM</th><th className="text-right">QTY</th><th className="text-right">RATE</th><th className="text-right">AMT</th></tr></thead>
              <tbody>
                {bill.lines.map((l) => (
                  <tr key={l.product.id}><td className="truncate pr-2">{l.product.name}</td><td className="text-right">{l.qty}</td><td className="text-right">{(l.mrp / l.qty).toFixed(2)}</td><td className="text-right">{l.mrp.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 space-y-0.5 border-t border-dashed border-pos-foreground/40 pt-2">
              <P k="SUBTOTAL" v={bill.mrpTotal} /><P k="PRODUCT DISCOUNT" v={-bill.discount} />
              {bill.couponDiscount > 0 && <P k={`COUPON ${coupon}`} v={-bill.couponDiscount} />}
              <P k="GST" v={bill.gst} />
              <div className="flex justify-between pt-1 text-xl font-bold"><span>TOTAL</span><span>{inr(bill.grandTotal)}</span></div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-card p-5 shadow-lg">
            <div className="rounded-xl bg-warning p-3 text-sm text-warning-foreground">
              <b>Test payment mode.</b> Real UPI payments are not connected yet, so no money moves and orders are not real.
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Coupon</p>
              <div className="flex gap-2"><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="FRESH10 or WELCOME50" /><Button variant="outline" onClick={apply}>Apply</Button></div>
            </div>
            {step === "review" ? (
              <Button size="lg" className="w-full" disabled={!bill.items} onClick={() => setStep("pay")}>Proceed to payment · {inr(bill.grandTotal)}</Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Choose payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => <Button key={m} size="sm" variant={m === method ? "default" : "outline"} onClick={() => setMethod(m)}>{m}</Button>)}
                </div>
                <Button variant="hero" size="lg" className="w-full" onClick={pay}>Complete test payment</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function P({ k, v }: { k: string; v: number }) {
  return <div className="flex justify-between"><span>{k}</span><span>{v < 0 ? "−" : ""}{Math.abs(v).toFixed(2)}</span></div>;
}
