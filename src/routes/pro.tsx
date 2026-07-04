import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Gem, Award } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro")({
  component: Pro,
});

const perks = [
  "Unlimited posture-guard sessions",
  "Unlock member-only practice scenes",
  "Special edition badges",
  "All personalised app icons",
  "Double luck in limited challenges",
  "More premium features to come",
];

const plans = [
  { id: "monthly", label: "Monthly", price: "$3", per: "/mo" },
  { id: "yearly", label: "Yearly", price: "$18", per: "/yr", tag: "Save 46%" },
  { id: "lifetime", label: "Lifetime", price: "$59", per: "once" },
];

function Pro() {
  const { isPro, setPro, user, openLogin } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("yearly");

  const subscribe = () => {
    if (!user) return openLogin();
    setPro(true);
  };

  if (isPro) {
    return (
      <MobileShell showNav={false}>
        <AppBar title="QiWell Pro" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-gold/40 text-gold-foreground">
            <Gem className="size-9" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">You're a Pro member</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enjoy unlimited practice, member scenes and special badges. Thank you for caring for
            yourself with QiWell.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-8 w-full max-w-xs rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground"
          >
            Back home
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showNav={false}>
      <AppBar title="" transparent />
      <div className="-mt-14 flex-1 px-5 pb-40 pt-16">
        <div className="flex items-center gap-2">
          <Gem className="size-6 text-clay" />
          <h1 className="text-2xl font-bold">Join QiWell Pro</h1>
        </div>

        <div className="mt-5 rounded-4xl bg-accent/40 p-5">
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/60 text-gold-foreground">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Award className="size-4" /> App Store Editor's Choice · Innovation case, CN Rehab Assoc.
        </div>

        {/* Plans */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={cn(
                "relative rounded-3xl border-2 p-4 text-center transition-colors",
                plan === p.id
                  ? "border-gold bg-gold/25"
                  : "border-border bg-card",
              )}
            >
              {p.tag && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-ink-foreground">
                  {p.tag}
                </span>
              )}
              <p className="text-lg font-bold leading-none">
                {p.price}
                <span className="text-xs font-medium text-muted-foreground">{p.per}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{p.label}</p>
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          Payment is charged on confirmation. Subscriptions renew automatically unless cancelled at
          least 24 hours before the period ends. Manage anytime in your account settings.
        </p>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-30 border-t border-border/60 bg-card/95 px-5 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          <button
            onClick={subscribe}
            className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground transition-transform active:scale-[0.99]"
          >
            {user ? "Continue" : "Sign in to continue"}
          </button>
          <div className="flex justify-between text-xs text-muted-foreground">
            <button>Restore purchase</button>
            <button>Redeem code</button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
