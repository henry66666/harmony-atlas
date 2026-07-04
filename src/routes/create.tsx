import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Check, GripVertical, Camera } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create")({
  component: CreateRoutine,
});

const goals = ["Relax", "Sleep", "Focus", "Energy", "Neck ease", "Posture"];

type Move = { id: number; name: string; seconds: number };

function CreateRoutine() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [moves, setMoves] = useState<Move[]>([
    { id: 1, name: "", seconds: 60 },
    { id: 2, name: "", seconds: 60 },
  ]);
  const [saved, setSaved] = useState(false);

  const addMove = () => setMoves((m) => [...m, { id: Date.now(), name: "", seconds: 60 }]);
  const removeMove = (id: number) => setMoves((m) => m.filter((x) => x.id !== id));
  const update = (id: number, patch: Partial<Move>) =>
    setMoves((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const canSave = name.trim() && moves.some((m) => m.name.trim());

  if (saved) {
    return (
      <MobileShell showNav={false}>
        <AppBar title="Routine saved" />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-10" strokeWidth={2.5} />
          </span>
          <h1 className="mt-5 text-2xl font-bold">“{name}” is ready</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your custom routine has been added to your practices.
          </p>
          <Link
            to="/catalog"
            className="mt-8 w-full max-w-xs rounded-2xl bg-ink py-3.5 text-center text-sm font-semibold text-ink-foreground"
          >
            Go to my practices
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell showNav={false}>
      <AppBar
        title="New routine"
        right={
          <button
            onClick={() => canSave && setSaved(true)}
            disabled={!canSave}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Save
          </button>
        }
      />

      <div className="flex-1 space-y-6 px-5 pb-10 pt-4">
        {/* Cover */}
        <button className="flex w-full items-center gap-3 rounded-3xl border border-dashed border-border bg-secondary/40 p-4 text-left text-muted-foreground">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-card">
            <Camera className="size-5" />
          </span>
          <span className="text-sm">Add a cover image (optional)</span>
        </button>

        {/* Name */}
        <div>
          <label className="text-sm font-semibold">Routine name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="e.g. My evening wind-down"
            className="mt-2 w-full rounded-2xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none focus:border-ring focus:bg-card"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{name.length}/24</p>
        </div>

        {/* Goal */}
        <div>
          <label className="text-sm font-semibold">Goal</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  goal === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Moves */}
        <div>
          <label className="text-sm font-semibold">Movements</label>
          <div className="mt-2 space-y-2.5">
            {moves.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-2 rounded-3xl border border-border/60 bg-card p-3"
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                <input
                  value={m.name}
                  onChange={(e) => update(m.id, { name: e.target.value })}
                  placeholder="Movement or point"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={m.seconds}
                    onChange={(e) => update(m.id, { seconds: Number(e.target.value) })}
                    className="w-10 bg-transparent text-right text-xs outline-none"
                  />
                  <span className="text-xs text-muted-foreground">s</span>
                </div>
                <button
                  onClick={() => removeMove(m.id)}
                  aria-label="Remove movement"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addMove}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-accent/30 py-3 text-sm font-semibold text-primary"
          >
            <Plus className="size-4" /> Add movement
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
