import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, Check, ChevronLeft, ChevronRight, Pause, Play, ArrowRight, ShoppingBag, Sparkles, BookOpen } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { getCourse, getProduct, images } from "@/lib/content";
import { useCustomRoutine } from "@/lib/routines";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/session/$id")({
  component: Session,
  notFoundComponent: () => (
    <MobileShell showNav={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-semibold">Practice not found</p>
        <Link to="/catalog" className="text-sm font-semibold text-primary">
          Back to practices
        </Link>
      </div>
    </MobileShell>
  ),
});

function Session() {
  const { id } = useParams({ from: "/session/$id" });
  const course = getCourse(id) ?? useCustomRoutine(id);
  const navigate = useNavigate();
  const { recordSession } = useAuth();

  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [remaining, setRemaining] = useState(course?.steps[0]?.seconds ?? 0);

  if (!course) return null;

  const total = course.steps.length;
  const step = course.steps[stepIndex];
  const progress = ((stepIndex + (finished ? 1 : 0)) / total) * 100;
  const product = course.relatedProductId ? getProduct(course.relatedProductId) : undefined;

  const complete = () => {
    if (!recorded) {
      recordSession(course.id, course.minutes);
      setRecorded(true);
    }
    setFinished(true);
  };

  const next = () => {
    if (stepIndex < total - 1) {
      setStepIndex((i) => i + 1);
      setRemaining(course.steps[stepIndex + 1]?.seconds ?? 0);
    } else complete();
  };

  useEffect(() => {
    if (finished || paused) return;
    if (remaining <= 0) {
      next();
      return;
    }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, paused, finished, stepIndex]);

  /* ---------- Completion screen ---------- */
  if (finished) {
    return (
      <MobileShell showNav={false}>
        <div className="flex flex-1 flex-col px-6 pb-8 pt-[max(env(safe-area-inset-top),2rem)]">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-10" strokeWidth={2.5} />
            </span>
            <h1 className="mt-5 text-2xl font-bold">Practice complete</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {course.title} · {course.minutes} min · {total} movements
            </p>

            <div className="mt-6 w-full rounded-4xl border border-border/60 bg-card p-5 text-left">
              <p className="text-sm font-semibold">How did it feel?</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Too easy", "Just right", "Challenging"].map((label) => (
                  <button
                    key={label}
                    onClick={() => setFeedback(label)}
                    className={cn(
                      "rounded-2xl border px-2 py-3 text-xs font-medium transition-colors",
                      feedback === label
                        ? "border-primary bg-accent text-accent-foreground"
                        : "border-border bg-secondary/40 text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {product && (
              <Link
                to="/shop/$id"
                params={{ id: product.id }}
                className="mt-4 flex w-full items-center gap-3 rounded-4xl bg-gold/40 p-4 text-left"
              >
                <img
                  src={images[product.image]}
                  alt={product.name}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="size-14 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gold-foreground/70">Pairs with this session</p>
                  <p className="truncate font-semibold text-gold-foreground">{product.name}</p>
                  <p className="text-sm text-gold-foreground/80">${product.price}</p>
                </div>
                <ShoppingBag className="size-5 text-gold-foreground" />
              </Link>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Link
              to="/achievements"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground"
            >
              See my badges <ArrowRight className="size-4" />
            </Link>
            <button
              onClick={() => navigate({ to: "/" })}
              className="w-full rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold"
            >
              Back home
            </button>
          </div>
        </div>
      </MobileShell>
    );
  }

  /* ---------- In-progress screen ---------- */
  return (
    <MobileShell showNav={false} className="bg-secondary/30">
      <header className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),1rem)]">
        <button
          onClick={() => setShowExit(true)}
          aria-label="Exit practice"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card"
        >
          <X className="size-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold">{course.title}</p>
          <p className="text-xs text-muted-foreground">{course.subtitle}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="rounded-2xl bg-primary/10 px-4 py-1.5 text-2xl font-bold tabular-nums leading-none text-primary">
            {String(Math.max(0, remaining)).padStart(2, "0")}s
          </span>
          <span className="mt-1 text-xs font-medium text-muted-foreground">
            {stepIndex + 1}/{total}
          </span>
        </div>

      </header>

      {/* Progress */}
      <div className="px-5 pt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-8 pt-6">
        {/* Illustration / timer */}
        <div className="relative flex flex-col items-center justify-center rounded-4xl bg-card py-10 shadow-card">
          {step.video ? (
            <video
              src={step.video}
              autoPlay
              loop
              muted
              playsInline
              controls
              className="size-44 rounded-3xl bg-black object-cover"
            />
          ) : (
            <img
              src={step.image ?? course.sessionImage ?? images.emptyMeditate}
              alt=""
              width={1024}
              height={1024}
              className="size-44 rounded-3xl object-cover"
            />
          )}
          <span className="mt-5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            {paused ? "Paused" : `${step.seconds}s · hold gently`}
          </span>
        </div>

        {/* Current step */}
        <div className="mt-6 rounded-4xl border border-border/60 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Current move</p>
          <h2 className="mt-2 text-xl font-semibold">{step.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
          <p className="mt-4 rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-foreground/80">
            💡 {step.cue}
          </p>
        </div>

        {/* Gemini knowledge card */}
        <Link
          to="/knowledge/$id"
          params={{ id: course.id }}
          search={{ step: stepIndex }}
          className="mt-4 block rounded-4xl border border-gold/50 bg-gradient-to-br from-gold/25 via-card to-sage/20 p-5 shadow-card transition-transform active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-card/80 text-gold-foreground">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gold-foreground/80">
                  Wellness insight
                </p>
                <span className="rounded-full bg-card/70 px-2 py-0.5 text-[10px] font-semibold text-foreground/70">
                  AI · Gemini
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground line-clamp-1">
                Why "{step.name}" works
              </p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {step.detail} · TCM meridians, benefits & tips for this move.
              </p>
            </div>
            <BookOpen className="mt-1 size-5 shrink-0 text-gold-foreground/70" />
          </div>
        </Link>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (stepIndex > 0) {
                  const p = stepIndex - 1;
                  setStepIndex(p);
                  setRemaining(course.steps[p].seconds);
                }
              }}
              disabled={stepIndex === 0}
              className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground disabled:opacity-40"
              aria-label="Previous move"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card"
              aria-label={paused ? "Resume" : "Pause"}
            >
              {paused ? <Play className="size-6" /> : <Pause className="size-6" />}
            </button>
            <button
              onClick={next}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.99]"
            >
              {stepIndex < total - 1 ? (
                <>
                  Next move <ChevronRight className="size-5" />
                </>
              ) : (
                <>
                  Finish <Check className="size-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Exit confirmation */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            aria-label="Cancel"
            onClick={() => setShowExit(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />
          <div className="animate-soft-rise relative w-full max-w-sm rounded-4xl bg-card p-6 text-center shadow-float">
            <p className="text-lg font-semibold">Leave this practice?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You have about {course.minutes} minutes left. Your streak won't count if you exit now.
            </p>
            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => setShowExit(false)}
                className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Keep going
              </button>
              <button
                onClick={() => navigate({ to: "/" })}
                className="w-full rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-destructive"
              >
                Exit anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
