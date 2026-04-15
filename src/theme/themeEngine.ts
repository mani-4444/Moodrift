import type { ThemeConfig } from '../types/mood'

/**
 * Applies a ThemeConfig as CSS custom properties on :root.
 * CSS transitions on those vars (defined in index.css) handle the animation.
 */
export function applyTheme(config: ThemeConfig): void {
  const root = document.documentElement

  // Colors — animate at theme's own transition duration
  root.style.setProperty('--color-bg', config.background)
  root.style.setProperty('--color-surface', config.surface)
  root.style.setProperty('--color-text', config.text)
  root.style.setProperty('--color-text-muted', config.textMuted)
  root.style.setProperty('--color-accent', config.accent)
  root.style.setProperty('--color-accent-secondary', config.accentSecondary)

  // Layout — faster transition (800ms, set in CSS)
  root.style.setProperty('--content-width', config.contentWidth)
  root.style.setProperty('--line-height', config.lineHeight)
  root.style.setProperty('--letter-spacing', config.letterSpacing)

  // Typography
  root.style.setProperty('--font-weight', String(config.fontWeight))
  root.style.setProperty('--font-size', config.fontSize)

  // Orb
  root.style.setProperty('--orb-color', config.orbColor)
  root.style.setProperty('--orb-glow', config.orbGlow)

  // Transition duration for all CSS-var-driven transitions
  root.style.setProperty('--transition-duration', `${config.transitionDuration}ms`)
  // Layout transitions are always faster than color transitions
  root.style.setProperty(
    '--transition-duration-layout',
    `${Math.min(800, config.transitionDuration)}ms`,
  )
}
