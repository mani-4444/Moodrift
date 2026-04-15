import type { ThemeConfig } from '../types/mood'

export function applyTheme(config: ThemeConfig): void {
  const root = document.documentElement

  // Colors
  root.style.setProperty('--color-bg', config.background)
  root.style.setProperty('--color-surface', config.surface)
  root.style.setProperty('--color-text', config.text)
  root.style.setProperty('--color-text-muted', config.textMuted)
  root.style.setProperty('--color-accent', config.accent)
  root.style.setProperty('--color-accent-secondary', config.accentSecondary)

  // Layout
  root.style.setProperty('--content-width', config.contentWidth)
  root.style.setProperty('--line-height', config.lineHeight)
  root.style.setProperty('--letter-spacing', config.letterSpacing)

  // Typography
  root.style.setProperty('--font-weight', String(config.fontWeight))
  root.style.setProperty('--font-size', config.fontSize)

  // Orb
  root.style.setProperty('--orb-color', config.orbColor)
  root.style.setProperty('--orb-glow', config.orbGlow)

  // Transition duration (used by CSS transitions)
  root.style.setProperty('--transition-duration', `${config.transitionDuration}ms`)
}
