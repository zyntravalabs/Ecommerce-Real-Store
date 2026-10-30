import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productById } from "./products";
import type { Line } from "./billing";

export type Receipt = {
  orderId: string; txnId: string; date: string; method: string;
  lines: Line[]; coupon?: string; status: "TEST PAYMENT – NOT REAL";
};

type State = {
  lines: Line[];
  coupon?: string;
  recent: string[];
  receipts: Receipt[];
  add: (id: string) => boolean;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  setCoupon: (c?: string) => void;
  view: (id: string) => void;
  completeTestPayment: (method: string) => Receipt;
};

export const useBasket = create<State>()(
  persist(
    (set, get) => ({
      lines: [], recent: [], receipts: [],
      add: (id) => {
        const p = productById(id);
        const cur = get().lines.find((l) => l.id === id)?.qty ?? 0;
        if (!p || cur >= p.stock) return false;
        set({ lines: cur ? get().lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...get().lines, { id, qty: 1 }] });
        return true;
      },
      setQty: (id, qty) => {
        const max = productById(id)?.stock ?? 0;
        const q = Math.max(0, Math.min(qty, max));
        set({ lines: q === 0 ? get().lines.filter((l) => l.id !== id) : get().lines.map((l) => (l.id === id ? { ...l, qty: q } : l)) });
      },
      remove: (id) => set({ lines: get().lines.filter((l) => l.id !== id) }),
      setCoupon: (coupon) => set({ coupon }),
      view: (id) => set({ recent: [id, ...get().recent.filter((x) => x !== id)].slice(0, 6) }),
      completeTestPayment: (method) => {
        const now = new Date();
        const rnd = () => Math.random().toString(36).slice(2, 8).toUpperCase();
        const r: Receipt = {
          orderId: `FM-${now.getTime().toString(36).toUpperCase()}`,
          txnId: `TEST-${rnd()}${rnd()}`, date: now.toISOString(), method,
          lines: get().lines, coupon: get().coupon, status: "TEST PAYMENT – NOT REAL",
        };
        set({ receipts: [r, ...get().receipts], lines: [], coupon: undefined });
        return r;
      },
    }),
    { name: "freshmart-basket" },
  ),
);

let ctx: AudioContext | null = null;
export function beep(freq = 880, dur = 0.12) {
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = freq; g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* no audio */ }
}
