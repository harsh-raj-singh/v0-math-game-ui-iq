"use client";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicIndicatorProps {
  isListening: boolean;
  isSupported: boolean;
  isTranscribing?: boolean;
}

export function MicIndicator({ isListening, isSupported, isTranscribing }: MicIndicatorProps) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <MicOff className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs">Mic unavailable -- use keyboard</span>
      </div>
    );
  }

  const label = isListening
    ? "Listening..."
    : isTranscribing
      ? "Transcribing..."
      : "Hold Space to speak";

  const isActive = isListening || isTranscribing;

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={label}
    >
      <div className="relative flex items-center justify-center">
        {isListening && (
          <div className="absolute h-8 w-8 rounded-full bg-primary/30 animate-pulse-ring" />
        )}
        {isTranscribing && !isListening && (
          <div className="absolute h-8 w-8 rounded-full bg-orange-400/30 animate-pulse" />
        )}
        <div
          className={cn(
            "relative flex h-6 w-6 items-center justify-center rounded-full transition-colors",
            isListening
              ? "bg-primary text-primary-foreground"
              : isTranscribing
                ? "bg-orange-500 text-white"
                : "bg-muted text-muted-foreground"
          )}
        >
          {isTranscribing && !isListening ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </div>
      </div>
      <span
        className={cn(
          "text-xs font-medium transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
