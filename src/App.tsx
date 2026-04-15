import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { ThemeWrapper } from './components/ThemeWrapper/ThemeWrapper'
import { JournalInput } from './components/JournalInput/JournalInput'
import { MoodOrb } from './components/MoodOrb/MoodOrb'
import { Particles } from './components/Particles/Particles'
import { MoodHint } from './components/MoodHint/MoodHint'
import { Settings } from './components/Settings/Settings'
import { useMoodStore } from './store/moodStore'

function MoodBadge() {
  const label        = useMoodStore((s) => s.currentMood.label)
  const isFocusMode  = useMoodStore((s) => s.isFocusMode)

  if (isFocusMode) return null

  return (
    <div className="mood-badge-wrap">
      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.35, type: 'tween' }}
          className="mood-badge"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function FocusModeListener() {
  const setFocusMode = useMoodStore((s) => s.setFocusMode)
  const isFocusMode  = useMoodStore((s) => s.isFocusMode)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(!isFocusMode)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isFocusMode, setFocusMode])

  return null
}

function App() {
  return (
    <ThemeWrapper>
      <FocusModeListener />
      <Particles />
      <div className="app">
        <MoodBadge />
        <Settings />
        <JournalInput />
        <MoodHint />
        <MoodOrb />
      </div>
    </ThemeWrapper>
  )
}

export default App
