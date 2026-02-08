"use client";

import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicIndicatorProps {
  isListening: boolean;
  isSupported: boolean;
}

export function MicIndicator({ isListening, isSupported }: MicIndicatorProps) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <MicOff className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs">Voice unavailable</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-label={isListening ? "Microphone is active" : "Microphone is off"}
    >
      <div className="relative flex items-center justify-center">
        {isListening && (
          <div className="absolute h-8 w-8 rounded-full bg-primary/30 animate-pulse-ring" />
        )}
        <div
          className={cn(
            "relative flex h-6 w-6 items-center justify-center rounded-full transition-colors",
            isListening
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Mic className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
      <span
        className={cn(
          "text-xs font-medium transition-colors",
          isListening ? "text-primary" : "text-muted-foreground"
        )}
      >
        {isListening ? "Listening..." : "Hold Space to speak"}
      </span>
    </div>
  );
}
