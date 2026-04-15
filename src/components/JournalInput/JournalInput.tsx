import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTypingAnalytics, hasBaseline, saveBaselineWPM } from '../../hooks/useTypingAnalytics'
import { useMoodDetection } from '../../hooks/useMoodDetection'
import { useInteractionPattern } from '../../hooks/useInteractionPattern'

const CALIBRATION_DURATION_MS = 30_000
const CALIBRATION_PROMPT =
  'Type anything freely for 30 seconds — this helps Moodrift understand your natural pace. Write about your day, a memory, anything at all.'

const PLACEHOLDER_LINES = [
  "What's on your mind?",
  'Start writing anything...',
  'Let it out here.',
]

interface CalibrationState {
  active: boolean
  startTime: number | null
  secondsLeft: number
}

export function JournalInput() {
  const [text, setText] = useState('')
  const [calibration, setCalibration] = useState<CalibrationState>(() => ({
    active: !hasBaseline(),
    startTime: null,
    secondsLeft: 30,
  }))

  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { handleKeyDown, getAnalytics, reset: resetAnalytics } = useTypingAnalytics()
  const { detect } = useMoodDetection()
  const { getPattern } = useInteractionPattern(containerRef)

  const placeholder = useRef(
    PLACEHOLDER_LINES[Math.floor(Math.random() * PLACEHOLDER_LINES.length)],
  ).current

  // Calibration countdown timer
  useEffect(() => {
    if (!calibration.active || !calibration.startTime) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - calibration.startTime!
      const remaining = Math.max(0, CALIBRATION_DURATION_MS - elapsed)
      const secondsLeft = Math.ceil(remaining / 1000)

      if (remaining <= 0) {
        // Save baseline WPM computed from calibration typing
        const analytics = getAnalytics()
        if (analytics.wpm > 0) saveBaselineWPM(analytics.wpm)
        resetAnalytics()
        setText('')
        setCalibration({ active: false, startTime: null, secondsLeft: 0 })
        clearInterval(interval)
      } else {
        setCalibration((prev) => ({ ...prev, secondsLeft }))
      }
    }, 500)

    return () => clearInterval(interval)
  }, [calibration.active, calibration.startTime, getAnalytics, resetAnalytics])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setText(value)

      if (calibration.active) {
        // Start timer on first keypress during calibration
        if (!calibration.startTime) {
          setCalibration((prev) => ({ ...prev, startTime: Date.now() }))
        }
        return // don't run mood detection during calibration
      }

      detect(value, getAnalytics(), getPattern())
    },
    [calibration, detect, getAnalytics, getPattern],
  )

  const handleKeyDownWrapped = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      handleKeyDown(e)
    },
    [handleKeyDown],
  )

  const skipCalibration = useCallback(() => {
    setCalibration({ active: false, startTime: null, secondsLeft: 0 })
  }, [])

  return (
    <div ref={containerRef} className="journal-container">
      <AnimatePresence mode="wait">
        {calibration.active ? (
          <motion.div
            key="calibration"
            className="calibration-overlay"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <p className="calibration-title">Getting to know your rhythm</p>
            <p className="calibration-prompt">{CALIBRATION_PROMPT}</p>

            <textarea
              ref={textareaRef}
              className="journal-textarea calibration-textarea"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDownWrapped}
              placeholder="Start typing..."
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />

            <div className="calibration-footer">
              {calibration.startTime ? (
                <span className="calibration-timer">
                  {calibration.secondsLeft}s remaining
                </span>
              ) : (
                <span className="calibration-timer">Start typing to begin...</span>
              )}
              <button className="calibration-skip" onClick={skipCalibration}>
                Skip
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="journal"
            className="journal-inner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <textarea
              ref={textareaRef}
              className="journal-textarea"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDownWrapped}
              placeholder={placeholder}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
            <div className="journal-wordcount">
              {text.trim() ? `${text.trim().split(/\s+/).length} words` : ''}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
