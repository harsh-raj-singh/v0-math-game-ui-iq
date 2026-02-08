"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import type { Operation } from "@/lib/game-utils";

const ALL_OPERATIONS: { value: Operation; label: string }[] = [
  { value: "add", label: "Addition (+)" },
  { value: "subtract", label: "Subtraction (-)" },
  { value: "multiply", label: "Multiplication (\u00d7)" },
  { value: "divide", label: "Division (\u00f7)" },
];

interface SettingsOverlayProps {
  operations: Operation[];
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onOperationsChange: (ops: Operation[]) => void;
  onSoundChange: (val: boolean) => void;
  onVoiceChange: (val: boolean) => void;
  onClose: () => void;
}

export function SettingsOverlay({
  operations,
  soundEnabled,
  voiceEnabled,
  onOperationsChange,
  onSoundChange,
  onVoiceChange,
  onClose,
}: SettingsOverlayProps) {
  const { theme, setTheme } = useTheme();

  const toggleOperation = (op: Operation) => {
    if (operations.includes(op)) {
      if (operations.length <= 1) return;
      onOperationsChange(operations.filter((o) => o !== op));
    } else {
      onOperationsChange([...operations, op]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-label="Settings"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Operations */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Operations
            </span>
            {ALL_OPERATIONS.map((op) => (
              <div key={op.value} className="flex items-center justify-between">
                <Label htmlFor={`op-${op.value}`} className="text-sm">
                  {op.label}
                </Label>
                <Switch
                  id={`op-${op.value}`}
                  checked={operations.includes(op.value)}
                  onCheckedChange={() => toggleOperation(op.value)}
                  disabled={operations.length <= 1 && operations.includes(op.value)}
                />
              </div>
            ))}
          </div>

          {/* Sound */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Audio
            </span>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="text-sm">
                Voice Feedback
              </Label>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={onSoundChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="voice" className="text-sm">
                Voice Input
              </Label>
              <Switch
                id="voice"
                checked={voiceEnabled}
                onCheckedChange={onVoiceChange}
              />
            </div>
          </div>

          {/* Theme */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Appearance
            </span>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-sm">
                Dark Mode
              </Label>
              <Switch
                id="theme"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Say &quot;Close&quot; or press Escape to close
        </p>
      </div>
    </div>
  );
}
