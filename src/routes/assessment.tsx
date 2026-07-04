import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import doctor from "@/assets/assessment-doctor.jpg";
import { courses } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  component: Assessment,
});

const questions = [
  {
    q: "How much time do you spend looking at screens each day?",
    options: ["Under 4 hours", "4–8 hours", "8+ hours"],
  },
  {
    q: "How does your neck and shoulder area usually feel?",
    options: ["Relaxed", "A little tight", "Often stiff or achy"],
  },
  {
    q: "How is your sleep lately?",
    options: ["Restful", "So-so", "Hard to unwind"],
  },
  {
    q: "What would you most like to improve?",
    options: ["Neck & posture", "Calm & sleep", "Daily energy"],
  },
];

function Assessment() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "quiz" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const recommended = courses[Math.min(answers[3] ?? 0, courses.length - 1)] ?? courses[0];

  const answer = (choice: number) => {
    const next = [...answers];
    next[index] = choice;
    setAnswers(next);
    if (index < questions.length - 1) setIndex(index + 1);
    else setStage("result");
  };

  if (stage === "intro") {
    return (
      <MobileShell showNav={false}>
        <AppBar title="" transparent />
        <div className="flex flex-1 flex-col px-6 pb-8">
          <div className="mx-auto mt-2 size-40 overflow-hidden rounded-full bg-gold/20">
            <img src={doctor} alt="A friendly wellness guide" width={1024} height={1024} className="size-full object-cover" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Hello — understand your neck in 1 minute</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We'll ask {questions.length} quick questions to gauge your current neck and shoulder
            wellness, then match you with a practice type and mode. Please answer honestly.
          </p>
          <div className="mt-5 rounded-3xl bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">A gentle note</p>
            <p className="mt-1">
              Move slowly and never force anything. Stop if you feel pain. This check is educational and
              does not replace professional medical advice.
            </p>
          </div>
          <div className="mt-auto space-y-3 pt-8">
            <button
              onClick={() => setStage("quiz")}
              className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground"
            >
              Start the check
            </button>
            <Link
              to="/"
              className="block text-center text-sm font-medium text-muted-foreground"
            >
              Maybe later
            </Link>
          </div>
        </div>
      </MobileShell>
    );
  }

  if (stage === "quiz") {
    const current = questions[index];
    return (
      <MobileShell showNav={false}>
        <AppBar title={`Question ${index + 1} of ${questions.length}`} onBack={() => (index === 0 ? setStage("intro") : setIndex(index - 1))} />
        <div className="px-5 pt-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-5 pb-8 pt-8">
          <h2 className="text-xl font-semibold leading-snug">{current.q}</h2>
          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => (
              <button
                key={opt}
                onClick={() => answer(i)}
                className={cn(
                  "flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left text-sm font-medium transition-colors",
                  answers[index] === i
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-secondary/50",
                )}
              >
                {opt}
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showNav={false}>
      <AppBar title="Your result" />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-8" strokeWidth={2.5} />
        </span>
        <h1 className="mt-5 text-center text-2xl font-bold">We found your starting point</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Based on your answers, this gentle practice suits you best right now.
        </p>

        <div className="mt-6 rounded-4xl border border-border/60 bg-card p-5 shadow-card">
          <span className="rounded-full bg-gold/50 px-3 py-1 text-xs font-semibold text-gold-foreground">
            Recommended
          </span>
          <h2 className="mt-3 text-xl font-semibold">{recommended.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {recommended.subtitle} · {recommended.minutes} min · {recommended.goal}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-8">
          <button
            onClick={() => navigate({ to: "/session/$id", params: { id: recommended.id } })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground"
          >
            Start this practice <ArrowRight className="size-4" />
          </button>
          <Link
            to="/catalog"
            className="block rounded-2xl border border-border bg-card py-3.5 text-center text-sm font-semibold"
          >
            Explore all practices
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}
