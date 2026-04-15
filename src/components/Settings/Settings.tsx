import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useMoodStore } from '../../store/moodStore'
import { MOOD_THEMES } from '../../theme/moodThemes'
import type { MoodLabel } from '../../types/mood'

const MOOD_LABELS: MoodLabel[] = ['anxious', 'sad', 'angry', 'focused', 'happy', 'calm']

const MOOD_EMOJI: Record<MoodLabel, string> = {
  anxious: '〰',
  sad:     '↓',
  angry:   '↯',
  focused: '◎',
  happy:   '↑',
  calm:    '∿',
}

export function Settings() {
  const [open, setOpen] = useState(false)

  const sensitivity    = useMoodStore((s) => s.sensitivity)
  const nudgeEnabled   = useMoodStore((s) => s.nudgeEnabled)
  const manualOverride = useMoodStore((s) => s.manualOverride)
  const currentMood    = useMoodStore((s) => s.currentMood)
  const isFocusMode    = useMoodStore((s) => s.isFocusMode)

  const setSensitivity    = useMoodStore((s) => s.setSensitivity)
  const setNudgeEnabled   = useMoodStore((s) => s.setNudgeEnabled)
  const setManualOverride = useMoodStore((s) => s.setManualOverride)

  const theme = MOOD_THEMES[currentMood.label]

  if (isFocusMode) return null

  return (
    <>
      {/* Gear button */}
      <motion.button
        className="settings-trigger"
        style={{ color: theme.textMuted, borderColor: `${theme.accent}40` }}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Settings"
        title="Settings"
      >
        {open ? '✕' : '⚙'}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, type: 'tween' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            className="settings-drawer"
            style={{
              background: theme.surface,
              borderColor: `${theme.accent}25`,
            }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <h2 className="settings-title" style={{ color: theme.textMuted }}>
              Settings
            </h2>

            {/* ── Nudge toggle ── */}
            <div className="settings-row">
              <div className="settings-label" style={{ color: theme.text }}>
                Mood nudging
                <span className="settings-sublabel" style={{ color: theme.textMuted }}>
                  UI gently counter-steers your mood
                </span>
              </div>
              <button
                className={`toggle ${nudgeEnabled ? 'toggle--on' : ''}`}
                style={nudgeEnabled ? { background: theme.accent } : {}}
                onClick={() => setNudgeEnabled(!nudgeEnabled)}
                aria-pressed={nudgeEnabled}
              >
                <motion.span
                  className="toggle-knob"
                  animate={{ x: nudgeEnabled ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </button>
            </div>

            {/* ── Sensitivity slider ── */}
            <div className="settings-section">
              <div className="settings-label" style={{ color: theme.text }}>
                Sensitivity
                <span className="settings-sublabel" style={{ color: theme.textMuted }}>
                  How quickly mood adapts
                </span>
              </div>
              <div className="slider-row">
                <span className="slider-cap" style={{ color: theme.textMuted }}>Stable</span>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="slider"
                  style={{ '--slider-accent': theme.accent } as React.CSSProperties}
                />
                <span className="slider-cap" style={{ color: theme.textMuted }}>Reactive</span>
              </div>
            </div>

            {/* ── Manual mood override ── */}
            <div className="settings-section">
              <div className="settings-label" style={{ color: theme.text }}>
                Override mood
                <span className="settings-sublabel" style={{ color: theme.textMuted }}>
                  Lock to a specific mood
                </span>
              </div>
              <div className="mood-grid">
                {MOOD_LABELS.map((label) => {
                  const isActive = manualOverride === label
                  const moodTheme = MOOD_THEMES[label]
                  return (
                    <motion.button
                      key={label}
                      className={`mood-chip ${isActive ? 'mood-chip--active' : ''}`}
                      style={{
                        borderColor: isActive ? moodTheme.accent : `${theme.accent}30`,
                        background: isActive ? `${moodTheme.accent}20` : 'transparent',
                        color: isActive ? moodTheme.accent : theme.textMuted,
                      }}
                      onClick={() =>
                        setManualOverride(isActive ? null : label)
                      }
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="mood-chip-icon">{MOOD_EMOJI[label]}</span>
                      {label}
                    </motion.button>
                  )
                })}
              </div>
              {manualOverride && (
                <motion.button
                  className="clear-override"
                  style={{ color: theme.textMuted }}
                  onClick={() => setManualOverride(null)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ← resume detection
                </motion.button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
