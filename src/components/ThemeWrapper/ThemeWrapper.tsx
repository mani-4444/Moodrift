import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
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
    applyTheme(theme)
  }, [theme])

  return (
    <MotionConfig
      transition={{
        type: 'spring',
        stiffness: theme.springStiffness,
        damping: theme.springDamping,
      }}
    >
      {children}
    </MotionConfig>
  )
}
