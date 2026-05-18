import { create } from 'zustand'

export type FeedbackVote = 'up' | 'down'

export interface AiFeedback {
  id: string
  featureId: string
  envelopeId?: string
  vote: FeedbackVote
  comment?: string
  userId: string
  userName: string
  timestamp: string
}

interface FeedbackState {
  feedbacks: AiFeedback[]
  addFeedback: (f: Omit<AiFeedback, 'id' | 'timestamp'>) => void
  getFeatureSummary: (featureId: string) => { up: number; down: number }
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: [],
  addFeedback: (f) =>
    set((state) => ({
      feedbacks: [
        {
          ...f,
          id: `FB-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: new Date().toISOString(),
        },
        ...state.feedbacks,
      ],
    })),
  getFeatureSummary: (featureId) => {
    const list = get().feedbacks.filter((f) => f.featureId === featureId)
    return { up: list.filter((f) => f.vote === 'up').length, down: list.filter((f) => f.vote === 'down').length }
  },
}))
