export type ConfidenceTier = 'high' | 'medium' | 'low'

export interface AiEnvelope<T> {
  data: T
  confidence: number
  confidenceTier: ConfidenceTier
  reasoning: string
  disclaimer: string
  modelVersion: string
  generatedAt: string
  requiresReview: boolean
}

export interface HitlDecision {
  envelopeId: string
  action: 'accept' | 'reject' | 'modify'
  reason?: string
  userId: string
  timestamp: string
}
