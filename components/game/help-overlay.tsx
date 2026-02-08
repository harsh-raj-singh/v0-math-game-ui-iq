"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpOverlayProps {
  onClose: () => void;
}

const COMMAND_GROUPS = [
  {
    title: "Game Controls",
    commands: [
      { command: "Start / Begin / Play", description: "Start a new game session" },
      { command: "Stop / End", description: "End the current session" },
      { command: "Clear", description: "Clear your current answer" },
      { command: "Repeat", description: "Hear the current problem read aloud" },
    ],
  },
  {
    title: "Navigation",
    commands: [
      { command: "Settings", description: "Open settings panel" },
      { command: "Stats / Statistics", description: "View your performance stats" },
      { command: "Help", description: "Show this help screen" },
      { command: "Close", description: "Close any open overlay" },
    ],
  },
  {
    title: "Keyboard Shortcuts",
    commands: [
      { command: "Hold Space", description: "Hold to activate microphone" },
      { command: "Release Space", description: "Release to stop listening and process" },
      { command: "Escape", description: "Close overlays" },
    ],
  },
  {
    title: "Answering",
    commands: [
      { command: "Say the number", description: 'e.g. "forty two" or "42"' },
      { command: "Digit-by-digit", description: '"four two" is also recognized as 42' },
      { command: "Negative numbers", description: '"negative twenty" or "minus 20"' },
    ],
  },
];

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-label="Help"
      aria-modal="true"
    >
      <div className="w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Voice Commands</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close help">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          {COMMAND_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.title}
              </span>
              {group.commands.map((cmd) => (
                <div
                  key={cmd.command}
                  className="flex items-start justify-between gap-3"
                >
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {cmd.command}
                  </code>
                  <span className="text-xs text-muted-foreground text-right">
                    {cmd.description}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Press Escape to close
        </p>
      </div>
    </div>
  );
}
