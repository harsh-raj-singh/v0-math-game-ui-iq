"use client";

import { cn } from "@/lib/utils";

interface AnswerDisplayProps {
  answer: string;
  interimText: string;
  correctAnswer: number | null;
  showCorrectAnswer: boolean;
}

export function AnswerDisplay({
  answer,
  interimText,
  correctAnswer,
  showCorrectAnswer,
}: AnswerDisplayProps) {
  if (showCorrectAnswer && correctAnswer !== null) {
    return (
      <div className="flex flex-col items-center gap-2" role="status" aria-live="assertive">
        <span className="text-xs font-medium text-destructive uppercase tracking-wider">
          Correct answer
        </span>
        <span className="font-mono text-4xl font-bold text-destructive sm:text-5xl">
          {correctAnswer}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Your answer
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-mono text-4xl font-bold sm:text-5xl",
            answer ? "text-foreground" : "text-muted-foreground/40"
          )}
        >
          {answer || "?"}
        </span>
        {interimText && (
          <span className="font-mono text-2xl text-muted-foreground/60 sm:text-3xl">
            {interimText}
          </span>
        )}
      </div>
    </div>
  );
}
