import { create } from 'zustand'

export type LegalClearanceStatus = 'pending' | 'mlc' | 'cleared' | 'released'
export type CauseOfDeath = 'Natural' | 'Accidental' | 'Suicide' | 'Homicide' | 'Unknown' | 'Under Investigation'

export interface DeceasedRecord {
  id: string
  patientId: string
  patientName: string
  age: number
  gender: 'M' | 'F' | 'Other'
  ward: string
  bedNumber: string
  timeOfDeath: string
  certifiedBy: string
  causeOfDeath: CauseOfDeath
  isMLC: boolean
  mlcNumber?: string
  policeStation?: string
  bodySlot: number
  legalClearance: LegalClearanceStatus
  deathCertificateNumber?: string
  releasedTo?: string
  releasedAt?: string
  autopsyRequired?: boolean
  autopsyCompletedAt?: string
}

interface MortuaryState {
  records: DeceasedRecord[]
  totalSlots: number
  addRecord: (r: Omit<DeceasedRecord, 'id'>) => void
  updateRecord: (id: string, update: Partial<DeceasedRecord>) => void
  availableSlots: () => number
}

const RECORDS: DeceasedRecord[] = [
  { id: 'MRT-001', patientId: 'PT-19001', patientName: 'Ramchandra Sharma', age: 78, gender: 'M', ward: 'ICU', bedNumber: 'ICU-5', timeOfDeath: '2026-05-09T03:22:00Z', certifiedBy: 'Dr. Vikram Rathore', causeOfDeath: 'Natural', isMLC: false, bodySlot: 1, legalClearance: 'cleared', deathCertificateNumber: 'DC-2026-0512' },
  { id: 'MRT-002', patientId: 'PT-19045', patientName: 'Unknown Male', age: 35, gender: 'M', ward: 'Emergency', bedNumber: 'ER-2', timeOfDeath: '2026-05-09T06:10:00Z', certifiedBy: 'Dr. Vikram Rathore', causeOfDeath: 'Accidental', isMLC: true, mlcNumber: 'MLC-2026-0234', policeStation: 'Andheri PS', bodySlot: 2, legalClearance: 'mlc', autopsyRequired: true },
]

export const useMortuaryStore = create<MortuaryState>((set, get) => ({
  records: RECORDS,
  totalSlots: 10,
  addRecord: (r) =>
    set((state) => ({ records: [{ ...r, id: `MRT-${Date.now()}` }, ...state.records] })),
  updateRecord: (id, update) =>
    set((state) => ({ records: state.records.map((r) => r.id === id ? { ...r, ...update } : r) })),
  availableSlots: () => get().totalSlots - get().records.filter((r) => r.legalClearance !== 'released').length,
}))
