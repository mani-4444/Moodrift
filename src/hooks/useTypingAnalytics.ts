import { useRef, useCallback } from 'react'

export interface TypingAnalytics {
  wpm: number            // current WPM (rolling window)
  backspaceRate: number  // 0–1, ratio of backspace to total keystrokes
  burstCount: number     // number of typing bursts this session
  lastKeyTime: number    // timestamp of last keypress
  pauseDurationMs: number // ms since last keypress (idle gap)
}

const BURST_GAP_MS = 500       // gap that defines a new burst
const WPM_WINDOW_CHARS = 60    // characters for rolling WPM window
const CHARS_PER_WORD = 5       // standard WPM definition

const BASELINE_KEY = 'moodrift_baseline_wpm'
const DEFAULT_BASELINE_WPM = 50

interface KeyEvent {
  char: string
  time: number
}

export function getBaselineWPM(): number {
  const stored = localStorage.getItem(BASELINE_KEY)
  return stored ? parseFloat(stored) : DEFAULT_BASELINE_WPM
}

export function saveBaselineWPM(wpm: number): void {
  localStorage.setItem(BASELINE_KEY, String(wpm))
}

export function hasBaseline(): boolean {
  return localStorage.getItem(BASELINE_KEY) !== null
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
      keyLog.current.push({ char: e.key, time: now })
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
      const windowEntries = log.slice(-WPM_WINDOW_CHARS)
      const durationMs = now - windowEntries[0].time
      if (durationMs > 0) {
        wpm = (windowEntries.length / durationMs) * 60000 / CHARS_PER_WORD
      }
    }

    const backspaceRate =
      totalKeys.current > 0 ? backspaceCount.current / totalKeys.current : 0

    const pauseDurationMs = lastKeyTime.current > 0 ? now - lastKeyTime.current : 0

    return {
      wpm: Math.round(wpm),
      backspaceRate: Math.min(1, backspaceRate),
      burstCount: burstCount.current,
      lastKeyTime: lastKeyTime.current,
      pauseDurationMs,
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
