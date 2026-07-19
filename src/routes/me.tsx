import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Check,
  X,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/lib/auth";
import { LANGUAGES, useLang, type LangCode } from "@/lib/i18n";

export const Route = createFileRoute("/me")({
  component: Me,
});

function Me() {
  const { user, streak, totalMinutes, totalSessions, isPro, openLogin, logout } = useAuth();
  const { lang, setLang, langDef, translating } = useLang();
  const [langOpen, setLangOpen] = useState(false);

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
                      <span className="text-xs text-muted-foreground" data-no-translate>
                        {d}
                      </span>
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
          <Link
            to="/shop"
            className="flex items-center gap-3 border-b border-border/60 px-5 py-4 transition-colors hover:bg-secondary/40"
          >
            <ShoppingBag className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">Order center</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-3 border-b border-border/60 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
          >
            <Bell className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">Practice reminders</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={() => setLangOpen(true)}
            className="flex w-full items-center gap-3 border-b border-border/60 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
          >
            <Globe className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">Language</span>
            <span className="text-sm text-muted-foreground" data-no-translate>
              {langDef.label}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
          >
            <Info className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">About QiWell</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
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

      {langOpen && (
        <LanguageSheet
          currentLang={lang}
          translating={translating}
          onSelect={(code) => {
            setLang(code);
            setLangOpen(false);
          }}
          onClose={() => setLangOpen(false)}
        />
      )}
    </MobileShell>
  );
}

function LanguageSheet({
  currentLang,
  translating,
  onSelect,
  onClose,
}: {
  currentLang: LangCode;
  translating: boolean;
  onSelect: (code: LangCode) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-4xl bg-card p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Language</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Applied across the whole app
              {translating ? " · translating…" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card"
          >
            <X className="size-4" />
          </button>
        </div>
        <ul className="mt-4 max-h-[60vh] space-y-1 overflow-y-auto">
          {LANGUAGES.map((l) => {
            const active = l.code === currentLang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => onSelect(l.code)}
                  className={
                    active
                      ? "flex w-full items-center gap-3 rounded-2xl bg-accent/60 px-4 py-3 text-left"
                      : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold" data-no-translate>
                      {l.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground" data-no-translate>
                      {l.english} · {l.country}
                    </p>
                  </div>
                  {active && <Check className="size-4 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
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
