import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Minus, Plus, Check, ShieldCheck, Truck } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { getProduct, images, courses } from "@/lib/content";

export const Route = createFileRoute("/shop/$id")({
  component: ProductDetail,
  notFoundComponent: () => (
    <MobileShell showNav={false}>
      <AppBar title="Not found" />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-semibold">Product not found</p>
        <Link to="/shop" className="text-sm font-semibold text-primary">
          Back to shop
        </Link>
      </div>
    </MobileShell>
  ),
});

function ProductDetail() {
  const { id } = useParams({ from: "/shop/$id" });
  const product = getProduct(id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;
  const relatedCourse = courses.find((c) => c.relatedProductId === product.id);

  return (
    <MobileShell showNav={false}>
      <AppBar title="" transparent />

      <div className="-mt-14 flex-1">
        <img
          src={images[product.image]}
          alt={product.name}
          width={800}
          height={800}
          className="aspect-square w-full object-cover"
        />

        <div className="relative -mt-8 rounded-t-4xl bg-background px-5 pb-40 pt-6">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-2xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold">${product.price}</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-gold text-gold" /> 4.9 · 320 reviews
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-3xl bg-secondary/50 p-3 text-sm">
              <Truck className="size-4 text-primary" /> Free worldwide shipping
            </div>
            <div className="flex items-center gap-2 rounded-3xl bg-secondary/50 p-3 text-sm">
              <ShieldCheck className="size-4 text-primary" /> 30-day returns
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold">About this material</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Thoughtfully sourced and finished for daily wellness rituals. Designed to complement your
              QiWell practice — gentle on the skin, grounding in the hand, and made to last. Each piece
              carries the quiet craft of traditional Chinese self-care.
            </p>
          </div>

          {relatedCourse && (
            <Link
              to="/session/$id"
              params={{ id: relatedCourse.id }}
              className="mt-6 flex items-center gap-3 rounded-4xl border border-border/60 bg-card p-4"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-2xl">
                🧘
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary">Use it with</p>
                <p className="font-semibold">{relatedCourse.title}</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Sticky buy bar */}
      <div className="sticky bottom-0 z-30 border-t border-border/60 bg-card/95 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-2 py-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease"
              className="flex size-8 items-center justify-center rounded-xl bg-secondary"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase"
              className="flex size-8 items-center justify-center rounded-xl bg-secondary"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground transition-transform active:scale-[0.99]"
          >
            {added ? (
              <>
                <Check className="size-5" /> Added to cart
              </>
            ) : (
              <>Add to cart · ${(product.price * qty).toFixed(0)}</>
            )}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
