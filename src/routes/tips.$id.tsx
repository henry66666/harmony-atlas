import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { tips, courses } from "@/lib/content";

export const Route = createFileRoute("/tips/$id")({
  component: TipDetail,
  notFoundComponent: () => (
    <MobileShell showNav={false}>
      <AppBar title="Not found" />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-semibold">Article not found</p>
        <Link to="/tips" className="text-sm font-semibold text-primary">
          Back to tips
        </Link>
      </div>
    </MobileShell>
  ),
});

function TipDetail() {
  const { id } = useParams({ from: "/tips/$id" });
  const tip = tips.find((t) => t.id === id);
  if (!tip) return null;
  const suggested = courses.find((c) => c.category === "tuina") ?? courses[0];

  return (
    <MobileShell showNav={false}>
      <AppBar title="Health tips" />
      <article className="flex-1 px-5 pb-12 pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {tip.minutes} min read
        </span>
        <h1 className="mt-2 text-2xl font-bold leading-snug">{tip.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{tip.excerpt}</p>

        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/85">
          {tip.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <Link
          to="/session/$id"
          params={{ id: suggested.id }}
          className="mt-8 flex items-center gap-3 rounded-4xl bg-accent/50 p-5"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-card text-2xl">
            🧘
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-accent-foreground/70">Try a gentle practice</p>
            <p className="font-semibold text-accent-foreground">{suggested.title}</p>
          </div>
          <ArrowRight className="size-5 text-accent-foreground" />
        </Link>
      </article>
    </MobileShell>
  );
}
