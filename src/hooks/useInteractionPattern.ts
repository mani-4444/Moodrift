import { useRef, useCallback, useEffect } from 'react'

export interface InteractionPattern {
  scrollVelocity: number   // px/s (recent average)
  pointerEnergy: number    // 0–1 (normalised pointer movement speed)
  idleGapMs: number        // ms since last interaction
}

const IDLE_RESET_MS = 30_000 // stop tracking after 30s of no movement

export function useInteractionPattern(containerRef: React.RefObject<HTMLElement | null>) {
  const lastScrollY = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const scrollVelocity = useRef(0)

  const lastPointerX = useRef(0)
  const lastPointerY = useRef(0)
  const lastPointerTime = useRef(Date.now())
  const pointerEnergy = useRef(0)

  const lastInteractionTime = useRef(Date.now())

  // Scroll tracking
  const handleScroll = useCallback(() => {
    const now = Date.now()
    const el = containerRef.current
    const currentY = el ? el.scrollTop : window.scrollY
    const dt = now - lastScrollTime.current

    if (dt > 0) {
      const rawVelocity = Math.abs(currentY - lastScrollY.current) / (dt / 1000)
      // Exponential moving average to smooth jitter
      scrollVelocity.current = scrollVelocity.current * 0.6 + rawVelocity * 0.4
    }

    lastScrollY.current = currentY
    lastScrollTime.current = now
    lastInteractionTime.current = now
  }, [containerRef])

  // Pointer tracking
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const now = Date.now()
    const dt = now - lastPointerTime.current

    if (dt > 0) {
      const dx = e.clientX - lastPointerX.current
      const dy = e.clientY - lastPointerY.current
      const speed = Math.sqrt(dx * dx + dy * dy) / (dt / 1000) // px/s

      // Normalise: 0 = still, 1 = very fast (>1000 px/s)
      const normalised = Math.min(1, speed / 1000)
      pointerEnergy.current = pointerEnergy.current * 0.7 + normalised * 0.3
    }

    lastPointerX.current = e.clientX
    lastPointerY.current = e.clientY
    lastPointerTime.current = now
    lastInteractionTime.current = now
  }, [])

  useEffect(() => {
    const el = containerRef.current ?? window
    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    // Decay velocities over time when idle
    const decayInterval = setInterval(() => {
      const idleMs = Date.now() - lastInteractionTime.current
      if (idleMs > IDLE_RESET_MS) {
        scrollVelocity.current *= 0.9
        pointerEnergy.current *= 0.9
      }
    }, 2000)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointermove', handlePointerMove)
      clearInterval(decayInterval)
    }
  }, [containerRef, handleScroll, handlePointerMove])

  const getPattern = useCallback((): InteractionPattern => ({
    scrollVelocity: scrollVelocity.current,
    pointerEnergy: pointerEnergy.current,
    idleGapMs: Date.now() - lastInteractionTime.current,
  }), [])

  return { getPattern }
}
