import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Lock } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { badges, type Badge } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievements")({
  component: Achievements,
});

function Achievements() {
  const { user, streak, totalSessions, openLogin } = useAuth();
  const [tab, setTab] = useState<"badges" | "records">("badges");
  const [selected, setSelected] = useState<Badge | null>(null);

  const isUnlocked = (b: Badge) =>
    !!user && (b.unlockedAtStreak === 0 ? totalSessions > 0 : streak >= b.unlockedAtStreak);
  const unlockedCount = badges.filter(isUnlocked).length;

  const week = [40, 65, 30, 80, 55, 90, 70];

  return (
    <MobileShell showNav={false}>
      <AppBar title="My achievements" />

      {/* Tabs */}
      <div className="px-5 pt-2">
        <div className="flex rounded-full bg-secondary p-1">
          {(["badges", "records"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
                tab === t ? "bg-ink text-ink-foreground" : "text-muted-foreground",
              )}
            >
              {t === "badges" ? "My badges" : "My records"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pb-10 pt-5">
        {tab === "badges" ? (
          <>
            <div className="rounded-4xl bg-accent/50 p-5">
              <p className="text-sm text-accent-foreground/80">Earned</p>
              <p className="text-3xl font-bold text-accent-foreground">
                {unlockedCount}
                <span className="text-lg font-semibold"> badges</span>
              </p>
            </div>

            {!user && (
              <button
                onClick={openLogin}
                className="mt-4 w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-ink-foreground"
              >
                Sign in to start earning badges
              </button>
            )}

            <div className="mt-5 grid grid-cols-3 gap-3">
              {badges.map((b) => {
                const unlocked = isUnlocked(b);
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-3xl border p-4 text-center transition-colors",
                      unlocked
                        ? "border-border/60 bg-card"
                        : "border-dashed border-border bg-secondary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-14 items-center justify-center rounded-2xl text-3xl",
                        unlocked ? "bg-gold/30" : "bg-muted grayscale",
                      )}
                    >
                      {unlocked ? b.emoji : <Lock className="size-5 text-muted-foreground" />}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        unlocked ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {b.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Weekly energy chart */}
            <div className="rounded-4xl border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Daily practice log</p>
                <span className="rounded-full bg-gold/40 px-3 py-1 text-xs font-semibold text-gold-foreground">
                  This week
                </span>
              </div>
              <div className="mt-6 flex h-32 items-end justify-between gap-2">
                {week.map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-full bg-primary/70"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {["S", "M", "T", "W", "T", "F", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-between border-t border-border/60 pt-4 text-sm">
                <span className="text-muted-foreground">
                  This week <span className="font-semibold text-foreground">{streak} days</span>
                </span>
                <span className="text-muted-foreground">
                  Total <span className="font-semibold text-foreground">{totalSessions} sessions</span>
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm font-semibold">Recent sessions</p>
            {totalSessions === 0 ? (
              <div className="mt-3 rounded-4xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
                No sessions yet — your practice history will appear here.
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {Array.from({ length: Math.min(totalSessions, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-3xl border border-border/60 bg-card p-4"
                  >
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-accent">
                      🧘
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Practice session</p>
                      <p className="text-xs text-muted-foreground">Completed · well done</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Day {streak - i}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Badge modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <button
            aria-label="Close"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="animate-soft-rise relative w-full max-w-xs rounded-4xl bg-card p-7 text-center shadow-float">
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute right-4 top-4 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <span
              className={cn(
                "mx-auto flex size-24 items-center justify-center rounded-3xl text-5xl",
                isUnlocked(selected) ? "bg-gold/30" : "bg-muted",
              )}
            >
              {isUnlocked(selected) ? selected.emoji : <Lock className="size-8 text-muted-foreground" />}
            </span>
            <h3 className="mt-4 text-xl font-bold">{selected.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{selected.hint}</p>
            <span
              className={cn(
                "mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold",
                isUnlocked(selected)
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {isUnlocked(selected) ? "Unlocked" : `Reach ${selected.unlockedAtStreak}-day streak`}
            </span>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
