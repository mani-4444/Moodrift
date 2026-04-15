import type { MoodLabel, ThemeConfig } from '../types/mood'

export const MOOD_THEMES: Record<MoodLabel, ThemeConfig> = {
  anxious: {
    background: 'hsl(220, 20%, 12%)',
    surface: 'hsl(220, 18%, 18%)',
    text: 'hsl(210, 30%, 88%)',
    textMuted: 'hsl(210, 20%, 55%)',
    accent: 'hsl(210, 60%, 65%)',
    accentSecondary: 'hsl(200, 50%, 75%)',

    springStiffness: 20,
    springDamping: 15,
    transitionDuration: 1800,

    contentWidth: '820px',
    lineHeight: '1.9',
    letterSpacing: '0.01em',

    orbPulseRate: 10,
    orbGlow: 'hsl(210, 60%, 65%)',
    orbScale: [0.92, 1.08],
    orbColor: 'hsl(210, 60%, 65%)',

    fontWeight: 400,
    fontSize: '1.05rem',
  },

  sad: {
    background: 'hsl(30, 10%, 12%)',
    surface: 'hsl(30, 12%, 18%)',
    text: 'hsl(35, 25%, 85%)',
    textMuted: 'hsl(30, 15%, 50%)',
    accent: 'hsl(38, 90%, 60%)',
    accentSecondary: 'hsl(45, 80%, 70%)',

    springStiffness: 15,
    springDamping: 20,
    transitionDuration: 2000,

    contentWidth: '720px',
    lineHeight: '1.8',
    letterSpacing: '0.005em',

    orbPulseRate: 14,
    orbGlow: 'hsl(38, 90%, 60%)',
    orbScale: [0.95, 1.05],
    orbColor: 'hsl(38, 90%, 60%)',

    fontWeight: 400,
    fontSize: '1rem',
  },

  angry: {
    background: 'hsl(185, 25%, 10%)',
    surface: 'hsl(185, 22%, 16%)',
    text: 'hsl(185, 20%, 88%)',
    textMuted: 'hsl(185, 15%, 50%)',
    accent: 'hsl(185, 50%, 55%)',
    accentSecondary: 'hsl(175, 45%, 65%)',

    springStiffness: 30,
    springDamping: 25,
    transitionDuration: 1200,

    contentWidth: '700px',
    lineHeight: '1.65',
    letterSpacing: '0.01em',

    orbPulseRate: 16,
    orbGlow: 'hsl(185, 50%, 55%)',
    orbScale: [0.93, 1.07],
    orbColor: 'hsl(185, 50%, 55%)',

    fontWeight: 400,
    fontSize: '1rem',
  },

  focused: {
    background: 'hsl(0, 0%, 8%)',
    surface: 'hsl(0, 0%, 13%)',
    text: 'hsl(0, 0%, 90%)',
    textMuted: 'hsl(0, 0%, 45%)',
    accent: 'hsl(265, 80%, 65%)',
    accentSecondary: 'hsl(255, 70%, 72%)',

    springStiffness: 80,
    springDamping: 30,
    transitionDuration: 600,

    contentWidth: '660px',
    lineHeight: '1.6',
    letterSpacing: '0.005em',

    orbPulseRate: 20,
    orbGlow: 'hsl(265, 80%, 65%)',
    orbScale: [0.97, 1.03],
    orbColor: 'hsl(265, 80%, 65%)',

    fontWeight: 400,
    fontSize: '1rem',
  },

  happy: {
    background: 'hsl(45, 30%, 97%)',
    surface: 'hsl(45, 25%, 92%)',
    text: 'hsl(25, 20%, 20%)',
    textMuted: 'hsl(25, 10%, 45%)',
    accent: 'hsl(15, 85%, 60%)',
    accentSecondary: 'hsl(35, 90%, 55%)',

    springStiffness: 200,
    springDamping: 15,
    transitionDuration: 500,

    contentWidth: '700px',
    lineHeight: '1.7',
    letterSpacing: '0.01em',

    orbPulseRate: 28,
    orbGlow: 'hsl(15, 85%, 60%)',
    orbScale: [0.88, 1.12],
    orbColor: 'hsl(15, 85%, 60%)',

    fontWeight: 500,
    fontSize: '1.05rem',
  },

  calm: {
    background: 'hsl(140, 15%, 12%)',
    surface: 'hsl(140, 12%, 18%)',
    text: 'hsl(140, 15%, 87%)',
    textMuted: 'hsl(140, 10%, 50%)',
    accent: 'hsl(270, 30%, 70%)',
    accentSecondary: 'hsl(160, 30%, 65%)',

    springStiffness: 10,
    springDamping: 20,
    transitionDuration: 2200,

    contentWidth: '700px',
    lineHeight: '1.75',
    letterSpacing: '0.01em',

    orbPulseRate: 12,
    orbGlow: 'hsl(270, 30%, 70%)',
    orbScale: [0.94, 1.06],
    orbColor: 'hsl(270, 30%, 70%)',

    fontWeight: 400,
    fontSize: '1rem',
  },
}
