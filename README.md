# MathVox

A voice-controlled mental math game built with Next.js 16 and Groq's Whisper API. Hold the spacebar, say your answer, and race through 20 questions as fast as you can.

## How It Works

```
[Hold Space] -> MediaRecorder captures audio
[Release Space] -> Audio blob sent to /api/transcribe
                -> Forwarded to Groq Whisper (whisper-large-v3-turbo)
                -> Transcript parsed into a number
                -> Answer checked against the math problem
```

The game generates arithmetic problems (addition, subtraction, multiplication, division), and you answer by voice or keyboard. Each round is 20 questions with a running timer -- your goal is accuracy and speed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS, shadcn/ui |
| Speech-to-Text | Groq Whisper API (`whisper-large-v3-turbo`) |
| Audio Capture | Web MediaRecorder API |
| Text-to-Speech | Web Speech Synthesis API |
| State | React hooks + localStorage |
| Deployment | Vercel |

## Features

- **Voice Input** -- Hold spacebar to record, release to transcribe. Uses Groq's Whisper model for fast, accurate number recognition.
- **Keyboard Fallback** -- Type your answer if you prefer. Always available alongside voice.
- **20-Question Rounds** -- Each game is exactly 20 problems with a live timer and question counter.
- **Configurable Operations** -- Choose from addition, subtraction, multiplication, and division in settings.
- **Score Tracking** -- Accuracy percentage, current streak, best streak, and total time displayed in real-time.
- **Game History** -- Past game records saved to localStorage and viewable in the stats overlay.
- **Voice Commands** -- Say "start", "stop", "repeat", "settings", "stats", or "help" during gameplay.
- **Dark Mode** -- Ships with dark theme by default via next-themes.

## Project Structure

```
app/
  api/transcribe/    # Groq Whisper proxy route
  game/              # Game page (server component wrapper)
  page.tsx           # Redirects to /game
components/game/
  game-client.tsx    # Main game logic (client component)
  problem-display    # Math problem renderer
  answer-display     # User answer + feedback
  score-bar          # Question counter, timer, streak, accuracy
  mic-indicator      # Recording/transcribing status
  keyboard-input     # Numeric keyboard fallback
  settings-overlay   # Operation toggles, sound/voice controls
  stats-overlay      # Game history from localStorage
  help-overlay       # Keyboard shortcuts and voice commands
hooks/
  use-speech-recognition.ts  # MediaRecorder + Groq transcription
  use-speech-synthesis.ts    # Browser TTS wrapper
lib/
  game-utils.ts      # Problem generation, spoken number parsing
  storage.ts         # localStorage helpers for settings and stats
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Groq API key](https://console.groq.com/)

### Setup

```bash
git clone https://github.com/harsh-raj-singh/v0-math-game-ui.git
cd v0-math-game-ui
pnpm install
```

Create a `.env.local` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and press Space to start talking.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | API key from [Groq Console](https://console.groq.com/) for Whisper speech-to-text |

## How the Speech Pipeline Works

1. **Capture** -- `MediaRecorder` records audio in `webm/opus` (or `mp4` on Safari) while the spacebar is held.
2. **Send** -- On release, the audio blob is POSTed to `/api/transcribe` as multipart form data.
3. **Transcribe** -- The API route forwards the audio to Groq's `whisper-large-v3-turbo` model with a math-context prompt.
4. **Parse** -- The returned text is run through `parseSpokenNumber()` which handles words ("forty-two"), digits ("42"), and edge cases ("for" -> 4, "ate" -> 8).
5. **Evaluate** -- The parsed number is compared to the problem's answer, feedback is shown, and the next question loads.

## License

MIT
