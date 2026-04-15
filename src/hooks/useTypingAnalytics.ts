import { useRef, useCallback } from 'react'

export interface TypingAnalytics {
  wpm: number            // current WPM (rolling window)
  backspaceRate: number  // 0–1, ratio of backspace to total keystrokes
  burstCount: number     // number of typing bursts this session
  lastKeyTime: number    // timestamp of last keypress
}

const BURST_GAP_MS = 500       // gap that defines a new burst
const WPM_WINDOW_CHARS = 60    // characters for rolling WPM window
const CHARS_PER_WORD = 5       // standard WPM definition

interface KeyEvent {
  char: string
  time: number
}

export function useTypingAnalytics() {
  const keyLog = useRef<KeyEvent[]>([])
  const backspaceCount = useRef(0)
  const totalKeys = useRef(0)
  const burstCount = useRef(0)
  const lastKeyTime = useRef(0)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const now = Date.now()

    // Detect new burst
    if (now - lastKeyTime.current > BURST_GAP_MS && totalKeys.current > 0) {
      burstCount.current += 1
    }
    lastKeyTime.current = now

    totalKeys.current += 1

    if (e.key === 'Backspace') {
      backspaceCount.current += 1
    } else if (e.key.length === 1) {
      // Only log printable characters for WPM
      keyLog.current.push({ char: e.key, time: now })
      // Trim to rolling window
      if (keyLog.current.length > WPM_WINDOW_CHARS * 2) {
        keyLog.current = keyLog.current.slice(-WPM_WINDOW_CHARS)
      }
    }
  }, [])

  const getAnalytics = useCallback((): TypingAnalytics => {
    const now = Date.now()
    const log = keyLog.current

    let wpm = 0
    if (log.length >= 2) {
      // Take last WPM_WINDOW_CHARS entries
      const window = log.slice(-WPM_WINDOW_CHARS)
      const durationMs = now - window[0].time
      if (durationMs > 0) {
        const charsPerMs = window.length / durationMs
        wpm = charsPerMs * 60000 / CHARS_PER_WORD
      }
    }

    const backspaceRate =
      totalKeys.current > 0 ? backspaceCount.current / totalKeys.current : 0

    return {
      wpm: Math.round(wpm),
      backspaceRate: Math.min(1, backspaceRate),
      burstCount: burstCount.current,
      lastKeyTime: lastKeyTime.current,
    }
  }, [])

  const reset = useCallback(() => {
    keyLog.current = []
    backspaceCount.current = 0
    totalKeys.current = 0
    burstCount.current = 0
    lastKeyTime.current = 0
  }, [])

  return { handleKeyDown, getAnalytics, reset }
}
