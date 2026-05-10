import { create } from 'zustand'

export type OTStatus = 'Scheduled' | 'Pre-Op' | 'In Progress' | 'Recovery' | 'Completed'

export type ChecklistItem = {
  id: string
  label: string
  checked: boolean
  critical: boolean
}

export type OTProcedure = {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  procedureName: string
  surgeon: string
  anaesthetist: string
  otRoom: string
  scheduledTime: string
  durationMinutes: number
  status: OTStatus
  bloodRequired: boolean
  implants: string[]
  checklist: ChecklistItem[]
  notes?: string
  startedAt?: string
  completedAt?: string
  postOpWard?: string
}

export type OTRoom = {
  id: string
  name: string
  status: 'Available' | 'In Use' | 'Cleaning' | 'Maintenance'
  currentProcedureId?: string
  nextScheduledTime?: string
}

interface OTState {
  procedures: OTProcedure[]
  otRooms: OTRoom[]
  scheduleProcedure: (proc: Omit<OTProcedure, 'id' | 'checklist'>) => void
  updateStatus: (id: string, status: OTStatus) => void
  checkItem: (procedureId: string, itemId: string) => void
  addNote: (procedureId: string, note: string) => void
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Informed consent signed', checked: false, critical: true },
  { label: 'Surgical site marked', checked: false, critical: true },
  { label: 'NPO confirmed (fasting ≥6h)', checked: false, critical: true },
  { label: 'Anaesthesia assessment done', checked: false, critical: true },
  { label: 'Blood arranged (if needed)', checked: false, critical: false },
  { label: 'Implants/prosthetics confirmed', checked: false, critical: false },
  { label: 'Allergies rechecked', checked: false, critical: true },
  { label: 'IV line secured', checked: false, critical: false },
  { label: 'Patient ID verified', checked: false, critical: true },
  { label: 'OT room readiness confirmed', checked: false, critical: false },
]

function makeChecklist(): ChecklistItem[] {
  return DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `CHK-${i}` }))
}

const MOCK_PROCEDURES: OTProcedure[] = [
  {
    id: 'OT-001',
    patientId: 'PT-10220',
    patientName: 'Arvind Gupta',
    patientAge: 62,
    procedureName: 'Total Knee Replacement (TKR)',
    surgeon: 'Dr. Ravi Kumar',
    anaesthetist: 'Dr. Anisha Sharma',
    otRoom: 'OT-1',
    scheduledTime: '08:30',
    durationMinutes: 120,
    status: 'In Progress',
    bloodRequired: true,
    implants: ['Knee implant system (Size M)'],
    checklist: makeChecklist().map(c => ({ ...c, checked: true })),
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'OT-002',
    patientId: 'PT-10221',
    patientName: 'Meena Sharma',
    patientAge: 35,
    procedureName: 'Laparoscopic Cholecystectomy',
    surgeon: 'Dr. Kiran Joshi',
    anaesthetist: 'Dr. Anisha Sharma',
    otRoom: 'OT-2',
    scheduledTime: '11:00',
    durationMinutes: 60,
    status: 'Pre-Op',
    bloodRequired: false,
    implants: [],
    checklist: makeChecklist().map((c, i) => i < 5 ? { ...c, checked: true } : c),
  },
  {
    id: 'OT-003',
    patientId: 'PT-10222',
    patientName: 'Suresh Pillai',
    patientAge: 48,
    procedureName: 'TURP (Transurethral Resection)',
    surgeon: 'Dr. Sanjay Mehta',
    anaesthetist: 'Dr. Praveen Bose',
    otRoom: 'OT-3',
    scheduledTime: '14:00',
    durationMinutes: 90,
    status: 'Scheduled',
    bloodRequired: false,
    implants: [],
    checklist: makeChecklist(),
  },
]

export const useOTStore = create<OTState>((set) => ({
  procedures: MOCK_PROCEDURES,
  otRooms: [
    { id: 'OT-1', name: 'OT-1 (Main)', status: 'In Use', currentProcedureId: 'OT-001' },
    { id: 'OT-2', name: 'OT-2 (Minor)', status: 'In Use', currentProcedureId: 'OT-002' },
    { id: 'OT-3', name: 'OT-3 (Urology)', status: 'Available', nextScheduledTime: '14:00' },
  ],

  scheduleProcedure: (proc) =>
    set((s) => ({
      procedures: [
        ...s.procedures,
        { ...proc, id: `OT-${Date.now()}`, checklist: makeChecklist() },
      ],
    })),

  updateStatus: (id, status) =>
    set((s) => ({
      procedures: s.procedures.map(p => {
        if (p.id !== id) return p
        const updates: Partial<OTProcedure> = { status }
        if (status === 'In Progress') updates.startedAt = new Date().toISOString()
        if (status === 'Completed') updates.completedAt = new Date().toISOString()
        return { ...p, ...updates }
      }),
      otRooms: s.otRooms.map(r => {
        if (r.currentProcedureId !== id) return r
        return { ...r, status: status === 'Completed' ? 'Cleaning' : r.status }
      }),
    })),

  checkItem: (procedureId, itemId) =>
    set((s) => ({
      procedures: s.procedures.map(p =>
        p.id === procedureId
          ? { ...p, checklist: p.checklist.map(c => c.id === itemId ? { ...c, checked: !c.checked } : c) }
          : p
      ),
    })),

  addNote: (procedureId, note) =>
    set((s) => ({
      procedures: s.procedures.map(p =>
        p.id === procedureId ? { ...p, notes: p.notes ? `${p.notes}\n${note}` : note } : p
      ),
    })),
}))
