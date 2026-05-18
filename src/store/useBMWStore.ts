import { create } from 'zustand'

export type WasteCategory = 'Yellow' | 'Red' | 'Blue' | 'Black' | 'White' | 'Cytotoxic'
export type DisposalStatus = 'pending' | 'collected' | 'treated' | 'disposed' | 'non_compliant'

export interface WasteLog {
  id: string
  date: string
  ward: string
  category: WasteCategory
  weightKg: number
  bagCount: number
  collectedBy: string
  collectedAt: string
  treatedAt?: string
  disposedAt?: string
  status: DisposalStatus
  vendorId?: string
  manifestNumber?: string
}

export interface ComplianceReport {
  id: string
  month: string
  totalWeightKg: number
  byCategory: Record<WasteCategory, number>
  incidents: number
  complianceScore: number
  submittedAt?: string
  status: 'draft' | 'submitted' | 'approved'
}

interface BMWState {
  wasteLogs: WasteLog[]
  reports: ComplianceReport[]
  addLog: (l: Omit<WasteLog, 'id'>) => void
  updateLog: (id: string, update: Partial<WasteLog>) => void
  todaySummary: () => Record<WasteCategory, number>
}

const WASTE_LOGS: WasteLog[] = [
  { id: 'BMW-001', date: '2026-05-09', ward: 'General Ward', category: 'Yellow', weightKg: 4.2, bagCount: 3, collectedBy: 'BW-1501', collectedAt: '2026-05-09T09:00:00Z', status: 'collected' },
  { id: 'BMW-002', date: '2026-05-09', ward: 'ICU', category: 'Red', weightKg: 2.8, bagCount: 2, collectedBy: 'BW-1501', collectedAt: '2026-05-09T09:15:00Z', status: 'treated', treatedAt: '2026-05-09T11:00:00Z' },
  { id: 'BMW-003', date: '2026-05-09', ward: 'OT', category: 'Yellow', weightKg: 6.1, bagCount: 5, collectedBy: 'BW-1501', collectedAt: '2026-05-09T10:00:00Z', status: 'disposed', treatedAt: '2026-05-09T11:30:00Z', disposedAt: '2026-05-09T14:00:00Z', vendorId: 'BMW-VENDOR-01', manifestNumber: 'MF-20260509-03' },
  { id: 'BMW-004', date: '2026-05-09', ward: 'Pharmacy', category: 'Blue', weightKg: 1.5, bagCount: 1, collectedBy: 'BW-1501', collectedAt: '2026-05-09T10:30:00Z', status: 'pending' },
]

export const useBMWStore = create<BMWState>((set, get) => ({
  wasteLogs: WASTE_LOGS,
  reports: [],
  addLog: (l) =>
    set((state) => ({ wasteLogs: [{ ...l, id: `BMW-${Date.now()}` }, ...state.wasteLogs] })),
  updateLog: (id, update) =>
    set((state) => ({ wasteLogs: state.wasteLogs.map((l) => l.id === id ? { ...l, ...update } : l) })),
  todaySummary: () => {
    const today = new Date().toDateString()
    const todayLogs = get().wasteLogs.filter((l) => new Date(l.date).toDateString() === today)
    const summary: Record<WasteCategory, number> = { Yellow: 0, Red: 0, Blue: 0, Black: 0, White: 0, Cytotoxic: 0 }
    todayLogs.forEach((l) => { summary[l.category] = (summary[l.category] ?? 0) + l.weightKg })
    return summary
  },
}))
