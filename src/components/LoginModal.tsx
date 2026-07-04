import { useState } from "react";
import { X, Leaf } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function LoginModal() {
  const { loginOpen, closeLogin, login } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!loginOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    login({
      name: name.trim() || trimmed.split("@")[0] || "Friend",
      email: trimmed,
    });
    setName("");
    setEmail("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={closeLogin}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
      />
      <div className="animate-soft-rise relative w-full max-w-md rounded-t-4xl bg-card p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)] shadow-float sm:rounded-4xl">
        <button
          type="button"
          onClick={closeLogin}
          aria-label="Close"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Leaf className="size-6" />
          </span>
          <h2 className="text-xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Join QiWell"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your streak, badges & practice history.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:bg-card"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:bg-card"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-input bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors focus:border-ring focus:bg-card"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-ink py-3.5 text-sm font-semibold text-ink-foreground transition-transform active:scale-[0.99]"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => login({ name: "Guest", email: "guest@qiwell.app" })}
            className="rounded-2xl border border-border bg-card py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => login({ name: "Guest", email: "guest@qiwell.app" })}
            className="rounded-2xl border border-border bg-card py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Apple
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to QiWell?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
