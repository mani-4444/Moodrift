import Sentiment from 'sentiment'

const analyzer = new Sentiment()

export interface LocalSentimentResult {
  score: number        // raw score (-∞ to +∞)
  normalizedScore: number // 0–1, 0.5 is neutral
  label: 'positive' | 'neutral' | 'negative'
  comparative: number  // score per word
}

export function analyzeSentiment(text: string): LocalSentimentResult {
  if (!text.trim()) {
    return { score: 0, normalizedScore: 0.5, label: 'neutral', comparative: 0 }
  }

  const result = analyzer.analyze(text)
  const { score, comparative } = result

  // Normalize score to 0–1 range. Clamp at ±5 comparative score.
  const clampedComparative = Math.max(-5, Math.min(5, comparative))
  const normalizedScore = (clampedComparative + 5) / 10

  const label: LocalSentimentResult['label'] =
    comparative > 0.5 ? 'positive' : comparative < -0.5 ? 'negative' : 'neutral'

  return { score, normalizedScore, label, comparative }
}
