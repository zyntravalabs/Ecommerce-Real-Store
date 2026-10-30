import { productById, type Product } from "./products";

export type Line = { id: string; qty: number };
export type Coupon = { code: string; pct: number; minSpend: number };
export const COUPONS: Coupon[] = [
  { code: "FRESH10", pct: 10, minSpend: 500 },
  { code: "WELCOME50", pct: 0, minSpend: 0 },
];

const r2 = (n: number) => Math.round(n * 100) / 100;

export type BillLine = { product: Product; qty: number; mrp: number; discount: number; taxable: number; gst: number; total: number };
export type Bill = { lines: BillLine[]; mrpTotal: number; discount: number; couponDiscount: number; gst: number; grandTotal: number; items: number };

/** Prices are pre-GST. Product discount first, then coupon on discounted value, then GST per product rate. */
export function computeBill(lines: Line[], couponCode?: string): Bill {
  const bl: BillLine[] = [];
  for (const l of lines) {
    const product = productById(l.id);
    if (!product || l.qty <= 0) continue;
    const mrp = r2(product.price * l.qty);
    const discount = r2((mrp * product.discountPct) / 100);
    bl.push({ product, qty: l.qty, mrp, discount, taxable: r2(mrp - discount), gst: 0, total: 0 });
  }
  const afterDiscount = bl.reduce((s, x) => s + x.taxable, 0);
  const coupon = COUPONS.find((c) => c.code === couponCode?.toUpperCase());
  let couponDiscount = 0;
  if (coupon && afterDiscount >= coupon.minSpend) {
    couponDiscount = coupon.code === "WELCOME50" ? Math.min(50, afterDiscount) : r2((afterDiscount * coupon.pct) / 100);
  }
  const ratio = afterDiscount > 0 ? (afterDiscount - couponDiscount) / afterDiscount : 0;
  for (const x of bl) {
    x.taxable = r2(x.taxable * ratio);
    x.gst = r2((x.taxable * x.product.gstPct) / 100);
    x.total = r2(x.taxable + x.gst);
  }
  return {
    lines: bl,
    mrpTotal: r2(bl.reduce((s, x) => s + x.mrp, 0)),
    discount: r2(bl.reduce((s, x) => s + x.discount, 0)),
    couponDiscount: r2(couponDiscount),
    gst: r2(bl.reduce((s, x) => s + x.gst, 0)),
    grandTotal: r2(bl.reduce((s, x) => s + x.total, 0)),
    items: bl.reduce((s, x) => s + x.qty, 0),
  };
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
