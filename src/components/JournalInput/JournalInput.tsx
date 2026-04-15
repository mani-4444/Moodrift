import { useState, useCallback, useRef } from 'react'
import { useTypingAnalytics } from '../../hooks/useTypingAnalytics'
import { useMoodDetection } from '../../hooks/useMoodDetection'

const PLACEHOLDER_LINES = [
  "What's on your mind?",
  'Start writing anything...',
  'Let it out here.',
]

export function JournalInput() {
  const [text, setText] = useState('')
  const { handleKeyDown, getAnalytics } = useTypingAnalytics()
  const { detect } = useMoodDetection()
  const placeholder = useRef(
    PLACEHOLDER_LINES[Math.floor(Math.random() * PLACEHOLDER_LINES.length)],
  ).current

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setText(value)
      // Run mood detection on every change
      detect(value, getAnalytics())
    },
    [detect, getAnalytics],
  )

  const handleKeyDownWrapped = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      handleKeyDown(e)
    },
    [handleKeyDown],
  )

  return (
    <div className="journal-container">
      <textarea
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
    </div>
  )
}
