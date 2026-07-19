import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Plus, Trash2, Check, GripVertical, Upload, X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { AppBar } from "@/components/AppBar";
import { saveCustomRoutine } from "@/lib/routines";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create")({
  component: CreateRoutine,
});

const defaultGoals = ["Relax", "Sleep", "Focus", "Energy", "Neck ease", "Posture", "Beauty"];


type MediaKind = "video" | "image";
type DurationMode = "seconds" | "reps";
type Move = {
  id: number;
  name: string;
  seconds: number;
  reps: number;
  mode: DurationMode;
  mediaUrl?: string;
  mediaKind?: MediaKind;
  mediaName?: string;
};

const ACCEPT = "video/mp4,video/quicktime,image/jpeg,image/jpg,image/png";

function detectKind(file: File): MediaKind | null {
  const t = file.type.toLowerCase();
  const n = file.name.toLowerCase();
  if (t.startsWith("video/") || n.endsWith(".mp4") || n.endsWith(".mov")) return "video";
  if (t.startsWith("image/") || /\.(jpe?g|png)$/.test(n)) return "image";
  return null;
}

function CreateRoutine() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [customGoals, setCustomGoals] = useState<string[]>([]);
  const [addingGoal, setAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [moves, setMoves] = useState<Move[]>([
    { id: 1, name: "", seconds: 60, reps: 10, mode: "seconds" },
    { id: 2, name: "", seconds: 60, reps: 10, mode: "seconds" },
  ]);
  const [saved, setSaved] = useState(false);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});


  const addMove = () =>
    setMoves((m) => [...m, { id: Date.now(), name: "", seconds: 60, reps: 10, mode: "seconds" }]);
  const removeMove = (id: number) => {
    setMoves((m) => {
      const target = m.find((x) => x.id === id);
      if (target?.mediaUrl) URL.revokeObjectURL(target.mediaUrl);
      return m.filter((x) => x.id !== id);
    });
  };
  const update = (id: number, patch: Partial<Move>) =>
    setMoves((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const handleFile = (id: number, file: File | undefined) => {
    if (!file) return;
    const kind = detectKind(file);
    if (!kind) return;
    const move = moves.find((x) => x.id === id);
    if (move?.mediaUrl) URL.revokeObjectURL(move.mediaUrl);
    update(id, { mediaUrl: URL.createObjectURL(file), mediaKind: kind, mediaName: file.name });
  };

  const clearMedia = (id: number) => {
    const move = moves.find((x) => x.id === id);
    if (move?.mediaUrl) URL.revokeObjectURL(move.mediaUrl);
    update(id, { mediaUrl: undefined, mediaKind: undefined, mediaName: undefined });
  };

  const canSave = name.trim() && moves.some((m) => m.name.trim() || m.mediaUrl);

  const handleSave = () => {
    if (!canSave) return;
    saveCustomRoutine({
      name: name.trim(),
      goal,
      steps: moves
        .filter((m) => m.name.trim() || m.mediaUrl)
        .map((m) => ({
          name: m.name.trim() || "Movement",
          detail: m.mode === "reps" ? `${m.reps} reps` : "",
          seconds: m.mode === "seconds" ? m.seconds : Math.max(10, m.reps * 3),
          cue: "Move gently and stay with the breath.",
          image: m.mediaKind === "image" ? m.mediaUrl : undefined,
        })),
    });
    setSaved(true);
  };

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
        <button className="flex w-full items-center gap-3 rounded-3xl border border-dashed border-border bg-secondary/40 p-4 text-left text-muted-foreground">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-card">
            <Camera className="size-5" />
          </span>
          <span className="text-sm">Add a cover image (optional)</span>
        </button>

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

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Movements</label>
            <p className="text-xs text-muted-foreground">One media per movement</p>
          </div>

          <div className="mt-2 space-y-3">
            {moves.map((m, i) => (
              <div
                key={m.id}
                className="rounded-3xl border border-border/60 bg-card p-3"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <input
                    value={m.name}
                    onChange={(e) => update(m.id, { name: e.target.value })}
                    placeholder="Movement name"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => removeMove(m.id)}
                    aria-label="Remove movement"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Media upload */}
                <div className="mt-3">
                  <input
                    ref={(el) => {
                      fileInputs.current[m.id] = el;
                    }}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      handleFile(m.id, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  {m.mediaUrl ? (
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/40">
                      {m.mediaKind === "video" ? (
                        <video
                          src={m.mediaUrl}
                          controls
                          playsInline
                          className="aspect-video w-full bg-black object-contain"
                        />
                      ) : (
                        <img
                          src={m.mediaUrl}
                          alt={m.mediaName ?? "movement"}
                          className="aspect-video w-full object-cover"
                        />
                      )}
                      <div className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="truncate text-muted-foreground">{m.mediaName}</span>
                        <button
                          onClick={() => clearMedia(m.id)}
                          className="ml-2 flex items-center gap-1 rounded-full bg-card px-2 py-1 font-medium text-destructive"
                        >
                          <X className="size-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputs.current[m.id]?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 py-4 text-sm font-medium text-muted-foreground"
                    >
                      <Upload className="size-4" />
                      Upload video or image
                    </button>
                  )}
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Accepted: MP4, MOV, JPG, JPEG, PNG
                  </p>
                </div>

                {/* Duration or reps */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex rounded-full bg-secondary p-0.5 text-xs font-medium">
                    {(["seconds", "reps"] as DurationMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => update(m.id, { mode })}
                        className={cn(
                          "rounded-full px-3 py-1.5 transition-colors",
                          m.mode === mode
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground",
                        )}
                      >
                        {mode === "seconds" ? "Duration" : "Reps"}
                      </button>
                    ))}
                  </div>

                  {m.mode === "seconds" ? (
                    <div className="ml-auto flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={m.seconds}
                        onChange={(e) =>
                          update(m.id, { seconds: Math.max(1, Number(e.target.value) || 0) })
                        }
                        className="w-14 bg-transparent text-right text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">seconds</span>
                    </div>
                  ) : (
                    <div className="ml-auto flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={m.reps}
                        onChange={(e) =>
                          update(m.id, { reps: Math.max(1, Number(e.target.value) || 0) })
                        }
                        className="w-14 bg-transparent text-right text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">reps</span>
                    </div>
                  )}
                </div>
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
