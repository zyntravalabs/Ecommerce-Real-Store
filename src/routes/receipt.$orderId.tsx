import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket";
import { computeBill, inr } from "@/lib/billing";

export const Route = createFileRoute("/receipt/$orderId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your receipt — FreshMart" },
      { name: "description", content: "Digital receipt for your FreshMart order." },
      { property: "og:title", content: "Your receipt — FreshMart" },
      { property: "og:description", content: "Digital receipt for your FreshMart order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { orderId } = Route.useParams();
  const r = useBasket((s) => s.receipts.find((x) => x.orderId === orderId));
  if (!r) return <div className="grid min-h-dvh place-items-center">Receipt not found. <Link to="/" className="text-primary underline">Home</Link></div>;
  const bill = computeBill(r.lines, r.coupon);
  return (
    <div className="min-h-dvh bg-secondary px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-card p-6 font-mono text-sm shadow-xl">
        <h1 className="text-center font-display text-3xl font-extrabold text-primary">FreshMart</h1>
        <p className="text-center text-xs text-muted-foreground">3D Virtual Supermarket</p>
        <div className="my-3 rounded-lg bg-warning p-2 text-center text-xs font-bold text-warning-foreground">{r.status}</div>
        <div className="space-y-0.5 text-xs">
          <p>Order ID: {r.orderId}</p><p>Transaction ID: {r.txnId}</p>
          <p>Date: {new Date(r.date).toLocaleString("en-IN")}</p><p>Payment method: {r.method} (test)</p>
        </div>
        <table className="my-3 w-full border-y border-dashed py-2 text-xs">
          <thead><tr className="text-left"><th>Item</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">GST</th><th className="text-right">Amt</th></tr></thead>
          <tbody>{bill.lines.map((l) => (
            <tr key={l.product.id}><td>{l.product.name}</td><td className="text-right">{l.qty}</td><td className="text-right">{(l.mrp / l.qty).toFixed(2)}</td><td className="text-right">{l.product.gstPct}%</td><td className="text-right">{l.total.toFixed(2)}</td></tr>
          ))}</tbody>
        </table>
        <div className="space-y-0.5">
          <L k="Subtotal" v={inr(bill.mrpTotal)} /><L k="Discounts" v={"−" + inr(bill.discount + bill.couponDiscount)} />
          <L k="GST" v={inr(bill.gst)} /><L k="Total" v={inr(bill.grandTotal)} b />
        </div>
        <div className="no-print mt-6 flex gap-2">
          <Button className="flex-1" variant="outline" onClick={() => window.print()}>Download PDF</Button>
          <Button asChild className="flex-1"><Link to="/store">Continue shopping</Link></Button>
        </div>
      </div>
    </div>
  );
}
const L = ({ k, v, b }: { k: string; v: string; b?: boolean }) => <div className={`flex justify-between ${b ? "text-lg font-bold" : ""}`}><span>{k}</span><span>{v}</span></div>;
