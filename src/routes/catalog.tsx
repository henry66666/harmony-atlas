import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Clock, Flame, ChevronRight, Trash2, X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categories, courses, type Category } from "@/lib/content";
import { useCustomRoutines, deleteCustomRoutine, type CustomRoutine } from "@/lib/routines";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/catalog")({
  component: Catalog,
});


function Catalog() {
  const [active, setActive] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<CustomRoutine | null>(null);
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();

  const custom = useCustomRoutines();


  const all = [...custom, ...courses];
  const filtered = all.filter((c) => {
    const matchesCat = active === "all" || c.category === active;
    const matchesQuery = `${c.title} ${c.subtitle} ${c.goal}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });


  const goCreate = () => {
    if (!user) return openLogin();
    navigate({ to: "/create" });
  };

  const confirmDelete = () => {
    if (deleting) {
      deleteCustomRoutine(deleting.id);
      setDeleting(null);
    }
  };

  return (

    <MobileShell>
      <header className="px-5 pb-1 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Practice</h1>
          <button
            onClick={goCreate}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Plus className="size-4" /> Create
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Guided Tui Na, Gua Sha & traditional Daoyin forms
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-input bg-secondary/40 px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a practice or goal"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </header>

      {/* Category chips */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === cat.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 pb-8 pt-5">
        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No practices match “{query}”.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="relative rounded-4xl border border-border/60 bg-card shadow-card transition-colors hover:bg-secondary/40"
              >
                <Link
                  to="/session/$id"
                  params={{ id: c.id }}
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      openLogin();
                    }
                  }}
                  className="block p-4 pr-12"
                >
                  <div className="flex items-start gap-4">
                    <CategoryIcon
                      category={c.category}
                      accent={c.accent}
                      className="size-16 shrink-0 rounded-3xl"
                      iconClassName="size-8"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{c.title}</p>
                        {c.hot && (
                          <span className="flex items-center gap-0.5 rounded-full bg-clay/15 px-2 py-0.5 text-[10px] font-semibold text-clay">
                            <Flame className="size-3" /> Popular
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{c.subtitle}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" /> {c.minutes} min
                        </span>
                        <span>· {c.level}</span>
                        <span>· {c.bestFor}</span>
                      </div>
                    </div>
                    <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  </div>
                </Link>

                {"custom" in c && c.custom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(c);
                    }}
                    aria-label="Delete routine"
                    className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors active:scale-95 hover:bg-destructive/20"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}

              </div>
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
            <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">Delete routine?</h3>
                <button
                  onClick={() => setDeleting(null)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X className="size-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                “{deleting.title}” will be removed from your My Routine list. This cannot be undone.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleting(null)}
                  className="rounded-2xl border border-border py-3 text-sm font-semibold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-2xl bg-destructive py-3 text-sm font-semibold text-destructive-foreground"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create your own callout */}

        <button
          onClick={goCreate}
          className="mt-5 flex w-full items-center gap-3 rounded-4xl border border-dashed border-primary/50 bg-accent/30 p-5 text-left transition-colors hover:bg-accent/50"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Plus className="size-6" />
          </span>
          <div>
            <p className="font-semibold">Build your own routine</p>
            <p className="text-sm text-muted-foreground">Combine points & forms your way</p>
          </div>
        </button>
      </div>
    </MobileShell>
  );
}
