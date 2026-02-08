"use client";

import { Flame, Target, Hash, Clock } from "lucide-react";

interface ScoreBarProps {
  score: number;
  streak: number;
  accuracy: number;
  questionNumber: number;
  totalQuestions: number;
  elapsedSeconds: number;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ScoreBar({ score, streak, accuracy, questionNumber, totalQuestions, elapsedSeconds }: ScoreBarProps) {
  return (
    <div
      className="flex items-center justify-center gap-5 sm:gap-7"
      role="status"
      aria-label={`Question ${questionNumber} of ${totalQuestions}, Time: ${formatTime(elapsedSeconds)}, Score: ${score}, Streak: ${streak}, Accuracy: ${accuracy}%`}
    >
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Question</span>
          <span className="font-mono text-lg font-bold">{questionNumber}/{totalQuestions}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Time</span>
          <span className="font-mono text-lg font-bold">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Streak</span>
          <span className="font-mono text-lg font-bold">{streak}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Accuracy</span>
          <span className="font-mono text-lg font-bold">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
