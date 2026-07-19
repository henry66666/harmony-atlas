import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Sparkles, Loader2, RefreshCw, Cpu, Brain, Languages, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MobileShell } from "@/components/MobileShell";
import { getCourse } from "@/lib/content";
import { useCustomRoutine } from "@/lib/routines";
import {
  fetchWellnessKnowledge,
  GEMINI_MODELS,
  REASONING_LEVELS,
  TRANSLATION_LANGUAGES,
} from "@/lib/gemini.functions";
import { cn } from "@/lib/utils";

type KnowledgeSearch = { step?: number };

export const Route = createFileRoute("/knowledge/$id")({
  component: KnowledgePage,
  validateSearch: (search: Record<string, unknown>): KnowledgeSearch => ({
    step: typeof search.step === "number" ? search.step : Number(search.step ?? 0) || 0,
  }),
  head: () => ({
    meta: [
      { title: "Wellness insight · QiWell" },
      { name: "description", content: "AI-guided TCM knowledge for your practice." },
    ],
  }),
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <MobileShell showNav={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-semibold">Practice not found</p>
        <Link to="/catalog" className="text-sm font-semibold text-primary">
          Back to practices
        </Link>
      </div>
    </MobileShell>
  );
}

type Panel = "model" | "reasoning" | "language" | null;

function KnowledgePage() {
  const { id } = useParams({ from: "/knowledge/$id" });
  const { step: stepParam } = useSearch({ from: "/knowledge/$id" });
  const course = getCourse(id) ?? getCustomRoutine(id);

  const [modelId, setModelId] = useState<string>(GEMINI_MODELS[0].id);
  const [reasoningId, setReasoningId] = useState<string>(REASONING_LEVELS[0].id);
  const [languageId, setLanguageId] = useState<string>(TRANSLATION_LANGUAGES[0].id);
  const [openPanel, setOpenPanel] = useState<Panel>(null);

  if (!course) return <NotFound />;

  const stepIndex = Math.min(Math.max(0, stepParam ?? 0), course.steps.length - 1);
  const step = course.steps[stepIndex];

  const query = useQuery({
    queryKey: ["knowledge", course.id, stepIndex, step.name, modelId, reasoningId, languageId],
    queryFn: () =>
      fetchWellnessKnowledge({
        data: {
          title: course.title,
          subtitle: course.subtitle,
          moveName: step.name,
          moveDetail: step.detail,
          goal: course.goal,
          model: modelId,
          reasoning: reasoningId,
          language: languageId,
        },
      }),
    staleTime: 1000 * 60 * 30,
    retry: 0,
  });

  const currentModel = GEMINI_MODELS.find((m) => m.id === modelId) ?? GEMINI_MODELS[0];
  const currentReasoning = REASONING_LEVELS.find((r) => r.id === reasoningId) ?? REASONING_LEVELS[0];
  const currentLanguage =
    TRANSLATION_LANGUAGES.find((l) => l.id === languageId) ?? TRANSLATION_LANGUAGES[0];

  return (
    <MobileShell showNav={false}>
      <header className="flex items-center gap-3 px-5 pt-[max(env(safe-area-inset-top),1rem)]">
        <Link
          to="/session/$id"
          params={{ id: course.id }}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card"
          aria-label="Back to session"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{course.title}</p>
          <p className="truncate text-xs text-muted-foreground">{step.name}</p>
        </div>
      </header>

      <div className="px-5 pt-5">
        <div className="rounded-4xl border border-gold/50 bg-gradient-to-br from-gold/25 via-card to-sage/20 p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-card/80">
              <Sparkles className="size-4 text-gold-foreground" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-foreground/80">
                Wellness insight
              </p>
              <p className="text-sm font-semibold">{step.name}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {currentModel.label} · Thinking: {currentReasoning.label} · {currentLanguage.label}
          </p>
        </div>
      </div>

      <main className="flex-1 px-5 pb-32 pt-5">
        {query.isPending && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-4xl border border-border/60 bg-card p-10 text-center">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparing your wellness insight…</p>
          </div>
        )}

        {query.isError && (
          <div className="rounded-4xl border border-destructive/40 bg-card p-6 text-center">
            <p className="text-sm font-semibold text-destructive">Couldn't reach Gemini</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {(query.error as Error)?.message ?? "Please try again in a moment."}
            </p>
            <button
              onClick={() => query.refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <RefreshCw className="size-4" /> Try again
            </button>
          </div>
        )}

        {query.data && (
          <article className="rounded-4xl border border-border/60 bg-card p-6 shadow-card">
            <div className="space-y-3 text-sm leading-relaxed text-foreground/85 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-foreground [&_p]:leading-relaxed">
              <ReactMarkdown>{query.data.markdown}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>

      {/* Bottom control bar — constrained to the mobile shell width */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-md border-t border-border/60 bg-card/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.15)] backdrop-blur">
          <div className="flex items-stretch gap-1.5 px-3 py-2">
            <ToolbarButton
              icon={<Cpu className="size-3.5" />}
              label="Model"
              value={currentModel.label.replace("Gemini ", "")}
              active={openPanel === "model"}
              onClick={() => setOpenPanel(openPanel === "model" ? null : "model")}
            />
            <ToolbarButton
              icon={<Brain className="size-3.5" />}
              label="Thinking"
              value={currentReasoning.label}
              active={openPanel === "reasoning"}
              onClick={() => setOpenPanel(openPanel === "reasoning" ? null : "reasoning")}
            />
            <ToolbarButton
              icon={<Languages className="size-3.5" />}
              label="Language"
              value={currentLanguage.label}
              active={openPanel === "language"}
              onClick={() => setOpenPanel(openPanel === "language" ? null : "language")}
            />
          </div>
        </div>
      </div>


      {openPanel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            aria-label="Close"
            onClick={() => setOpenPanel(null)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />
          <div className="animate-soft-rise relative w-full max-w-md rounded-t-4xl bg-card p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-float">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            {openPanel === "model" && (
              <OptionList
                title="Choose a Gemini model"
                items={GEMINI_MODELS.map((m) => ({ id: m.id, label: m.label }))}
                selected={modelId}
                onSelect={(id) => {
                  setModelId(id);
                  setOpenPanel(null);
                }}
              />
            )}
            {openPanel === "reasoning" && (
              <OptionList
                title="Thinking effort"
                items={REASONING_LEVELS.map((r) => ({
                  id: r.id,
                  label: r.label,
                  hint: r.budget === 0 ? "Fastest" : `~${r.budget} tokens`,
                }))}
                selected={reasoningId}
                onSelect={(id) => {
                  setReasoningId(id);
                  setOpenPanel(null);
                }}
              />
            )}
            {openPanel === "language" && (
              <OptionList
                title="Translate to"
                items={TRANSLATION_LANGUAGES.map((l) => ({
                  id: l.id,
                  label: l.label,
                  hint: l.country,
                }))}
                selected={languageId}
                onSelect={(id) => {
                  setLanguageId(id);
                  setOpenPanel(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function ToolbarButton({
  icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-2.5 py-2 text-left transition-colors",
        active
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border bg-secondary/40",
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-card/70 text-foreground">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-[11px] font-semibold">{value}</span>
      </span>
    </button>
  );
}


function OptionList({
  title,
  items,
  selected,
  onSelect,
}: {
  title: string;
  items: { id: string; label: string; hint?: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="max-h-[60vh] space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border bg-secondary/30",
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                {item.hint && (
                  <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
                )}
              </div>
              {isSelected && <Check className="size-4 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
