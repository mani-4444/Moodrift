# Moodrift — Implementation Plan

## The Concept

> "What if your workspace *breathed* with you?"

Moodrift is a mood-adaptive journal. You type. It listens — not to what you say, but *how* you say it. Then it reshapes itself around you: softer when you're stressed, warmer when you're sad, sharper when you need to focus. And quietly, it nudges you back toward balance.

This isn't a wellness app. It's an environment that responds to you the way a room with good lighting and temperature responds — you don't notice it helping until you realize you feel better.

---

## The Twist: Environmental Therapy Through Design

Most mood apps *track* mood. Moodrift *responds to* mood with a **counter-steering** principle borrowed from emotional regulation research:

- Anxious? The UI breathes slower than you. You unconsciously sync to it.
- Sad? The palette introduces warmth and upward motion. Your eye follows.
- Angry? The layout becomes spacious and cool. The friction disappears.
- Focused? Everything disappears but the text.

The nudge is **never text-based advice**. It's purely environmental — color, motion, space, weight. The user doesn't need to know it's happening. It just works.

---

## Signal Architecture

### Text Signals (via Claude API + local fallback)
- Sentiment polarity (positive / negative magnitude)
- Arousal indicators: punctuation density, capitalization, sentence length
- Word choice patterns: hedging ("maybe", "I don't know"), absolutism ("always", "never"), emotional vocabulary

### Typing Signals (real-time, local)
- **WPM** relative to personal baseline (fast = stressed/excited, slow = sad/focused)
- **Burst pattern**: long uninterrupted bursts (focused) vs short scattered bursts (anxious)
- **Backspace rate**: high backspace % = self-criticism, uncertainty, anxiety
- **Pause cadence**: regular pauses (calm reflection) vs erratic stops (distraction)

### Interaction Signals (real-time, local)
- **Scroll velocity**: slow = reading carefully, fast = avoidance/agitation
- **Pointer acceleration**: rapid movements = high arousal
- **Idle gaps**: extended pauses may indicate low energy or deep thought

### Contextual Signals (lightweight)
- Time of day (late night + sad text = extra warmth)
- Session length (long session = sustained focus or rumination)

---

## Mood State Machine

```
         ┌──────────────────────────────────┐
         │         Raw Signal Inputs         │
         │  text | typing | interaction      │
         └──────────────┬───────────────────┘
                        │
                   [Fusion Layer]
               weighted average, 0–1
                        │
                   [Inertia Filter]
              damping: 0.3, min 5s hold
                        │
                ┌───────▼────────┐
                │  MoodState     │
                │  label: string │
                │  intensity: num│
                │  confidence: % │
                └───────┬────────┘
                        │
            ┌───────────▼────────────┐
            │     Theme Engine       │
            │  target theme lookup   │
            │  interpolate CSS vars  │
            │  set spring configs    │
            └────────────────────────┘
```

---

## Theme System Design

Each mood maps to a `ThemeConfig`:

```typescript
interface ThemeConfig {
  // Color
  background: string      // HSL
  surface: string
  text: string
  accent: string
  accentSecondary: string

  // Motion
  springStiffness: number   // high = snappy (happy), low = slow (calm)
  springDamping: number
  transitionDuration: number  // ms
  particleSpeed: number

  // Layout
  contentWidth: string      // narrower when anxious (less overwhelm)
  lineHeight: string        // looser when anxious
  letterSpacing: string

  // Orb
  orbPulseRate: number      // BPM equivalent — slow for calming
  orbGlow: string
  orbScale: [number, number]  // min, max pulse range

  // Typography
  fontWeight: number
  fontSize: string
}
```

### Mood Themes at a Glance

| Mood | Background | Accent | Spring | Orb BPM | Vibe |
|---|---|---|---|---|---|
| `anxious` | Cool blue-gray `hsl(220,20%,18%)` | Soft blue `hsl(210,60%,65%)` | stiff=20, damp=15 | 10 (slow) | Spacious, breathing room |
| `sad` | Deep warm gray `hsl(30,10%,16%)` | Amber `hsl(38,90%,60%)` | stiff=15, damp=20 | 14 | Warm, upward float |
| `angry` | Dark teal `hsl(185,25%,14%)` | Cool teal `hsl(185,50%,55%)` | stiff=30, damp=25 | 16 | Grounded, smooth, cool |
| `focused` | Near-black `hsl(0,0%,10%)` | Electric violet `hsl(265,80%,65%)` | stiff=80, damp=30 | 20 | Minimal, sharp |
| `happy` | Warm white `hsl(45,30%,97%)` | Coral `hsl(15,85%,60%)` | stiff=200, damp=15 | 28 | Vibrant, bouncy |
| `calm` | Soft sage `hsl(140,15%,18%)` | Lavender `hsl(270,30%,70%)` | stiff=10, damp=20 | 12 | Open, serene |

---

## Implementation Phases

### Phase 1 — Foundation (Scaffold + Core Loop)
**Goal**: A working app where typing triggers visible theme changes.

- [ ] Vite + React + TypeScript + Tailwind + Framer Motion setup
- [ ] Zustand mood store (`moodStore.ts`)
- [ ] `JournalInput` component (full-screen textarea)
- [ ] `useTypingAnalytics` hook (WPM, backspace rate, burst detection)
- [ ] `localSentiment.ts` using the `sentiment` npm package
- [ ] 3 hardcoded themes (calm, anxious, happy) as proof of concept
- [ ] `ThemeWrapper` applying CSS vars from current theme
- [ ] Basic `MoodOrb` — a pulsing circle that changes color with mood
- **Exit criteria**: typing in an anxious way visibly shifts colors

### Phase 2 — Full Mood Detection
**Goal**: All 6 moods detected accurately from real signals.

- [ ] All 6 `ThemeConfig` definitions in `moodThemes.ts`
- [ ] `useMoodDetection` fusion hook with weighted signal average
- [ ] Mood inertia filter (damping + minimum hold time)
- [ ] Personal baseline calibration (30s warmup → localStorage)
- [ ] `useInteractionPattern` hook (scroll velocity, pointer energy)
- [ ] Gemini API integration (`geminiAnalysis.ts`) with debounce + JSON parsing
- [ ] Dual-pipeline blend (local 100% → graceful upgrade to 60/40 when API ready)
- **Exit criteria**: all 6 moods triggerable, no jitter, smooth transitions

### Phase 3 — Theme Engine Polish
**Goal**: Transitions feel like weather changing, not a toggle.

- [ ] `themeEngine.ts` — smooth interpolation between themes via CSS var animation
- [ ] Framer Motion spring configs driven by `ThemeConfig.springStiffness/Damping`
- [ ] Layout shifts for mood (content width, line height) via CSS vars
- [ ] `MoodOrb` full implementation: pulse rate, glow, scale animation, color
- [ ] Particle system for `sad` (upward float) and `happy` (confetti burst, rare)
- [ ] Background ambient texture per mood (subtle SVG noise or gradient)
- **Exit criteria**: theme transitions feel intentional and emotional, not mechanical

### Phase 4 — Nudge Layer
**Goal**: The UI subtly steers mood without the user knowing.

- [ ] Breathing animation on orb synced to target (not current) BPM
- [ ] Micro-copy system — `MoodHint` component shows 1-line ambient phrases
  - Not "You seem stressed." Instead: "Take up some space." / "Let it land."
- [ ] Smooth layout expansion for anxious state (more whitespace = less overwhelm)
- [ ] For `sad`: warm-toned particles that float upward (subconscious upward motion)
- [ ] For `angry`: all transitions are extra-smooth, no sudden jarring changes
- [ ] User settings: nudge on/off, sensitivity slider, mood override
- **Exit criteria**: blind test — give 5 people the app, see if mood improves

### Phase 5 — Mood History + UX Polish
**Goal**: A complete, shippable experience.

- [ ] `MoodHistory` timeline — a subtle bar at the top showing mood arc
- [ ] Session summary on close: "You moved from anxious → calm in 12 minutes."
- [ ] Smooth onboarding (calibration screen, one-time explanation of the concept)
- [ ] Keyboard shortcut: `Esc` to enter fullscreen focus mode
- [ ] Export session as plain text (never with mood metadata unless user asks)
- [ ] Dark/light mode as baseline beneath mood themes
- [ ] Mobile responsive layout
- [ ] Final performance audit (no layout thrash, all animations GPU-composited)

---

## File Creation Order

1. `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`
2. `src/types/mood.ts`
3. `src/store/moodStore.ts`
4. `src/theme/moodThemes.ts`
5. `src/theme/themeEngine.ts`
6. `src/services/localSentiment.ts`
7. `src/hooks/useTypingAnalytics.ts`
8. `src/hooks/useMoodDetection.ts`
9. `src/components/ThemeWrapper/`
10. `src/components/JournalInput/`
11. `src/components/MoodOrb/`
12. `src/services/geminiAnalysis.ts`
13. `src/hooks/useInteractionPattern.ts`
14. `src/components/MoodHistory/`
15. `src/components/MoodHint/`
16. `src/App.tsx` + `src/main.tsx`

---

## Open Questions / Design Decisions

1. **Privacy model**: Should journal text ever leave the browser? Current answer: no. Claude API only receives the *last typed sentence* (not full text), stripped of names.
2. **Mood persistence**: Should mood state persist across sessions? Could cause the app to start sad if you left sad. Leaning toward fresh start each session.
3. **Sound layer**: Ambient audio (rain, tone, etc.) could massively amplify the nudge effect but creates complexity. Phase 6 if ever.
4. **Multi-user**: Not in scope. This is personal, local, private.
5. **Mobile gestures**: Swipe velocity and pressure as mood signals on touch devices — worth exploring in Phase 2.

---

## Success Metrics

- Theme transitions feel smooth and intentional (not jarring)
- Mood detection is accurate 70%+ of the time without user override
- Users feel calmer / better after 5 minutes of anxious writing (the core promise)
- Zero perceived latency on UI response (local signals, never wait for API)
- The experience feels like a place, not a tool
