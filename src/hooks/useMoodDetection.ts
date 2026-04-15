import { useCallback, useRef } from 'react'
import { analyzeSentiment } from '../services/localSentiment'
import { useMoodStore } from '../store/moodStore'
import type { MoodLabel, MoodState } from '../types/mood'
import type { TypingAnalytics } from './useTypingAnalytics'

// Baseline WPM — updated by calibration in Phase 2, reasonable default here
const DEFAULT_BASELINE_WPM = 50

function getBaselineWPM(): number {
  const stored = localStorage.getItem('moodrift_baseline_wpm')
  return stored ? parseFloat(stored) : DEFAULT_BASELINE_WPM
}

/**
 * Maps fused signal score (0–1) + sub-signals to a mood label.
 *
 * Phase 1 simplified logic:
 *   - High arousal negative signals → anxious
 *   - Low arousal negative signals → sad
 *   - High arousal positive signals → happy
 *   - Low arousal + positive → calm
 *   - Medium with steady typing → focused
 */
function inferMoodLabel(
  sentimentNorm: number,    // 0=negative, 1=positive
  relativeSpeed: number,    // -1=slow, 0=baseline, +1=fast
  backspaceRate: number,    // 0–1
  comparative: number,      // raw sentiment per word
): MoodLabel {
  const isPositive = sentimentNorm > 0.6
  const isNegative = sentimentNorm < 0.4
  const isHighArousal = relativeSpeed > 0.2
  const isLowArousal = relativeSpeed < -0.2
  const hasHighBackspace = backspaceRate > 0.2

  if (isNegative && (isHighArousal || hasHighBackspace)) return 'anxious'
  if (isNegative && isLowArousal) return 'sad'
  if (isNegative && Math.abs(comparative) > 1.5) return 'angry'
  if (isPositive && isHighArousal) return 'happy'
  if (!isHighArousal && !isLowArousal && !isNegative && backspaceRate < 0.08) return 'focused'
  if (isPositive || (!isNegative && isLowArousal)) return 'calm'
  return 'calm'
}

export function useMoodDetection() {
  const { setMood, sensitivity, manualOverride } = useMoodStore()
  const lastUpdateTime = useRef(0)
  const UPDATE_INTERVAL_MS = 800

  const detect = useCallback(
    (text: string, analytics: TypingAnalytics) => {
      // Respect minimum update interval to avoid thrashing
      const now = Date.now()
      if (now - lastUpdateTime.current < UPDATE_INTERVAL_MS) return
      lastUpdateTime.current = now

      // Manual override bypasses detection
      if (manualOverride) {
        setMood({ label: manualOverride, intensity: 0.8, confidence: 1.0 })
        return
      }

      const sentiment = analyzeSentiment(text)
      const baseline = getBaselineWPM()
      const relativeSpeed = baseline > 0 ? (analytics.wpm - baseline) / baseline : 0

      // Phase 1: text 60% + typing 40%
      const sentimentWeight = 0.6
      const typingWeight = 0.4

      // Typing arousal signal: normalize relative speed to 0–1
      const typingArousal = Math.max(0, Math.min(1, (relativeSpeed + 1) / 2))

      // Weighted combined signal
      const combinedScore =
        sentiment.normalizedScore * sentimentWeight +
        typingArousal * typingWeight

      // Apply sensitivity
      const scaledScore = 0.5 + (combinedScore - 0.5) * sensitivity

      const label = inferMoodLabel(
        sentiment.normalizedScore,
        relativeSpeed * sensitivity,
        analytics.backspaceRate,
        sentiment.comparative,
      )

      const mood: MoodState = {
        label,
        intensity: Math.max(0, Math.min(1, scaledScore)),
        confidence: 0.6,
      }

      setMood(mood)
    },
    [setMood, sensitivity, manualOverride],
  )

  return { detect }
}
