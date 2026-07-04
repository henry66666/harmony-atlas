import { type ReactNode } from "react";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";

/**
 * Centered mobile-app canvas. On larger screens the app sits in a soft
 * device-like column; on phones it fills the viewport.
 */
export function MobileShell({
  children,
  showNav = true,
  className,
}: {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-secondary/40">
      <div className="paper-grain relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background shadow-float sm:my-0">
        <main className={cn("flex flex-1 flex-col", className)}>{children}</main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
