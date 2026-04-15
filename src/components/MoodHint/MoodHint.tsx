import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useMoodStore } from '../../store/moodStore'
import { MOOD_THEMES } from '../../theme/moodThemes'
import { HINT_COPY } from './hintCopy'
import type { MoodLabel } from '../../types/mood'

const HOLD_BEFORE_HINT_MS = 8_000  // wait 8s of same mood before showing
const HINT_VISIBLE_MS     = 6_000  // hint stays visible for 6s
const HINT_COOLDOWN_MS    = 12_000 // gap before next hint can appear

function pickHint(label: MoodLabel, last: string | null): string {
  const pool = HINT_COPY[label]
  const candidates = pool.filter((h) => h !== last)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function MoodHint() {
  const currentMood   = useMoodStore((s) => s.currentMood)
  const nudgeEnabled  = useMoodStore((s) => s.nudgeEnabled)
  const isFocusMode   = useMoodStore((s) => s.isFocusMode)
  const theme         = MOOD_THEMES[currentMood.label]

  const [hint, setHint]       = useState<string | null>(null)
  const lastHint              = useRef<string | null>(null)
  const moodHoldStart         = useRef<number>(Date.now())
  const lastMoodLabel         = useRef<MoodLabel>(currentMood.label)
  const cooldownUntil         = useRef<number>(0)

  // Reset hold timer when mood label changes
  useEffect(() => {
    if (currentMood.label !== lastMoodLabel.current) {
      lastMoodLabel.current = currentMood.label
      moodHoldStart.current = Date.now()
      setHint(null) // dismiss current hint on mood change
    }
  }, [currentMood.label])

  // Tick every 500ms — show hint once hold time exceeded & no cooldown
  useEffect(() => {
    if (!nudgeEnabled || isFocusMode) return

    const interval = setInterval(() => {
      const now = Date.now()
      const heldMs = now - moodHoldStart.current

      if (hint === null && heldMs >= HOLD_BEFORE_HINT_MS && now >= cooldownUntil.current) {
        const next = pickHint(currentMood.label, lastHint.current)
        lastHint.current = next
        setHint(next)

        // Auto-dismiss after HINT_VISIBLE_MS
        setTimeout(() => {
          setHint(null)
          cooldownUntil.current = Date.now() + HINT_COOLDOWN_MS
        }, HINT_VISIBLE_MS)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [nudgeEnabled, isFocusMode, hint, currentMood.label])

  if (!nudgeEnabled || isFocusMode) return null

  return (
    <AnimatePresence>
      {hint && (
        <motion.div
          key={hint}
          className="mood-hint"
          style={{ color: theme.accent }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 1.2, ease: 'easeOut', type: 'tween' }}
        >
          {hint}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
