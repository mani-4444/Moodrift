import { create } from 'zustand'
import type { MoodLabel, MoodState, MoodHistoryEntry } from '../types/mood'

interface MoodStore {
  currentMood: MoodState
  history: MoodHistoryEntry[]
  sensitivity: number // 0.2–1.0
  nudgeEnabled: boolean
  isFocusMode: boolean
  manualOverride: MoodLabel | null

  setMood: (mood: MoodState) => void
  setSensitivity: (value: number) => void
  setNudgeEnabled: (value: boolean) => void
  setFocusMode: (value: boolean) => void
  setManualOverride: (label: MoodLabel | null) => void
}

export const useMoodStore = create<MoodStore>((set, get) => ({
  currentMood: { label: 'calm', intensity: 0.5, confidence: 0.5 },
  history: [],
  sensitivity: 0.7,
  nudgeEnabled: true,
  isFocusMode: false,
  manualOverride: null,

  setMood: (mood) => {
    const prev = get().currentMood
    const history = get().history

    set((state) => {
      // Close the previous history entry
      const updatedHistory = state.history.map((entry, idx) =>
        idx === state.history.length - 1 && entry.endedAt === null
          ? { ...entry, endedAt: Date.now() }
          : entry
      )

      // Only add a new history entry when the label actually changes
      const newEntry: MoodHistoryEntry | null =
        prev.label !== mood.label
          ? { label: mood.label, startedAt: Date.now(), endedAt: null }
          : null

      return {
        currentMood: mood,
        history:
          history.length === 0
            ? [{ label: mood.label, startedAt: Date.now(), endedAt: null }]
            : newEntry
            ? [...updatedHistory, newEntry]
            : updatedHistory,
      }
    })
  },

  setSensitivity: (value) => set({ sensitivity: value }),
  setNudgeEnabled: (value) => set({ nudgeEnabled: value }),
  setFocusMode: (value) => set({ isFocusMode: value }),
  setManualOverride: (label) => set({ manualOverride: label }),
}))
