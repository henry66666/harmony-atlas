import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bell,
  Gem,
  Flame,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
  Leaf,
  Wind,
  Award,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { CategoryIcon } from "@/components/CategoryIcon";
import hero1 from "@/assets/hero-16489442.png.asset.json";
import hero2 from "@/assets/hero-4343c4ff.png.asset.json";
import hero3 from "@/assets/hero-636ef02b.png.asset.json";
import hero4 from "@/assets/hero-a3ce83a1.png.asset.json";
import hero5 from "@/assets/hero-af7dd0a3.png.asset.json";

const heroImages = [hero1.url, hero2.url, hero3.url, hero4.url, hero5.url];

function pickTwoRandom<T>(arr: T[]): [T, T] {
  const i = Math.floor(Math.random() * arr.length);
  let j = Math.floor(Math.random() * (arr.length - 1));
  if (j >= i) j++;
  return [arr[i], arr[j]];
}
import { useAuth } from "@/lib/auth";
import { courses, images, tips } from "@/lib/content";

export const Route = createFileRoute("/")({
  component: Home,
});

const quickLinks = [
  { to: "/tips" as const, label: "Health tips", icon: Leaf, dot: true },
  { to: "/catalog" as const, label: "Join practice", icon: Wind },
  { to: "/achievements" as const, label: "My badges", icon: Award },
];


function Home() {
  const { user, streak, openLogin, isPro } = useAuth();
  const navigate = useNavigate();
  const todays = courses[0];
  const recommended = courses.slice(1, 4);
  const [heroA, heroB] = useMemo(() => pickTwoRandom(heroImages), []);

  const startToday = () => {
    if (!user) return openLogin();
    navigate({ to: "/session/$id", params: { id: todays.id } });
  };

  return (
    <MobileShell>
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)]">
        <div>
          <p className="font-display text-2xl font-bold italic tracking-tight">QiWell</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Move your Qi, nourish your calm</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/pro"
            aria-label="QiWell Pro"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-clay transition-colors hover:bg-accent"
          >
            <Gem className="size-[18px]" />
          </Link>
          <button
            aria-label="Notifications"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
          >
            <Bell className="size-[18px]" />
          </button>
        </div>
      </header>

      <div className="flex-1 px-5 pb-8 pt-4">
        {/* Streak / assessment strip */}
        {user ? (
          <div className="flex items-center justify-between rounded-3xl bg-gradient-to-br from-accent to-accent/50 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-card/70 text-clay">
                <Flame className="size-6" />
              </span>
              <div>
                <p className="text-2xl font-bold leading-none text-accent-foreground">{streak}</p>
                <p className="mt-1 text-xs text-accent-foreground/80">day streak · keep it soft</p>
              </div>
            </div>
            <Link to="/achievements" className="text-sm font-semibold text-accent-foreground/90">
              Badges →
            </Link>
          </div>
        ) : (
          <Link
            to="/assessment"
            className="flex items-center gap-2 rounded-full bg-gold/60 px-5 py-3 text-sm font-semibold text-gold-foreground transition-transform active:scale-[0.99]"
          >
            <Sparkles className="size-4" />
            Take the 1-minute wellness check
            <ChevronRight className="ml-auto size-4" />
          </Link>
        )}

        {/* Hero illustrations */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[heroA, heroB].map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-3xl bg-secondary/50">
              <img
                src={src}
                alt="Gentle qigong practice illustration"
                className="aspect-square w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Today's practice card */}
        <div className="mt-5 rounded-4xl border border-border/70 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-gold/50 px-3 py-1 text-xs font-semibold text-gold-foreground">
              Today for you
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {todays.minutes} min
            </span>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{todays.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {todays.subtitle}
          </p>
          <button
            onClick={startToday}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground transition-transform active:scale-[0.99]"
          >
            {user ? "Start today's practice" : "Sign in to begin"}
            <ArrowRight className="size-4" />
          </button>
          {!user && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Sign in to save your streak & progress
            </p>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-2 rounded-3xl border border-border/60 bg-card px-2 py-4 text-center transition-colors hover:bg-secondary/60"
            >
              {item.dot && <span className="absolute right-4 top-3 size-2 rounded-full bg-clay" />}
              <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <item.icon className="size-5" strokeWidth={1.8} />
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>


        {/* Recommended */}
        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recommended for you</h3>
          <Link to="/catalog" className="text-sm font-medium text-primary">
            See all
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {recommended.map((c) => (
            <Link
              key={c.id}
              to="/session/$id"
              params={{ id: c.id }}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openLogin();
                }
              }}
              className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-3 transition-colors hover:bg-secondary/50"
            >
              <CategoryIcon
                category={c.category}
                accent={c.accent}
                className="size-14 shrink-0"
                iconClassName="size-7"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.title}</p>
                <p className="truncate text-sm text-muted-foreground">{c.subtitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.level} · {c.minutes} min
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Tip teaser */}
        <div className="mt-8 rounded-4xl bg-accent/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/70">
            Neck care guide
          </p>
          <h3 className="mt-2 text-lg font-semibold text-accent-foreground">{tips[0].title}</h3>
          <p className="mt-1 text-sm text-accent-foreground/80">{tips[0].excerpt}</p>
          <Link
            to="/tips"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground"
          >
            Read more <ArrowRight className="size-4" />
          </Link>
        </div>

        {!isPro && (
          <Link
            to="/pro"
            className="mt-4 flex items-center gap-3 rounded-4xl bg-ink p-5 text-ink-foreground"
          >
            <Gem className="size-6 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="font-semibold">Go QiWell Pro</p>
              <p className="text-sm text-ink-foreground/70">Unlimited sessions & member scenes</p>
            </div>
            <ArrowRight className="size-5" />
          </Link>
        )}
      </div>
    </MobileShell>
  );
}
