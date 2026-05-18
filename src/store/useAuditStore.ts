import { create } from 'zustand'

export type AuditAction =
  | 'hitl_accept' | 'hitl_reject' | 'hitl_modify'
  | 'ai_feedback_up' | 'ai_feedback_down'
  | 'prescription_create' | 'lab_order' | 'radiology_order'
  | 'billing_charge' | 'discharge_clearance'
  | 'role_switch' | 'login' | 'logout'
  | 'blood_issue' | 'drug_dispense' | 'waste_log'
  | string

export interface AuditEntry {
  id: string
  userId: string
  userName: string
  action: AuditAction
  resource: string
  resourceId?: string
  detail?: string
  before?: unknown
  after?: unknown
  timestamp: string
  ipStub: string
}

interface AuditState {
  entries: AuditEntry[]
  log: (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ipStub'>) => void
  clear: () => void
}

export const useAuditStore = create<AuditState>((set) => ({
  entries: [],
  log: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          ipStub: '192.168.1.x',
        },
        ...state.entries,
      ],
    })),
  clear: () => set({ entries: [] }),
}))
