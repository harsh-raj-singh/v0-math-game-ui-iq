"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  generateProblem,
  parseSpokenNumber,
  problemToSpeech,
  type MathProblem,
  type Operation,
} from "@/lib/game-utils";
import { loadSettings, saveSettings, saveGameRecord } from "@/lib/storage";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { ProblemDisplay } from "@/components/game/problem-display";
import { AnswerDisplay } from "@/components/game/answer-display";
import { ScoreBar } from "@/components/game/score-bar";
import { MicIndicator } from "@/components/game/mic-indicator";
import { KeyboardInput } from "@/components/game/keyboard-input";
import { SettingsOverlay } from "@/components/game/settings-overlay";
import { StatsOverlay } from "@/components/game/stats-overlay";
import { HelpOverlay } from "@/components/game/help-overlay";
import { Button } from "@/components/ui/button";
import {
  Settings,
  BarChart3,
  HelpCircle,
  Play,
  Square,
} from "lucide-react";

const TOTAL_QUESTIONS = 20;

type GameState = "idle" | "playing" | "feedback" | "ended";
type FeedbackType = "correct" | "incorrect" | null;
type OverlayType = "settings" | "stats" | "help" | null;

interface GameStats {
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
  questionNumber: number;
  startTime: number | null;
}

export function GameClient() {
  // Settings (loaded from localStorage)
  const [operations, setOperations] = useState<Operation[]>(["add", "subtract"]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    questionNumber: 0,
    startTime: null,
  });

  // Overlays
  const [overlay, setOverlay] = useState<OverlayType>(null);

  // Voice
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    isTranscribing,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedRef = useRef("");
  const isHoldingRef = useRef(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadSettings();
    setOperations(settings.operations);
    setSoundEnabled(settings.soundEnabled);
    setVoiceEnabled(settings.voiceEnabled);
  }, []);

  // Generate next problem
  const nextProblem = useCallback(() => {
    const p = generateProblem(operations);
    setProblem(p);
    setUserAnswer("");
    setFeedback(null);
    setShowCorrectAnswer(false);
    clearTranscript();
    lastProcessedRef.current = "";
  }, [operations, clearTranscript]);

  // Start game
  const startGame = useCallback(() => {
    setGameState("playing");
    setElapsedSeconds(0);
    setStats({
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
      questionNumber: 1,
      startTime: Date.now(),
    });

    // Start the timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    nextProblem();
  }, [nextProblem]);

  // End game and save stats to localStorage
  const endGame = useCallback(() => {
    setGameState("ended");
    cancelSpeech();

    // Stop the timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (stats.correct + stats.wrong > 0) {
      const timeSpent = stats.startTime
        ? Math.floor((Date.now() - stats.startTime) / 1000)
        : 0;

      saveGameRecord({
        correct: stats.correct,
        wrong: stats.wrong,
        streak: stats.streak,
        bestStreak: stats.bestStreak,
        timeSpentSeconds: timeSpent,
      });
    }
  }, [stats, cancelSpeech]);

  // Submit answer
  const submitAnswer = useCallback(
    (answerText: string) => {
      if (!problem || gameState !== "playing") return;

      const parsed = parseSpokenNumber(answerText);
      if (parsed === null) return;

      setUserAnswer(String(parsed));

      const isLastQuestion = stats.questionNumber >= TOTAL_QUESTIONS;

      if (parsed === problem.answer) {
        setFeedback("correct");
        setStats((prev) => {
          const newStreak = prev.streak + 1;
          return {
            ...prev,
            correct: prev.correct + 1,
            streak: newStreak,
            bestStreak: Math.max(prev.bestStreak, newStreak),
          };
        });

        feedbackTimeoutRef.current = setTimeout(() => {
          setFeedback(null);
          if (isLastQuestion) {
            endGame();
          } else {
            setStats((prev) => ({ ...prev, questionNumber: prev.questionNumber + 1 }));
            nextProblem();
          }
        }, 1000);
      } else {
        setFeedback("incorrect");
        setStats((prev) => ({
          ...prev,
          wrong: prev.wrong + 1,
          streak: 0,
        }));

        if (soundEnabled) {
          speak(`The answer is ${problem.answer}`);
        }

        setShowCorrectAnswer(true);
        feedbackTimeoutRef.current = setTimeout(() => {
          setShowCorrectAnswer(false);
          setFeedback(null);
          setUserAnswer("");
          clearTranscript();
          lastProcessedRef.current = "";
          if (isLastQuestion) {
            endGame();
          } else {
            setStats((prev) => ({ ...prev, questionNumber: prev.questionNumber + 1 }));
            nextProblem();
          }
        }, 2500);
      }
    },
    [problem, gameState, soundEnabled, speak, nextProblem, clearTranscript, endGame, stats.questionNumber]
  );

  // Process voice transcript
  useEffect(() => {
    if (!transcript || gameState !== "playing" || feedback) return;

    const lower = transcript.toLowerCase().trim();
    if (lower === lastProcessedRef.current) return;

    if (lower.includes("stop") || lower.includes("end")) {
      lastProcessedRef.current = lower;
      endGame();
      return;
    }
    if (lower.includes("repeat") && problem && soundEnabled) {
      lastProcessedRef.current = lower;
      speak(problemToSpeech(problem));
      clearTranscript();
      return;
    }
    if (lower.includes("clear")) {
      lastProcessedRef.current = lower;
      setUserAnswer("");
      clearTranscript();
      return;
    }
    if (lower.includes("settings") || lower.includes("setting")) {
      lastProcessedRef.current = lower;
      setOverlay("settings");
      clearTranscript();
      return;
    }
    if (lower.includes("stats") || lower.includes("statistics")) {
      lastProcessedRef.current = lower;
      setOverlay("stats");
      clearTranscript();
      return;
    }
    if (lower.includes("help")) {
      lastProcessedRef.current = lower;
      setOverlay("help");
      clearTranscript();
      return;
    }

    const parsed = parseSpokenNumber(lower);
    if (parsed !== null) {
      lastProcessedRef.current = lower;
      submitAnswer(lower);
    }
  }, [
    transcript,
    gameState,
    feedback,
    problem,
    soundEnabled,
    speak,
    clearTranscript,
    endGame,
    submitAnswer,
  ]);

  // Idle state voice detection
  useEffect(() => {
    if (gameState !== "idle" && gameState !== "ended") return;
    if (!transcript) return;

    const lower = transcript.toLowerCase().trim();
    if (lower.includes("start") || lower.includes("begin") || lower.includes("play")) {
      clearTranscript();
      lastProcessedRef.current = "";
      startGame();
    }
  }, [transcript, gameState, clearTranscript, startGame]);

  // Hold-to-talk with spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isHoldingRef.current) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        e.preventDefault();
        isHoldingRef.current = true;
        clearTranscript();
        void startListening();
      }
      if (e.code === "Escape") {
        setOverlay(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isHoldingRef.current) {
        e.preventDefault();
        isHoldingRef.current = false;
        stopListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startListening, stopListening, clearTranscript]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const accuracy =
    stats.correct + stats.wrong > 0
      ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
      : 0;

  return (
    <main className="relative flex min-h-svh flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <h1 className="font-mono text-lg font-bold tracking-tight">
          MathVox
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOverlay("settings")}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOverlay("stats")}
            aria-label="Statistics"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOverlay("help")}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-24">
        {gameState === "idle" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-balance">
                Ready to practice?
              </h2>
              <p className="text-sm text-muted-foreground">
                Hold Space and say &quot;Start&quot; or press the button below
              </p>
            </div>
            <Button onClick={startGame} size="lg" className="gap-2">
              <Play className="h-4 w-4" aria-hidden="true" />
              Start Game
            </Button>
          </div>
        )}

        {gameState === "ended" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Round Complete
              </h2>
              <p className="text-sm text-muted-foreground">
                {stats.correct} out of {TOTAL_QUESTIONS} correct in{" "}
                {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col rounded-lg border bg-card p-4">
                <span className="text-xs text-muted-foreground">Correct</span>
                <span className="font-mono text-2xl font-bold text-success">
                  {stats.correct}
                </span>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-4">
                <span className="text-xs text-muted-foreground">Wrong</span>
                <span className="font-mono text-2xl font-bold text-destructive">
                  {stats.wrong}
                </span>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-4">
                <span className="text-xs text-muted-foreground">Accuracy</span>
                <span className="font-mono text-2xl font-bold">{accuracy}%</span>
              </div>
              <div className="flex flex-col rounded-lg border bg-card p-4">
                <span className="text-xs text-muted-foreground">
                  Best Streak
                </span>
                <span className="font-mono text-2xl font-bold text-orange-500">
                  {stats.bestStreak}
                </span>
              </div>
              <div className="col-span-2 flex flex-col rounded-lg border bg-card p-4">
                <span className="text-xs text-muted-foreground">Total Time</span>
                <span className="font-mono text-2xl font-bold">
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <Button onClick={startGame} size="lg" className="gap-2">
              <Play className="h-4 w-4" aria-hidden="true" />
              Play Again
            </Button>
            <p className="text-xs text-muted-foreground">
              Or hold Space and say &quot;Start&quot;
            </p>
          </div>
        )}

        {(gameState === "playing" || gameState === "feedback") && problem && (
          <div className="flex w-full max-w-md flex-col items-center gap-8">
            <ScoreBar
              score={stats.correct}
              streak={stats.streak}
              accuracy={accuracy}
              questionNumber={stats.questionNumber}
              totalQuestions={TOTAL_QUESTIONS}
              elapsedSeconds={elapsedSeconds}
            />
            <ProblemDisplay display={problem.display} feedback={feedback} />
            <AnswerDisplay
              answer={userAnswer}
              interimText={interimTranscript}
              correctAnswer={problem.answer}
              showCorrectAnswer={showCorrectAnswer}
            />
            <KeyboardInput onSubmit={(val) => submitAnswer(val)} />
            <Button
              variant="ghost"
              size="sm"
              onClick={endGame}
              className="gap-2 text-muted-foreground"
            >
              <Square className="h-3 w-3" aria-hidden="true" />
              End Session
            </Button>
          </div>
        )}
      </div>

      {/* Bottom mic status */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center border-t bg-background/80 px-4 py-3 backdrop-blur-sm">
        <MicIndicator isListening={isListening} isSupported={isSupported} isTranscribing={isTranscribing} />
      </div>

      {/* Overlays */}
      {overlay === "settings" && (
        <SettingsOverlay
          operations={operations}
          soundEnabled={soundEnabled}
          voiceEnabled={voiceEnabled}
          onOperationsChange={(ops) => {
            setOperations(ops);
            saveSettings({ operations: ops });
          }}
          onSoundChange={(val) => {
            setSoundEnabled(val);
            saveSettings({ soundEnabled: val });
          }}
          onVoiceChange={(val) => {
            setVoiceEnabled(val);
            saveSettings({ voiceEnabled: val });
          }}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay === "stats" && (
        <StatsOverlay onClose={() => setOverlay(null)} />
      )}
      {overlay === "help" && (
        <HelpOverlay onClose={() => setOverlay(null)} />
      )}
    </main>
  );
}
