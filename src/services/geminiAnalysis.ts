import { GoogleGenerativeAI } from '@google/generative-ai'
import type { MoodLabel } from '../types/mood'

const VALID_MOODS: MoodLabel[] = ['anxious', 'sad', 'angry', 'focused', 'happy', 'calm']

export interface GeminiMoodResult {
  mood: MoodLabel
  confidence: number // 0–1
}

let client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
    if (!key) throw new Error('VITE_GEMINI_API_KEY is not set')
    client = new GoogleGenerativeAI(key)
  }
  return client
}

/** Extract the last non-empty sentence from text (privacy: never sends full journal) */
function extractLastSentence(text: string): string {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
  return sentences[sentences.length - 1] ?? ''
}

/** Parse Gemini response — handles plain JSON and markdown-fenced JSON */
function parseResponse(raw: string): GeminiMoodResult | null {
  try {
    // Strip markdown fences if present
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as { mood?: unknown; confidence?: unknown }

    const mood = parsed.mood
    const confidence = parsed.confidence

    if (typeof mood !== 'string' || !VALID_MOODS.includes(mood as MoodLabel)) return null
    if (typeof confidence !== 'number') return null

    return {
      mood: mood as MoodLabel,
      confidence: Math.max(0, Math.min(1, confidence)),
    }
  } catch {
    return null
  }
}

const SYSTEM_PROMPT =
  'You are an emotional tone classifier. Analyze the emotional tone of text the user sends and reply ONLY with valid JSON (no markdown, no explanation): {"mood":"anxious|sad|angry|focused|happy|calm","confidence":0.0-1.0}. Choose the single best-fitting mood. Confidence reflects how clearly the tone is expressed.'

// Debounce state
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let lastText = ''
let lastResultCache: GeminiMoodResult | null = null

export function analyzeWithGemini(
  text: string,
  onResult: (result: GeminiMoodResult | null) => void,
): void {
  const sentence = extractLastSentence(text)

  // Skip if sentence too short or unchanged
  if (sentence.length < 20) return
  if (sentence === lastText) return

  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    lastText = sentence

    try {
      const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent([SYSTEM_PROMPT, sentence])
      const raw = result.response.text()
      const parsed = parseResponse(raw)
      lastResultCache = parsed
      onResult(parsed)
    } catch {
      // API failure — caller falls back to local sentiment at 100%
      onResult(null)
    }
  }, 1500)
}

export function getLastGeminiResult(): GeminiMoodResult | null {
  return lastResultCache
}

export function cancelPendingAnalysis(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}
