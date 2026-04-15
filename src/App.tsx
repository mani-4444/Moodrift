import { ThemeWrapper } from './components/ThemeWrapper/ThemeWrapper'
import { JournalInput } from './components/JournalInput/JournalInput'
import { MoodOrb } from './components/MoodOrb/MoodOrb'
import { useMoodStore } from './store/moodStore'

function MoodBadge() {
  const label = useMoodStore((s) => s.currentMood.label)
  return <div className="mood-badge">{label}</div>
}

function App() {
  return (
    <ThemeWrapper>
      <div className="app">
        <MoodBadge />
        <JournalInput />
        <MoodOrb />
      </div>
    </ThemeWrapper>
  )
}

export default App
