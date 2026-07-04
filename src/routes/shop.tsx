import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Star } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { products, images } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  component: Shop,
});

const filters = ["All", "Massage", "Gua Sha", "Sleep", "Body"];

function Shop() {
  const [filter, setFilter] = useState("All");
  const featured = products.find((p) => p.featured) ?? products[0];
  const list = products.filter(
    (p) => filter === "All" || p.tags.includes(filter),
  );

  return (
    <MobileShell>
      <header className="px-5 pb-1 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Care Shop</h1>
            <p className="mt-1 text-sm text-muted-foreground">Meridian oils, gua sha & bian stone</p>
          </div>
          <button
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card"
          >
            <ShoppingBag className="size-[18px]" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-5 pb-8 pt-4">
        {/* Featured */}
        <Link
          to="/shop/$id"
          params={{ id: featured.id }}
          className="flex items-center gap-4 rounded-4xl bg-gold/40 p-5"
        >
          <img
            src={images[featured.image]}
            alt={featured.name}
            width={96}
            height={96}
            className="size-24 rounded-3xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-card/70 px-2.5 py-0.5 text-[11px] font-semibold text-gold-foreground">
              Companion pick
            </span>
            <p className="mt-2 truncate text-lg font-semibold text-gold-foreground">{featured.name}</p>
            <p className="truncate text-sm text-gold-foreground/80">{featured.tagline}</p>
            <p className="mt-1 font-bold text-gold-foreground">${featured.price}</p>
          </div>
        </Link>

        {/* Filters */}
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/shop/$id"
              params={{ id: p.id }}
              className="overflow-hidden rounded-4xl border border-border/60 bg-card transition-colors hover:bg-secondary/40"
            >
              <img
                src={images[p.image]}
                alt={p.name}
                width={400}
                height={400}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.tagline}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold">${p.price}</span>
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="size-3 fill-gold text-gold" /> 4.9
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Every material is paired to a practice, so your care carries beyond the mat.
        </p>
      </div>
    </MobileShell>
  );
}
