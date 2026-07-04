import { Wind, Hand, Flower2, Sprout, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/content";

const iconByCategory: Record<Course["category"], LucideIcon> = {
  baduanjin: Wind,
  yijinjing: Sprout,
  tuina: Hand,
  guasha: Flower2,
  beginner: Sparkles,
};

const accentClass = {
  sage: "bg-accent text-accent-foreground",
  gold: "bg-gold/40 text-gold-foreground",
  clay: "bg-clay/15 text-clay",
} as const;

export function CategoryIcon({
  category,
  accent,
  className,
  iconClassName,
}: {
  category: Course["category"];
  accent: Course["accent"];
  className?: string;
  iconClassName?: string;
}) {
  const Icon = iconByCategory[category] ?? Sparkles;
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-2xl",
        accentClass[accent],
        className,
      )}
    >
      <Icon className={cn("size-6", iconClassName)} strokeWidth={1.8} />
    </span>
  );
}
