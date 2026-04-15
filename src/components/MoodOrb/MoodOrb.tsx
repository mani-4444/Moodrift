import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import { useMoodStore } from '../../store/moodStore'
import { MOOD_THEMES } from '../../theme/moodThemes'

export function MoodOrb() {
  const currentMood = useMoodStore((s) => s.currentMood)
  const theme = MOOD_THEMES[currentMood.label]
  const controls = useAnimationControls()

  const pulseDuration = 60 / theme.orbPulseRate // seconds per pulse cycle
  const [scaleMin, scaleMax] = theme.orbScale

  useEffect(() => {
    // Restart pulse animation whenever mood changes
    controls.start({
      scale: [scaleMin, scaleMax, scaleMin],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: pulseDuration,
        repeat: Infinity,
        ease: 'easeInOut',
        // Override MotionConfig spring for this specific continuous animation
        type: 'tween',
      },
    })
  }, [controls, pulseDuration, scaleMin, scaleMax])

  return (
    <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 64,
          height: 64,
          background: `radial-gradient(circle, ${theme.orbGlow}30 0%, transparent 70%)`,
        }}
        animate={controls}
      />
      {/* Core orb */}
      <motion.div
        className="rounded-full cursor-pointer"
        style={{
          width: 20,
          height: 20,
          background: theme.orbColor,
          boxShadow: `0 0 16px 4px ${theme.orbGlow}60, 0 0 32px 8px ${theme.orbGlow}25`,
        }}
        animate={controls}
        whileHover={{ scale: 1.4 }}
        title={`Mood: ${currentMood.label}`}
      />
    </div>
  )
}
