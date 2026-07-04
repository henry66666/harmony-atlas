import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  ShoppingBag,
  Bell,
  Globe,
  Info,
  LogOut,
  Gem,
  Flame,
  Clock,
  Award,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/me")({
  component: Me,
});

const menu = [
  { to: "/shop", label: "Order center", icon: ShoppingBag },
  { to: "/", label: "Practice reminders", icon: Bell },
  { to: "/", label: "Language", icon: Globe, value: "English" },
  { to: "/", label: "About QiWell", icon: Info },
] as const;

function Me() {
  const { user, streak, totalMinutes, totalSessions, isPro, openLogin, logout } = useAuth();

  return (
    <MobileShell>
      <header className="px-5 pb-2 pt-[max(env(safe-area-inset-top),1rem)]">
        <h1 className="text-2xl font-bold">Me</h1>
      </header>

      <div className="flex-1 px-5 pb-8 pt-2">
        {user ? (
          <>
            {/* Profile card */}
            <div className="rounded-4xl border border-border/60 bg-card p-5 shadow-card">
              <div className="flex items-center gap-4">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
                {isPro ? (
                  <span className="flex items-center gap-1 rounded-full bg-gold/50 px-3 py-1 text-xs font-semibold text-gold-foreground">
                    <Gem className="size-3.5" /> Pro
                  </span>
                ) : (
                  <Link
                    to="/pro"
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground"
                  >
                    Go Pro
                  </Link>
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-3xl bg-secondary/40 py-4 text-center">
                <Stat icon={<Flame className="size-4" />} value={streak} label="Day streak" />
                <Stat icon={<Clock className="size-4" />} value={totalMinutes} label="Minutes" />
                <Stat icon={<Award className="size-4" />} value={totalSessions} label="Sessions" />
              </div>
            </div>

            {/* Calendar teaser */}
            <div className="mt-5 rounded-4xl border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">This week</p>
                <Link to="/achievements" className="text-sm font-medium text-primary">
                  History
                </Link>
              </div>
              <div className="mt-4 flex justify-between">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => {
                  const done = i < Math.min(streak, 7);
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">{d}</span>
                      <span
                        className={
                          done
                            ? "flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                            : "flex size-8 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                        }
                      >
                        {done ? "✓" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={openLogin}
            className="flex w-full items-center gap-4 rounded-4xl border border-border/60 bg-card p-5 text-left shadow-card"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-2xl">
              🌿
            </span>
            <div>
              <p className="text-lg font-semibold">Sign in / Register</p>
              <p className="text-sm text-muted-foreground">Sync your streak, badges & orders</p>
            </div>
            <ChevronRight className="ml-auto size-5 text-muted-foreground" />
          </button>
        )}

        {/* Menu */}
        <div className="mt-6 overflow-hidden rounded-4xl border border-border/60 bg-card">
          {menu.map((item, i) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 border-b border-border/60 px-5 py-4 last:border-0 transition-colors hover:bg-secondary/40"
            >
              <item.icon className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {"value" in item && item.value && (
                <span className="text-sm text-muted-foreground">{item.value}</span>
              )}
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {user && (
          <button
            onClick={logout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-muted-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">QiWell · v1.0 · Made with care</p>
      </div>
    </MobileShell>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      <span className="text-primary">{icon}</span>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
