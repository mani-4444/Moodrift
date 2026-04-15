export type MoodLabel = 'anxious' | 'sad' | 'angry' | 'focused' | 'happy' | 'calm'

export interface ThemeConfig {
  // Color
  background: string
  surface: string
  text: string
  textMuted: string
  accent: string
  accentSecondary: string

  // Motion
  springStiffness: number
  springDamping: number
  transitionDuration: number // ms

  // Layout
  contentWidth: string
  lineHeight: string
  letterSpacing: string

  // Orb
  orbPulseRate: number // BPM
  orbGlow: string
  orbScale: [number, number] // [min, max]
  orbColor: string

  // Typography
  fontWeight: number
  fontSize: string
}

export interface MoodState {
  label: MoodLabel
  intensity: number // 0–1
  confidence: number // 0–1
}

export interface MoodHistoryEntry {
  label: MoodLabel
  startedAt: number // timestamp ms
  endedAt: number | null
}
