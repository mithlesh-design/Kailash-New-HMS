import { create } from 'zustand'

export type SterilizationMethod = 'Autoclave' | 'ETO' | 'Plasma' | 'Chemical'
export type CycleStatus = 'pending' | 'running' | 'passed' | 'failed'
export type InstrumentStatus = 'clean' | 'dirty' | 'sterilizing' | 'ready' | 'in_use'

export interface SterilizationCycle {
  id: string
  batchNumber: string
  method: SterilizationMethod
  startedAt: string
  completedAt?: string
  status: CycleStatus
  operatorId: string
  instrumentIds: string[]
  assignedTo?: string
  biologicalIndicator?: boolean
  chemicalIndicatorPass?: boolean
}

export interface Instrument {
  id: string
  name: string
  category: string
  quantity: number
  status: InstrumentStatus
  lastSterilizedAt?: string
  currentCycleId?: string
  assignedOT?: string
}

interface CSSDState {
  cycles: SterilizationCycle[]
  instruments: Instrument[]
  addCycle: (c: Omit<SterilizationCycle, 'id'>) => void
  updateCycle: (id: string, update: Partial<SterilizationCycle>) => void
  updateInstrument: (id: string, update: Partial<Instrument>) => void
}

const INSTRUMENTS: Instrument[] = [
  { id: 'INS-001', name: 'Scalpel Handle No.3', category: 'General Surgery', quantity: 12, status: 'ready', lastSterilizedAt: '2026-05-09T06:00:00Z' },
  { id: 'INS-002', name: 'Mosquito Forceps', category: 'General Surgery', quantity: 24, status: 'sterilizing', currentCycleId: 'CYC-001' },
  { id: 'INS-003', name: 'Laparoscope 10mm', category: 'Laparoscopy', quantity: 4, status: 'in_use', assignedOT: 'OT-2' },
  { id: 'INS-004', name: 'Retractor Set', category: 'General Surgery', quantity: 6, status: 'dirty' },
  { id: 'INS-005', name: 'Endoscope Biopsy Forceps', category: 'Endoscopy', quantity: 8, status: 'ready', lastSterilizedAt: '2026-05-09T07:00:00Z' },
]

const CYCLES: SterilizationCycle[] = [
  { id: 'CYC-001', batchNumber: 'BATCH-20260509-01', method: 'Autoclave', startedAt: '2026-05-09T08:00:00Z', status: 'running', operatorId: 'CS-1301', instrumentIds: ['INS-002'], biologicalIndicator: false, chemicalIndicatorPass: true },
  { id: 'CYC-002', batchNumber: 'BATCH-20260509-02', method: 'Plasma', startedAt: '2026-05-09T07:00:00Z', completedAt: '2026-05-09T07:45:00Z', status: 'passed', operatorId: 'CS-1301', instrumentIds: ['INS-005'], biologicalIndicator: true, chemicalIndicatorPass: true },
]

export const useCSSDStore = create<CSSDState>((set) => ({
  cycles: CYCLES,
  instruments: INSTRUMENTS,
  addCycle: (c) =>
    set((state) => ({ cycles: [{ ...c, id: `CYC-${Date.now()}` }, ...state.cycles] })),
  updateCycle: (id, update) =>
    set((state) => ({ cycles: state.cycles.map((c) => c.id === id ? { ...c, ...update } : c) })),
  updateInstrument: (id, update) =>
    set((state) => ({ instruments: state.instruments.map((i) => i.id === id ? { ...i, ...update } : i) })),
}))
