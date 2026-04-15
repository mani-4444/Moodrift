import { AnimatePresence, motion } from 'framer-motion'
import { ThemeWrapper } from './components/ThemeWrapper/ThemeWrapper'
import { JournalInput } from './components/JournalInput/JournalInput'
import { MoodOrb } from './components/MoodOrb/MoodOrb'
import { Particles } from './components/Particles/Particles'
import { useMoodStore } from './store/moodStore'

function MoodBadge() {
  const label = useMoodStore((s) => s.currentMood.label)

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

function App() {
  return (
    <ThemeWrapper>
      <Particles />
      <div className="app">
        <MoodBadge />
        <JournalInput />
        <MoodOrb />
      </div>
    </ThemeWrapper>
  )
}

export default App
