import { useEffect } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { useMoodStore } from '../../store/moodStore'
import { MOOD_THEMES } from '../../theme/moodThemes'
import { applyTheme } from '../../theme/themeEngine'

interface Props {
  children: React.ReactNode
}

export function ThemeWrapper({ children }: Props) {
  const currentMood = useMoodStore((s) => s.currentMood)
  const theme = MOOD_THEMES[currentMood.label]

  useEffect(() => {
    applyTheme(theme, currentMood.label)
  }, [theme, currentMood.label])

  return (
    <MotionConfig
      transition={{
        type: 'spring',
        stiffness: theme.springStiffness,
        damping: theme.springDamping,
      }}
    >
      {/* Animated full-screen background that transitions with mood */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{ backgroundColor: theme.background }}
        transition={{
          duration: theme.transitionDuration / 1000,
          ease: 'easeInOut',
          type: 'tween',
        }}
      />

      {/* Subtle radial accent glow in the corner — shifts with mood */}
      <motion.div
        className="fixed inset-0 -z-10 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at 85% 15%, ${theme.accent}18 0%, transparent 55%)`,
        }}
        transition={{
          duration: theme.transitionDuration / 1000,
          ease: 'easeInOut',
          type: 'tween',
        }}
      />

      {children}
    </MotionConfig>
  )
}
