import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppBar({
  title,
  onBack,
  right,
  transparent = false,
  className,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  transparent?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.history.back());

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3",
        transparent ? "bg-transparent" : "border-b border-border/60 bg-background/85 backdrop-blur-md",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
      >
        <ChevronLeft className="size-5" />
      </button>
      {title && <h1 className="flex-1 truncate text-center text-base font-semibold">{title}</h1>}
      <div className="flex min-w-9 items-center justify-end">{right}</div>
    </header>
  );
}
