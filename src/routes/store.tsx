import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, LayoutGrid, Map, Search, X, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BasketPanel } from "@/components/store/BasketPanel";
import { PackSwatch } from "@/components/store/PackSwatch";
import { beep, useBasket } from "@/lib/basket";
import { CATEGORIES, PRODUCTS, productById, unitPrice, type Product } from "@/lib/products";
import { BOUNDS, FACES, faceSpot } from "@/lib/layout";
import { inr } from "@/lib/billing";
import { player } from "@/components/store/Scene";

const StoreScene = lazy(() => import("@/components/store/Scene").then((m) => ({ default: m.StoreScene })));

export const Route = createFileRoute("/store")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Inside the store — FreshMart 3D Supermarket" },
      { name: "description", content: "Walk the aisles of FreshMart in 3D, pick products off the shelves and fill your basket." },
      { property: "og:title", content: "Inside the store — FreshMart 3D Supermarket" },
      { property: "og:description", content: "Walk the aisles in 3D and fill your basket." },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const [selected, setSelected] = useState<Product>();
  const [nearCounter, setNearCounter] = useState(false);
  const [mode2d, setMode2d] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [q, setQ] = useState("");
  const { add, view, recent, lines } = useBasket();

  useEffect(() => { player.x = 0; player.z = 10; player.yaw = 0; }, []);

  const pick = (p: Product) => { setSelected(p); view(p.id); beep(660, 0.06); };
  const addToBasket = (p: Product) => {
    if (add(p.id)) {
      beep(990); toast.success(`${p.name} added to basket`, { description: inr(unitPrice(p)) });
      document.getElementById("basket-count")?.animate([{ transform: "scale(1.6)" }, { transform: "scale(1)" }], { duration: 350 });
    } else toast.error(`Only ${p.stock} in stock`);
  };
  const goTo = (category: string) => {
    const f = FACES.find((x) => x.category === category); if (!f) return;
    const s = faceSpot(f); player.x = s.x; player.z = s.z; player.yaw = s.yaw; player.pitch = -0.1;
  };
  const results = q.trim() ? PRODUCTS.filter((p) => (p.name + p.brand + p.category).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const inBasket = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {!mode2d ? (
        <div className="absolute inset-0">
          <Suspense fallback={<div className="grid h-full place-items-center font-display text-xl text-muted-foreground">Opening the doors…</div>}>
            <StoreScene selectedId={selected?.id} onPick={pick} onNearCounter={setNearCounter} />
          </Suspense>
        </div>
      ) : (
        <TwoD onPick={pick} />
      )}

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start gap-2 p-3">
        <Link to="/" className="pointer-events-auto rounded-full bg-card/90 px-4 py-2.5 font-display font-extrabold text-primary shadow">FreshMart</Link>
        <div className="pointer-events-auto relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="rounded-full bg-card/95 pl-9" />
          {results.length > 0 && (
            <div className="absolute mt-1 w-full overflow-hidden rounded-xl border bg-card shadow-lg">
              {results.map((p) => (
                <button key={p.id} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { goTo(p.category); pick(p); setQ(""); }}>
                  <span>{p.name}</span><span className="text-muted-foreground">{inr(unitPrice(p))}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pointer-events-auto ml-auto flex gap-2">
          <Button variant="secondary" size="icon" onClick={() => setShowMap((v) => !v)} aria-label="Toggle store map"><Map /></Button>
          <Button variant="secondary" onClick={() => setMode2d((v) => !v)}>{mode2d ? <><Box /> 3D store</> : <><LayoutGrid /> 2D mode</>}</Button>
          <BasketPanel />
        </div>
      </div>

      {!mode2d && showMap && <MiniMap onGo={goTo} />}
      {!mode2d && <MoveControls />}

      {!mode2d && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-card/80 px-4 py-1.5 text-xs text-muted-foreground md:block">
          W A S D / arrows to walk · drag to look · click a product to inspect · billing counter is behind you at the entrance
        </p>
      )}

      {nearCounter && !mode2d && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <Button asChild variant="hero" size="xl"><Link to="/checkout">Pay at billing counter →</Link></Button>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-4 right-4 z-10 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-6 fade-in rounded-2xl border bg-card p-5 shadow-2xl">
          <button className="absolute right-3 top-3 text-muted-foreground" onClick={() => setSelected(undefined)} aria-label="Close"><X className="size-5" /></button>
          <div className="flex gap-4">
            <PackSwatch product={selected} />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">{selected.brand}</p>
              <h2 className="font-display text-xl font-bold leading-tight">{selected.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold">{inr(unitPrice(selected))}</span>
                {selected.discountPct > 0 && <><span className="text-sm text-muted-foreground line-through">{inr(selected.price)}</span><span className="rounded bg-accent px-1.5 text-xs font-bold text-accent-foreground">{selected.discountPct}% OFF</span></>}
              </div>
              <p className="text-xs text-muted-foreground">+ GST {selected.gstPct}%</p>
              <p className={`mt-1 text-xs font-medium ${selected.stock - inBasket(selected.id) <= 8 ? "text-destructive" : "text-primary"}`}>
                {selected.stock - inBasket(selected.id) <= 0 ? "Out of stock" : selected.stock - inBasket(selected.id) <= 8 ? `Only ${selected.stock - inBasket(selected.id)} left!` : `${selected.stock - inBasket(selected.id)} in stock`}
              </p>
            </div>
          </div>
          <Button className="mt-4 w-full" size="lg" onClick={() => addToBasket(selected)} disabled={inBasket(selected.id) >= selected.stock}>Add to basket</Button>
          {recent.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1 text-xs">
              <span className="text-muted-foreground">Recently viewed:</span>
              {recent.filter((id) => id !== selected.id).slice(0, 4).map((id) => {
                const p = productById(id)!; return <button key={id} className="underline" onClick={() => setSelected(p)}>{p.brand}</button>;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniMap({ onGo }: { onGo: (c: string) => void }) {
  const dot = useRef<HTMLDivElement>(null);
  const W = BOUNDS.xMax - BOUNDS.xMin + 4, H = BOUNDS.zMax - BOUNDS.zMin + 2;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (dot.current) {
        dot.current.style.left = `${((player.x - BOUNDS.xMin + 2) / W) * 100}%`;
        dot.current.style.top = `${((player.z - BOUNDS.zMin + 1) / H) * 100}%`;
        dot.current.style.transform = `translate(-50%,-50%) rotate(${player.yaw}rad)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, [W, H]);
  return (
    <div className="absolute left-3 top-16 hidden w-56 rounded-2xl border bg-card/95 p-3 shadow-lg sm:block">
      <p className="mb-2 font-display text-sm font-bold">Store map · tap an aisle</p>
      <div className="relative aspect-[42/38] rounded-lg bg-muted">
        {FACES.map((f) => {
          const c = CATEGORIES.find((x) => x.id === f.category)!;
          const s = faceSpot(f);
          return (
            <button key={f.category} title={c.name} onClick={() => onGo(f.category)}
              className="absolute h-[40%] w-[5%] -translate-x-1/2 rounded-sm opacity-90 hover:opacity-100"
              style={{ background: c.color, left: `${((f.x + f.side * 0.5 - BOUNDS.xMin + 2) / W) * 100}%`, top: `${((-20 - BOUNDS.zMin + 1) / H) * 100}%` }}
              aria-label={`Go to ${c.name} (${s.x})`} />
          );
        })}
        <div className="absolute left-1/2 top-[79%] h-[4%] w-[14%] -translate-x-1/2 rounded-sm bg-accent" title="Billing" />
        <div ref={dot} className="absolute size-3 border-x-[6px] border-b-[12px] border-x-transparent border-b-destructive" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => onGo(c.id)} className="flex items-center gap-1 truncate text-left text-[10px] hover:underline">
            <span className="size-2 shrink-0 rounded-full" style={{ background: c.color }} />{c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function MoveControls() {
  const hold = (key: "f" | "turn", v: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); player.input[key] = v; },
    onPointerUp: () => (player.input[key] = 0),
    onPointerLeave: () => (player.input[key] = 0),
    onPointerCancel: () => (player.input[key] = 0),
  });
  const cls = "grid size-14 place-items-center rounded-2xl bg-card/90 shadow-lg active:bg-secondary touch-none select-none";
  return (
    <div className="absolute bottom-4 left-4 grid grid-cols-3 gap-2">
      <span /><button className={cls} {...hold("f", 1)} aria-label="Walk forward"><ArrowUp /></button><span />
      <button className={cls} {...hold("turn", -1)} aria-label="Turn left"><ArrowLeft /></button>
      <button className={cls} {...hold("f", -1)} aria-label="Walk back"><ArrowDown /></button>
      <button className={cls} {...hold("turn", 1)} aria-label="Turn right"><ArrowRight /></button>
    </div>
  );
}

function TwoD({ onPick }: { onPick: (p: Product) => void }) {
  const [cat, setCat] = useState<string>();
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 pb-10 pt-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant={!cat ? "default" : "outline"} onClick={() => setCat(undefined)}>All</Button>
          {CATEGORIES.map((c) => <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>{c.name}</Button>)}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {PRODUCTS.filter((p) => !cat || p.category === cat).map((p) => (
            <button key={p.id} onClick={() => onPick(p)} className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center hover:shadow-lg">
              <PackSwatch product={p} small />
              <span className="text-sm font-medium">{p.name}</span>
              <span className="font-bold">{inr(unitPrice(p))}{p.discountPct ? <span className="ml-1 text-xs text-primary">-{p.discountPct}%</span> : null}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
