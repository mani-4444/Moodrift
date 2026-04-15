import { useCallback, useRef } from 'react'
import { analyzeSentiment } from '../services/localSentiment'
import { analyzeWithGemini, type GeminiMoodResult } from '../services/geminiAnalysis'
import { useMoodStore } from '../store/moodStore'
import type { MoodLabel, MoodState } from '../types/mood'
import { getBaselineWPM } from './useTypingAnalytics'
import type { TypingAnalytics } from './useTypingAnalytics'
import type { InteractionPattern } from './useInteractionPattern'

// ── Signal weights (sum = 1.0) ──────────────────────────────────────────────
const W_TEXT = 0.40
const W_SPEED = 0.25
const W_BACKSPACE = 0.15
const W_PAUSE = 0.10
const W_INTERACTION = 0.10

// ── Inertia ──────────────────────────────────────────────────────────────────
const EMA_ALPHA = 0.3          // smoothing factor: lower = more stable
const MIN_HOLD_MS = 5000        // minimum time before label can change

// ── Update throttle ──────────────────────────────────────────────────────────
const UPDATE_INTERVAL_MS = 600

/**
 * Maps continuous signal scores to a discrete MoodLabel.
 *
 * valence: 0 (negative) → 1 (positive)
 * arousal: 0 (low)      → 1 (high)
 */
function scoresToLabel(valence: number, arousal: number, backspaceRate: number): MoodLabel {
  const isPositive = valence > 0.58
  const isNegative = valence < 0.42
  const isHighArousal = arousal > 0.58
  const isLowArousal = arousal < 0.38
  const highBackspace = backspaceRate > 0.18

  if (isNegative && isHighArousal) return highBackspace ? 'anxious' : 'angry'
  if (isNegative && !isHighArousal) return 'sad'
  if (isPositive && isHighArousal) return 'happy'
  if (!isNegative && !isHighArousal && !isPositive && backspaceRate < 0.08) return 'focused'
  if (isLowArousal && !isNegative) return 'calm'
  return 'calm'
}

export function useMoodDetection() {
  const { setMood, sensitivity, manualOverride } = useMoodStore()

  // Inertia state (refs — no re-render needed)
  const smoothedValence = useRef(0.5)
  const smoothedArousal = useRef(0.5)
  const lastLabel = useRef<MoodLabel>('calm')
  const lastLabelTime = useRef(0)
  const lastUpdateTime = useRef(0)

  // Latest Gemini result (populated asynchronously)
  const geminiResult = useRef<GeminiMoodResult | null>(null)

  const detect = useCallback(
    (
      text: string,
      analytics: TypingAnalytics,
      interaction: InteractionPattern,
    ) => {
      const now = Date.now()
      if (now - lastUpdateTime.current < UPDATE_INTERVAL_MS) return
      lastUpdateTime.current = now

      // Manual override bypasses everything
      if (manualOverride) {
        setMood({ label: manualOverride, intensity: 0.8, confidence: 1.0 })
        return
      }

      // ── 1. Local sentiment (text signal) ────────────────────────────────
      const sentiment = analyzeSentiment(text)
      const localValence = sentiment.normalizedScore // 0=neg, 1=pos

      // ── 2. Kick off async Gemini call (fires after 1.5s debounce) ───────
      analyzeWithGemini(text, (result) => {
        geminiResult.current = result
      })

      // ── 3. Blend local + Gemini (if available) ───────────────────────────
      const gemini = geminiResult.current
      let blendedValence = localValence

      if (gemini) {
        // Map Gemini mood label to a valence value
        const geminiValenceMap: Record<MoodLabel, number> = {
          happy: 0.85,
          calm: 0.72,
          focused: 0.62,
          anxious: 0.35,
          sad: 0.25,
          angry: 0.15,
        }
        const geminiValence = geminiValenceMap[gemini.mood]
        const apiWeight = gemini.confidence * W_TEXT
        const localWeight = W_TEXT - apiWeight
        blendedValence =
          (localValence * localWeight + geminiValence * apiWeight) / W_TEXT
      }

      // ── 4. Typing speed signal → arousal ────────────────────────────────
      const baseline = getBaselineWPM()
      const relativeSpeed = baseline > 0 ? (analytics.wpm - baseline) / baseline : 0
      // Map relative speed (-1..+1) to arousal (0..1)
      const typingArousal = Math.max(0, Math.min(1, (relativeSpeed + 1) / 2))

      // ── 5. Backspace signal → reduces valence, raises arousal ────────────
      const backspacePenalty = analytics.backspaceRate * 0.4 // max 0.4 drag on valence

      // ── 6. Pause signal → low pause = high arousal ───────────────────────
      // > 8s pause = very low arousal; < 1s = high
      const pauseArousal = Math.max(0, 1 - analytics.pauseDurationMs / 8000)

      // ── 7. Interaction energy signal ─────────────────────────────────────
      // scrollVelocity >300px/s = high arousal; pointerEnergy 0–1 direct
      const scrollArousal = Math.min(1, interaction.scrollVelocity / 300)
      const interactionArousal = (scrollArousal + interaction.pointerEnergy) / 2

      // ── 8. Weighted final valence & arousal ──────────────────────────────
      const rawValence = Math.max(0, blendedValence - backspacePenalty * W_BACKSPACE)

      const rawArousal =
        typingArousal * W_SPEED +
        pauseArousal * W_PAUSE +
        interactionArousal * W_INTERACTION

      // Normalise arousal to 0–1 range (weights don't sum to 1 here)
      const arousalWeightSum = W_SPEED + W_PAUSE + W_INTERACTION
      const normArousal = Math.max(0, Math.min(1, rawArousal / arousalWeightSum))

      // ── 9. Apply sensitivity scaling ─────────────────────────────────────
      const sens = sensitivity
      const scaledValence = 0.5 + (rawValence - 0.5) * sens
      const scaledArousal = 0.5 + (normArousal - 0.5) * sens

      // ── 10. EMA smoothing (inertia) ───────────────────────────────────────
      smoothedValence.current =
        smoothedValence.current * (1 - EMA_ALPHA) + scaledValence * EMA_ALPHA
      smoothedArousal.current =
        smoothedArousal.current * (1 - EMA_ALPHA) + scaledArousal * EMA_ALPHA

      // ── 11. Label with minimum hold time ─────────────────────────────────
      const candidateLabel = scoresToLabel(
        smoothedValence.current,
        smoothedArousal.current,
        analytics.backspaceRate,
      )

      const holdElapsed = now - lastLabelTime.current
      const label =
        candidateLabel !== lastLabel.current && holdElapsed < MIN_HOLD_MS
          ? lastLabel.current  // keep current label until hold time expires
          : candidateLabel

      if (label !== lastLabel.current) {
        lastLabel.current = label
        lastLabelTime.current = now
      }

      // ── 12. Compute intensity from distance from neutral (0.5, 0.5) ──────
      const vDist = Math.abs(smoothedValence.current - 0.5)
      const aDist = Math.abs(smoothedArousal.current - 0.5)
      const intensity = Math.min(1, Math.sqrt(vDist * vDist + aDist * aDist) * 2)

      const confidence = gemini ? 0.5 + gemini.confidence * 0.4 : 0.4

      const mood: MoodState = { label, intensity, confidence }
      setMood(mood)
    },
    [setMood, sensitivity, manualOverride],
  )

  return { detect }
}
