import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useMoodStore } from '../../store/moodStore'
import { MOOD_THEMES } from '../../theme/moodThemes'
import type { MoodLabel } from '../../types/mood'

// ── Sad particles: ambient upward float ─────────────────────────────────────

interface FloatParticle {
  id: number
  x: number       // vw %
  size: number    // px
  duration: number // s
  delay: number   // s
  opacity: number
}

function generateFloatParticles(count: number): FloatParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    size: 2 + Math.random() * 3,
    duration: 5 + Math.random() * 4,
    delay: Math.random() * 6,
    opacity: 0.3 + Math.random() * 0.4,
  }))
}

function SadParticles({ color }: { color: string }) {
  const [particles] = useState(() => generateFloatParticles(10))

  return (
    <div className="particles-layer" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}vw`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            background: color,
          }}
          animate={{
            y: [0, -window.innerHeight * 0.85],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
            type: 'tween',
          }}
        />
      ))}
    </div>
  )
}

// ── Happy particles: one-shot confetti burst ─────────────────────────────────

interface ConfettiParticle {
  id: number
  angle: number   // radians
  distance: number // px
  size: number
  color: string
  duration: number
}

const CONFETTI_COLORS = [
  'hsl(15, 85%, 65%)',
  'hsl(35, 90%, 60%)',
  'hsl(55, 90%, 65%)',
  'hsl(270, 70%, 72%)',
  'hsl(185, 60%, 65%)',
]

function generateConfetti(count: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8,
    distance: 80 + Math.random() * 140,
    size: 4 + Math.random() * 5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    duration: 0.6 + Math.random() * 0.5,
  }))
}

function HappyConfetti() {
  const [particles] = useState(() => generateConfetti(20))

  return (
    <div
      className="particles-layer flex items-center justify-center"
      aria-hidden
      style={{ pointerEvents: 'none' }}
    >
      {particles.map((p) => {
        const tx = Math.cos(p.angle) * p.distance
        const ty = Math.sin(p.angle) * p.distance
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              top: '50%',
              left: '50%',
              marginTop: -p.size / 2,
              marginLeft: -p.size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: tx,
              y: ty,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{
              duration: p.duration,
              ease: [0.2, 0.8, 0.4, 1],
              type: 'tween',
            }}
          />
        )
      })}
    </div>
  )
}

// ── Ambient noise overlay ────────────────────────────────────────────────────

function AmbientNoise({ color }: { color: string }) {
  return (
    <div className="particles-layer pointer-events-none" aria-hidden>
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          filter="url(#noise)"
          fill={color}
        />
      </svg>
    </div>
  )
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

const PARTICLE_MOODS: MoodLabel[] = ['sad', 'happy']

export function Particles() {
  const currentMood = useMoodStore((s) => s.currentMood)
  const theme = MOOD_THEMES[currentMood.label]
  const prevMood = useRef<MoodLabel>(currentMood.label)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (prevMood.current !== 'happy' && currentMood.label === 'happy') {
      setShowConfetti(true)
      // Confetti plays once — clear after longest particle duration (1.1s) + buffer
      const t = setTimeout(() => setShowConfetti(false), 1800)
      prevMood.current = currentMood.label
      return () => clearTimeout(t)
    }
    prevMood.current = currentMood.label
  }, [currentMood.label])

  if (!PARTICLE_MOODS.includes(currentMood.label) && !showConfetti) return null

  return (
    <>
      <AmbientNoise color={theme.accent} />

      <AnimatePresence>
        {currentMood.label === 'sad' && (
          <motion.div
            key="sad-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, type: 'tween' }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <SadParticles color={theme.accentSecondary} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfetti && (
          <motion.div
            key="confetti"
            className="fixed inset-0 z-30 pointer-events-none overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          >
            <HappyConfetti />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
