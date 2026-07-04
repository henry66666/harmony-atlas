import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { tips } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tips")({
  component: Tips,
});

const accentMap = {
  sage: "bg-accent/60",
  gold: "bg-gold/35",
  clay: "bg-clay/12",
} as const;

const emojiMap = { sage: "🌿", gold: "📱", clay: "🎾" } as const;

function Tips() {
  return (
    <MobileShell showNav={false}>
      <AppBar title="Health tips" />
      <div className="flex-1 px-5 pb-10 pt-3">
        <h2 className="text-lg font-semibold text-muted-foreground">Neck care guide</h2>

        <div className="mt-4 space-y-4">
          {tips.map((tip) => (
            <Link
              key={tip.id}
              to="/tips/$id"
              params={{ id: tip.id }}
              className={cn(
                "block overflow-hidden rounded-4xl p-6 transition-transform active:scale-[0.99]",
                accentMap[tip.accent],
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold leading-snug">{tip.title}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{tip.excerpt}</p>
                </div>
                <span className="text-4xl">{emojiMap[tip.accent]}</span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-foreground/60">{tip.minutes} min read</span>
                <span className="flex size-9 items-center justify-center rounded-full bg-card">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
