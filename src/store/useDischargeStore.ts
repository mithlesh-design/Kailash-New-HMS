import { create } from 'zustand'

export type ClearancePillar = 'doctor' | 'nursing' | 'pharmacy' | 'billing' | 'insurance'

export type DischargeBlocker = {
  id: string
  type: string
  description: string
  owner: string
  resolvedAt?: string
}

export type DischargePatient = {
  id: string
  patientId: string
  patientName: string
  wardBed: string
  diagnosis: string
  admittedOn: string
  expectedDischarge: string
  attendingDoctor: string
  clearances: Record<ClearancePillar, 'pending' | 'cleared'>
  blockers: DischargeBlocker[]
  summaryDrafted: boolean
  summaryApproved: boolean
  exitClearanceIssued: boolean
  dischargeSummary?: string
  dischargeInstructions?: string
  followUpDate?: string
  payerType: string
  condition?: 'Stable' | 'Monitoring' | 'Critical'
  inOT?: boolean
  otProcedure?: string
  otExpectedEnd?: string
}

interface DischargeState {
  dischargeQueue: DischargePatient[]
  initDischarge: (patient: Omit<DischargePatient, 'id' | 'clearances' | 'blockers' | 'summaryDrafted' | 'summaryApproved' | 'exitClearanceIssued'>) => void
  setClearance: (patientId: string, pillar: ClearancePillar, status: 'pending' | 'cleared') => void
  addBlocker: (patientId: string, blocker: Omit<DischargeBlocker, 'id'>) => void
  resolveBlocker: (patientId: string, blockerId: string) => void
  draftSummary: (patientId: string, summary: string) => void
  approveSummary: (patientId: string) => void
  issueExitClearance: (patientId: string) => void
  setFollowUp: (patientId: string, date: string) => void
  setInstructions: (patientId: string, instructions: string) => void
}

const MOCK_DISCHARGE_PATIENTS: DischargePatient[] = [
  {
    id: 'DC-001',
    patientId: 'PT-10203',
    patientName: 'Mohan Lal',
    wardBed: 'Semi-Private 202',
    diagnosis: 'Type 2 Diabetes — stabilised',
    admittedOn: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    expectedDischarge: new Date().toISOString(),
    attendingDoctor: 'Dr. Priya Menon',
    clearances: { doctor: 'cleared', nursing: 'cleared', pharmacy: 'pending', billing: 'pending', insurance: 'pending' },
    blockers: [
      { id: 'BLK-001', type: 'Billing', description: 'Final pharmacy bill not reconciled', owner: 'Billing Desk' },
      { id: 'BLK-002', type: 'Insurance', description: 'TPA pre-auth query pending since 6h', owner: 'Karan Patel (TPA)' },
    ],
    summaryDrafted: true,
    summaryApproved: false,
    exitClearanceIssued: false,
    payerType: 'Cashless (Star Health)',
    condition: 'Stable',
    dischargeSummary: `Patient Mohan Lal, 52 years, admitted on ${new Date(Date.now() - 4 * 24 * 3600000).toLocaleDateString()} for Type 2 Diabetes management. Presenting with HbA1c of 11.2%. Treated with IV insulin protocol for 2 days followed by oral hypoglycaemics. Blood glucose stabilised. Nephrology review done — no CKD progression. Discharged on Metformin 500mg BD and Glimepiride 2mg OD. Follow-up in 2 weeks.`,
  },
  {
    id: 'DC-002',
    patientId: 'PT-10202',
    patientName: 'Priya Sharma',
    wardBed: 'General Ward 105',
    diagnosis: 'Appendicitis — post-laparoscopic appendectomy',
    admittedOn: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    expectedDischarge: new Date().toISOString(),
    attendingDoctor: 'Dr. Ravi Kumar',
    clearances: { doctor: 'cleared', nursing: 'pending', pharmacy: 'pending', billing: 'pending', insurance: 'cleared' },
    blockers: [
      { id: 'BLK-003', type: 'Nursing', description: 'Post-op wound dressing change pending', owner: 'Nurse Anjali Desai' },
    ],
    summaryDrafted: false,
    summaryApproved: false,
    exitClearanceIssued: false,
    payerType: 'General (Cash)',
    condition: 'Monitoring',
    inOT: true,
    otProcedure: 'Laparoscopic Cholecystectomy',
    otExpectedEnd: '03:30 PM',
  },
]

export const useDischargeStore = create<DischargeState>((set) => ({
  dischargeQueue: MOCK_DISCHARGE_PATIENTS,

  initDischarge: (patient) =>
    set((s) => ({
      dischargeQueue: [
        ...s.dischargeQueue,
        {
          ...patient,
          id: `DC-${Date.now()}`,
          clearances: { doctor: 'pending', nursing: 'pending', pharmacy: 'pending', billing: 'pending', insurance: 'pending' },
          blockers: [],
          summaryDrafted: false,
          summaryApproved: false,
          exitClearanceIssued: false,
        },
      ],
    })),

  setClearance: (patientId, pillar, status) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId ? { ...p, clearances: { ...p.clearances, [pillar]: status } } : p
      ),
    })),

  addBlocker: (patientId, blocker) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId
          ? { ...p, blockers: [...p.blockers, { ...blocker, id: `BLK-${Date.now()}` }] }
          : p
      ),
    })),

  resolveBlocker: (patientId, blockerId) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId
          ? { ...p, blockers: p.blockers.map(b => b.id === blockerId ? { ...b, resolvedAt: new Date().toISOString() } : b) }
          : p
      ),
    })),

  draftSummary: (patientId, summary) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId ? { ...p, summaryDrafted: true, dischargeSummary: summary } : p
      ),
    })),

  approveSummary: (patientId) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId ? { ...p, summaryApproved: true } : p
      ),
    })),

  issueExitClearance: (patientId) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId ? { ...p, exitClearanceIssued: true } : p
      ),
    })),

  setFollowUp: (patientId, date) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId ? { ...p, followUpDate: date } : p
      ),
    })),

  setInstructions: (patientId, instructions) =>
    set((s) => ({
      dischargeQueue: s.dischargeQueue.map(p =>
        p.patientId === patientId ? { ...p, dischargeInstructions: instructions } : p
      ),
    })),
}))
