import type { Product } from "@/lib/products";

/** Drawn product "photo" in the pack colour (product colours are data, so inline style is intentional). */
export function PackSwatch({ product, small }: { product: Product; small?: boolean }) {
  const size = small ? "h-14 w-11" : "h-40 w-32";
  const shape = product.shape === "round" ? "rounded-full aspect-square w-auto" : product.shape === "bottle" ? "rounded-t-[40%] rounded-b-lg" : "rounded-md";
  return (
    <div className={`${size} ${shape} grid shrink-0 place-items-center border shadow-md`} style={{ background: product.color }}>
      {!small && product.shape !== "round" && (
        <div className="w-full bg-card/90 px-1 py-2 text-center">
          <p className="font-display text-sm font-bold leading-tight">{product.brand}</p>
          <p className="text-[10px] leading-tight text-muted-foreground">{product.name}</p>
        </div>
      )}
    </div>
  );
}
