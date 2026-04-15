# Moodrift — CLAUDE.md

## What This Is

Moodrift is a mood-adaptive journaling/reflection app. It reads the user's emotional state from their text, typing speed, and interaction patterns — then reshapes its entire UI to match (and subtly counter-steer) that mood.

The core loop: **detect → adapt → nudge**.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Component-driven, strong typing for complex state |
| Styling | Tailwind CSS + CSS custom properties | Dynamic theming via CSS vars without runtime overhead |
| Animation | Framer Motion | Physics-based transitions; mood-driven spring configs |
| State | Zustand | Lightweight, no boilerplate, easy slice pattern |
| AI analysis | Gemini API (`gemini-1.5-flash`) | Free tier (15 RPM), fast mood inference |
| Build | Vite | Fast HMR for iterative UI tuning |
| Local sentiment | `sentiment` npm package | Instant offline fallback before API responds |

---

## Project Structure

```
src/
  hooks/
    useMoodDetection.ts       # Master hook — fuses all signals into MoodState
    useTypingAnalytics.ts     # Keystroke speed, rhythm, backspace rate
    useInteractionPattern.ts  # Pointer pressure proxy, scroll velocity, idle time
  services/
    claudeAnalysis.ts         # Batched Claude API calls for deep text sentiment
    localSentiment.ts         # Synchronous local sentiment as immediate signal
  theme/
    moodThemes.ts             # Theme definitions: colors, spring configs, typography
    themeEngine.ts            # Interpolates between themes; applies CSS vars
  components/
    JournalInput/             # Main writing surface — the primary interaction
    MoodOrb/                  # Ambient visual that pulses with current mood
    ThemeWrapper/             # Root component that applies dynamic theme
    MoodHistory/              # Timeline bar showing mood arc across session
    MoodHint/                 # Subtle micro-copy that nudges mood (opt-in)
  store/
    moodStore.ts              # Current mood, history, sensitivity settings
  types/
    mood.ts                   # MoodState, MoodLabel, ThemeConfig types
```

---

## Mood System

### Mood Labels
Six canonical moods (evenly cover valence × arousal space):

| Label | Valence | Arousal | Detected From |
|---|---|---|---|
| `anxious` | negative | high | fast typing, many backspaces, short sentences, filler words |
| `sad` | negative | low | slow typing, negative sentiment, long pauses |
| `angry` | negative | high | ALL CAPS, exclamation marks, short bursts, high sentiment magnitude |
| `focused` | positive | medium | steady typing rhythm, no backspaces, medium sentence length |
| `happy` | positive | high | emoji use, exclamations, positive sentiment, fast rhythm |
| `calm` | positive | low | slow deliberate typing, reflective language, long sentences |

### Signal Weights
```
textSentiment     40%   (Claude API result, debounced 1.5s)
typingSpeed       25%   (WPM relative to user's personal baseline)
backspaceRate     15%   (corrections as % of keystrokes)
pauseDuration     10%   (idle gaps between typing bursts)
interactionEnergy 10%   (scroll speed, pointer velocity)
```

### Mood → UI Nudge (the twist)
The UI responds to detected mood but steers *toward* a healthier state:

| Detected | UI Goal | Mechanism |
|---|---|---|
| `anxious` | Calm the space | Blue-gray palette, slow breathing animation on the orb, more whitespace, slower transitions |
| `sad` | Add warmth | Amber/sunrise palette, soft upward-floating particles, gentle encouraging micro-copy |
| `angry` | Cool and ground | Deep teal/indigo, heavy smooth transitions, grounding layout, no sharp edges |
| `focused` | Preserve the flow | Minimal chrome, dark mode, no distracting animations |
| `happy` | Celebrate | Vibrant gradient, playful spring animations, confetti sparingly |
| `calm` | Sustain | Soft green/lavender, gentle parallax, clean open layout |

---

## Key Architectural Decisions

### 1. Dual-pipeline sentiment
Local `sentiment` gives instant (<1ms) feedback; Claude API gives accurate deep analysis on a debounce. The UI blends both using a confidence-weighted average. Never block on the API.

### 2. CSS custom properties for theming
All theme values are applied as CSS vars at the `:root` level by `themeEngine.ts`. Framer Motion handles animated transitions. Tailwind classes remain static (layout/spacing); only custom props change.

### 3. Personal baseline calibration
Typing speed is relative. On first use, a 30-second calibration writes the user's baseline WPM to `localStorage`. All speed signals are deltas from that baseline.

### 4. Mood inertia
Raw mood updates are smoothed with a damping factor (default 0.3). Mood can't flip in under 5 seconds. This prevents jitter and makes transitions feel intentional.

### 5. Transparency & control
Users can always see the current mood label and override it. Nudging can be disabled. Sensitivity is a slider. Nothing is hidden.

---

## Gemini API Usage

- **Model**: `gemini-1.5-flash` (free tier — 15 RPM, 1M tokens/day)
- **SDK**: `@google/generative-ai`
- **Call pattern**: debounced 1500ms after last keystroke, only when text delta > 20 chars
- **Prompt**: asks for JSON-only response with mood label + confidence
- **Response parsing**: `JSON.parse` with try/catch; regex fallback for markdown-fenced JSON
- **Fallback**: if API fails or parse errors, local sentiment drives the full 100% weight

---

## What to Avoid

- Do not store journal text anywhere outside the browser (no backend, no analytics)
- Do not make the mood detection feel accusatory or clinical — language must be warm
- Do not animate too aggressively; transitions should feel like weather changing, not a strobe
- Do not make nudging feel manipulative — it should feel like a supportive environment, never coercive
- Do not over-engineer the sentiment pipeline before the UI layer is working

---

## Dev Commands

```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run typecheck # tsc --noEmit
npm run lint      # ESLint
```

---

## Environment Variables

```
VITE_GEMINI_API_KEY=   # Google Gemini API key (never commit)
```
