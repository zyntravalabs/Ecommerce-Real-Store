import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBasket } from "@/lib/basket";
import { computeBill, inr } from "@/lib/billing";
import { PackSwatch } from "./PackSwatch";

export function BasketPanel() {
  const { lines, coupon, setQty, remove } = useBasket();
  const bill = computeBill(lines, coupon);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="pointer-events-auto relative flex items-center gap-3 rounded-full bg-primary px-5 py-3 font-display font-bold text-primary-foreground shadow-float">
          <ShoppingBasket className="size-5" />
          <span>{inr(bill.grandTotal)}</span>
          <span id="basket-count" className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-accent text-xs text-accent-foreground">{bill.items}</span>
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader><SheetTitle className="font-display text-2xl">Your basket</SheetTitle></SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {bill.lines.length === 0 && <p className="py-10 text-center text-muted-foreground">Basket is empty. Click a product on a shelf to pick it up.</p>}
          {bill.lines.map((l) => (
            <div key={l.product.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <PackSwatch product={l.product} small />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{l.product.name}</p>
                <p className="text-xs text-muted-foreground">{inr(l.mrp / l.qty)} each{l.product.discountPct ? ` · ${l.product.discountPct}% off` : ""} · GST {l.product.gstPct}%</p>
                <div className="mt-1 flex items-center gap-2">
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setQty(l.product.id, l.qty - 1)} aria-label="Decrease"><Minus /></Button>
                  <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                  <Button size="icon" variant="outline" className="size-7" onClick={() => setQty(l.product.id, l.qty + 1)} aria-label="Increase" disabled={l.qty >= l.product.stock}><Plus /></Button>
                  <Button size="icon" variant="ghost" className="ml-auto size-7" onClick={() => remove(l.product.id)} aria-label="Remove"><Trash2 /></Button>
                </div>
              </div>
              <span className="font-bold">{inr(l.mrp - l.discount)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1 border-t p-4 text-sm">
          <Row k="Subtotal (MRP)" v={inr(bill.mrpTotal)} />
          <Row k="Discounts" v={"−" + inr(bill.discount + bill.couponDiscount)} />
          <Row k="GST" v={inr(bill.gst)} />
          <Row k="Grand total" v={inr(bill.grandTotal)} bold />
          <Button asChild className="mt-3 w-full" size="lg" disabled={!bill.items}>
            <Link to="/checkout">Go to billing counter</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "pt-1 font-display text-lg font-bold" : ""}`}><span>{k}</span><span>{v}</span></div>;
}
