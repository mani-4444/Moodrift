import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useMoodStore } from '../../store/moodStore'
import { MOOD_THEMES } from '../../theme/moodThemes'
import type { MoodLabel } from '../../types/mood'

// Nudge target BPM per mood — the orb breathes at the *target*, not detected rate
const NUDGE_BPM: Record<MoodLabel, number> = {
  anxious: 8,    // breathe slower than the user → calming
  sad: 12,
  angry: 10,     // slow and grounding
  focused: 18,   // steady but present
  happy: 26,     // joyful energy
  calm: 11,
}

export function MoodOrb() {
  const currentMood = useMoodStore((s) => s.currentMood)
  const isFocusMode = useMoodStore((s) => s.isFocusMode)
  const theme = MOOD_THEMES[currentMood.label]
  const [showLabel, setShowLabel] = useState(false)

  const bpm = NUDGE_BPM[currentMood.label]
  const pulseDuration = 60 / bpm         // seconds per full cycle
  const [scaleMin, scaleMax] = theme.orbScale

  // Track previous mood to know when label changes
  const prevLabel = useRef(currentMood.label)
  const [labelVisible, setLabelVisible] = useState(false)

  useEffect(() => {
    if (prevLabel.current !== currentMood.label) {
      prevLabel.current = currentMood.label
      // Flash the label briefly on mood change
      setLabelVisible(true)
      const t = setTimeout(() => setLabelVisible(false), 2500)
      return () => clearTimeout(t)
    }
  }, [currentMood.label])

  if (isFocusMode) {
    // Focus mode: tiny 8px dot in corner
    return (
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
      >
        <motion.div
          className="rounded-full"
          style={{ width: 8, height: 8, background: theme.orbColor }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            duration: pulseDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            type: 'tween',
          }}
        />
      </motion.div>
    )
  }

  return (
    <div
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center"
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          scale: [scaleMin * 0.9, scaleMax * 1.1, scaleMin * 0.9],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: pulseDuration * 1.3,
          repeat: Infinity,
          ease: 'easeInOut',
          type: 'tween',
        }}
        style={{
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${theme.orbGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Mid glow ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          scale: [scaleMin, scaleMax, scaleMin],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          type: 'tween',
        }}
        style={{
          width: 48,
          height: 48,
          background: `radial-gradient(circle, ${theme.orbGlow}80 0%, transparent 70%)`,
        }}
      />

      {/* Core orb */}
      <motion.div
        className="rounded-full cursor-pointer relative z-10"
        animate={{
          scale: [scaleMin, scaleMax, scaleMin],
          boxShadow: [
            `0 0 10px 2px ${theme.orbGlow}50, 0 0 24px 6px ${theme.orbGlow}20`,
            `0 0 18px 5px ${theme.orbGlow}80, 0 0 40px 12px ${theme.orbGlow}35`,
            `0 0 10px 2px ${theme.orbGlow}50, 0 0 24px 6px ${theme.orbGlow}20`,
          ],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          type: 'tween',
        }}
        whileHover={{ scale: scaleMax * 1.3 }}
        style={{
          width: 20,
          height: 20,
          background: `radial-gradient(circle at 35% 35%, ${theme.accentSecondary}, ${theme.orbColor})`,
        }}
        title={`Mood: ${currentMood.label}`}
      />

      {/* Mood label — shows on hover or mood change */}
      <AnimatePresence>
        {(showLabel || labelVisible) && (
          <motion.div
            className="absolute right-8 bottom-0 pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.25, type: 'tween' }}
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: theme.orbColor,
              textShadow: `0 0 8px ${theme.orbGlow}80`,
            }}
          >
            {currentMood.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
