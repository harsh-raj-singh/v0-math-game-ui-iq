"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { loadStats } from "@/lib/storage";

interface StatsData {
  totalGames: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  totalTime: number;
  accuracy: number;
}

interface StatsOverlayProps {
  onClose: () => void;
}

export function StatsOverlay({ onClose }: StatsOverlayProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const records = loadStats();
    if (records.length > 0) {
      const totalCorrect = records.reduce((s, r) => s + r.correct, 0);
      const totalWrong = records.reduce((s, r) => s + r.wrong, 0);
      const bestStreak = Math.max(...records.map((r) => r.bestStreak));
      const totalTime = records.reduce((s, r) => s + r.timeSpentSeconds, 0);
      const total = totalCorrect + totalWrong;

      setStats({
        totalGames: records.length,
        totalCorrect,
        totalWrong,
        bestStreak,
        totalTime,
        accuracy: total > 0 ? Math.round((totalCorrect / total) * 100) : 0,
      });
    }
    setLoading(false);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-label="Statistics"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Statistics</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close statistics">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading...
          </p>
        ) : !stats ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No games played yet. Start a session to see your stats!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Games Played" value={String(stats.totalGames)} />
            <StatCard label="Total Correct" value={String(stats.totalCorrect)} />
            <StatCard label="Total Wrong" value={String(stats.totalWrong)} />
            <StatCard label="Accuracy" value={`${stats.accuracy}%`} />
            <StatCard label="Best Streak" value={String(stats.bestStreak)} />
            <StatCard label="Total Time" value={formatTime(stats.totalTime)} />
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Say &quot;Close&quot; or press Escape to close
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-background p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xl font-bold">{value}</span>
    </div>
  );
}
