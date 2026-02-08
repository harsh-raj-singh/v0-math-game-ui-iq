"use client";

import { cn } from "@/lib/utils";

interface ProblemDisplayProps {
  display: string;
  feedback: "correct" | "incorrect" | null;
}

export function ProblemDisplay({ display, feedback }: ProblemDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border bg-card p-8 transition-all duration-200",
        feedback === "correct" && "border-success bg-success/5",
        feedback === "incorrect" && "border-destructive bg-destructive/5 animate-shake"
      )}
      role="region"
      aria-label="Math problem"
      aria-live="polite"
    >
      <span
        className={cn(
          "font-mono text-5xl font-bold tracking-wider sm:text-6xl md:text-7xl transition-colors",
          feedback === "correct" && "text-success",
          feedback === "incorrect" && "text-destructive",
          !feedback && "text-foreground"
        )}
      >
        {display}
      </span>
    </div>
  );
}
