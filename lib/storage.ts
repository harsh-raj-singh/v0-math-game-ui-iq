import type { Operation } from "@/lib/game-utils";

const SETTINGS_KEY = "mathvox-settings";
const STATS_KEY = "mathvox-stats";

export interface UserSettings {
  operations: Operation[];
  soundEnabled: boolean;
  voiceEnabled: boolean;
}

export interface GameRecord {
  id: string;
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
  timeSpentSeconds: number;
  playedAt: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  operations: ["add", "subtract"],
  soundEnabled: true,
  voiceEnabled: true,
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {
    // storage full or unavailable
  }
}

export function loadStats(): GameRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveGameRecord(record: Omit<GameRecord, "id" | "playedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const records = loadStats();
    records.unshift({
      ...record,
      id: crypto.randomUUID(),
      playedAt: new Date().toISOString(),
    });
    // Keep last 100 games
    localStorage.setItem(STATS_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    // storage full or unavailable
  }
}
