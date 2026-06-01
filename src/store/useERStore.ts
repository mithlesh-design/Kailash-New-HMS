import { create } from 'zustand'
import { useNotificationStore } from './useNotificationStore'
import { useAdmissionStore } from './useAdmissionStore'
import { useAuditStore } from './useAuditStore'
import {
  news2 as calcNEWS2,
  qsofa as calcQSOFA,
  suggestArea,
  type Vitals,
  type ESIBand,
  type TreatmentArea,
} from '@/lib/erClinical'

// ── Domain types ───────────────────────────────────────────────────────────

export type Arrival = 'walk_in' | 'ambulance' | 'transfer'
export type Disposition = 'admit_ward' | 'admit_icu' | 'admit_hdu' | 'discharge' | 'transfer' | 'deceased' | 'against_medical_advice'
export type Phase = 'awaiting_triage' | 'triaged' | 'in_treatment' | 'awaiting_disposition' | 'disposed'

export type VitalsRecord = Vitals & { at: string; by?: string }

export type ERStaff = { id: string; name: string }

export type ERPatient = {
  id: string
  patientId: string
  name: string
  age: number
  gender: 'M' | 'F' | 'X'
  arrival: Arrival
  arrivedAt: string                  // door-time
  triagedAt?: string
  doctorClaimAt?: string
  decisionAt?: string                // disposition decided
  dispositionAt?: string             // actually left ER
  chiefComplaint: string
  trauma: boolean
  esi?: ESIBand
  esiReason?: string
  area?: TreatmentArea
  assignedTo?: ERStaff
  vitalsHistory: VitalsRecord[]
  bedNumber?: string
  notes?: string
  disposition?: Disposition
  dispositionNote?: string
  callbackLogged?: { calledBy: string; calledAt: string; recipient: string }
  phase: Phase
  mci?: boolean                      // mass-casualty incident flag
}

// ── Helpers ────────────────────────────────────────────────────────────────

const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString()
let _erSeq = 0
const nextId = () => `ER-${Date.now()}-${++_erSeq}`

export function latestVitals(p: ERPatient): VitalsRecord | undefined {
  return p.vitalsHistory[p.vitalsHistory.length - 1]
}

export function getNEWS2(p: ERPatient) {
  const v = latestVitals(p)
  if (!v) return { score: 0, band: 'low' as const, trigger: 'No vitals recorded' }
  return calcNEWS2(v)
}

export function getQSOFA(p: ERPatient) {
  const v = latestVitals(p)
  if (!v) return { score: 0, positive: false, criteria: [] }
  return calcQSOFA(v)
}

// ── State ──────────────────────────────────────────────────────────────────

interface ERState {
  patients: ERPatient[]
  mciActive: boolean
  toggleMCI: () => void
  registerArrival: (input: {
    patientId: string; name: string; age: number; gender: 'M' | 'F' | 'X'
    arrival: Arrival; chiefComplaint: string; trauma?: boolean
  }) => string
  recordVitals: (id: string, v: Vitals, by: string) => void
  setESI: (id: string, esi: ESIBand, reason: string) => void
  routeToArea: (id: string, area: TreatmentArea, bed?: string) => void
  claim: (id: string, doctor: ERStaff) => void
  unclaim: (id: string) => void
  setDisposition: (id: string, disposition: Disposition, note?: string) => void
  dispose: (id: string) => void
  logCallback: (id: string, calledBy: string, recipient: string) => void
}

// ── Roster ────────────────────────────────────────────────────────────────

export const ER_VIKRAM: ERStaff = { id: 'ER-110', name: 'Dr. Vikram Rathore' }
export const ER_NEHA: ERStaff = { id: 'ER-111', name: 'Dr. Neha Singh' }
export const ER_TRIAGE_NURSE: ERStaff = { id: 'NR-501', name: 'Anjali Pillai' }

// ── Seed ──────────────────────────────────────────────────────────────────

const SEED: ERPatient[] = [
  // 1. Awaiting triage — walked in just now
  {
    id: nextId(),
    patientId: 'PT-30001', name: 'Sandeep Yadav', age: 48, gender: 'M',
    arrival: 'walk_in', arrivedAt: minsAgo(3),
    chiefComplaint: 'Sudden chest pain radiating to left arm, sweating', trauma: false,
    vitalsHistory: [],
    phase: 'awaiting_triage',
  },
  // 2. Awaiting triage — ambulance arrival with trauma
  {
    id: nextId(),
    patientId: 'PT-30002', name: 'Kiran Iyer', age: 28, gender: 'M',
    arrival: 'ambulance', arrivedAt: minsAgo(8),
    chiefComplaint: 'RTA · helmeted · LOC reported by bystander', trauma: true,
    vitalsHistory: [
      { rr: 22, spo2: 96, sbp: 110, hr: 105, temp: 36.8, gcs: 13, at: minsAgo(8), by: 'EMT Saira' },
    ],
    phase: 'awaiting_triage',
  },
  // 3. Triaged ESI 2, in Critical area, claimed by Dr Vikram, mid-sepsis screen
  {
    id: nextId(),
    patientId: 'PT-30003', name: 'Lalita Devi', age: 64, gender: 'F',
    arrival: 'ambulance', arrivedAt: minsAgo(40),
    triagedAt: minsAgo(35),
    doctorClaimAt: minsAgo(28),
    chiefComplaint: 'Fever 3 days, drowsy, oliguric', trauma: false,
    esi: 2, esiReason: 'qSOFA positive — sepsis suspected', area: 'CRITICAL',
    assignedTo: ER_VIKRAM, bedNumber: 'C-2',
    vitalsHistory: [
      { rr: 24, spo2: 93, sbp: 92, hr: 122, temp: 39.2, gcs: 13, at: minsAgo(35), by: ER_TRIAGE_NURSE.name },
      { rr: 24, spo2: 95, sbp: 96, hr: 118, temp: 38.9, gcs: 14, at: minsAgo(15), by: ER_VIKRAM.name, onOxygen: true },
    ],
    phase: 'in_treatment',
  },
  // 4. Triaged ESI 3, Acute, awaiting doctor
  {
    id: nextId(),
    patientId: 'PT-30004', name: 'Reeta Gupta', age: 32, gender: 'F',
    arrival: 'walk_in', arrivedAt: minsAgo(55),
    triagedAt: minsAgo(50),
    chiefComplaint: 'Lower abdominal pain, vomiting, no per-vaginal bleed', trauma: false,
    esi: 3, esiReason: 'Multiple-resource presentation', area: 'ACUTE',
    vitalsHistory: [
      { rr: 18, spo2: 99, sbp: 118, hr: 92, temp: 37.4, gcs: 15, at: minsAgo(50), by: ER_TRIAGE_NURSE.name },
    ],
    phase: 'in_treatment',
  },
  // 5. ESI 4 Fast-track — ankle injury
  {
    id: nextId(),
    patientId: 'PT-30005', name: 'Arjun Kapoor', age: 22, gender: 'M',
    arrival: 'walk_in', arrivedAt: minsAgo(75),
    triagedAt: minsAgo(70),
    chiefComplaint: 'Sport injury · suspected right ankle sprain', trauma: false,
    esi: 4, esiReason: 'Single-resource presentation', area: 'FAST_TRACK',
    vitalsHistory: [
      { rr: 16, spo2: 99, sbp: 122, hr: 78, temp: 36.7, gcs: 15, at: minsAgo(70), by: ER_TRIAGE_NURSE.name },
    ],
    assignedTo: ER_NEHA,
    doctorClaimAt: minsAgo(60),
    phase: 'in_treatment',
  },
  // 7. Disposed — Kiran Patil, the default patient login (PT-20394).
  // He arrived 3 days ago with chest pain, was triaged ESI 2, NEWS2 high,
  // admitted to ICU for PCI workup. Visible from /patient/emergency.
  {
    id: nextId(),
    patientId: 'PT-20394', name: 'Kiran Patil', age: 58, gender: 'M',
    arrival: 'ambulance', arrivedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    triagedAt: new Date(Date.now() - 3 * 86400000 + 8 * 60000).toISOString(),
    doctorClaimAt: new Date(Date.now() - 3 * 86400000 + 12 * 60000).toISOString(),
    decisionAt: new Date(Date.now() - 3 * 86400000 + 95 * 60000).toISOString(),
    dispositionAt: new Date(Date.now() - 3 * 86400000 + 110 * 60000).toISOString(),
    chiefComplaint: 'Severe central chest pain radiating to jaw, sweating, dyspnoea', trauma: false,
    esi: 2, esiReason: 'Suspected ACS · NEWS2 high · cath-lab on standby', area: 'RESUS',
    assignedTo: ER_VIKRAM, bedNumber: 'R-1',
    vitalsHistory: [
      { rr: 26, spo2: 91, sbp: 148, hr: 118, temp: 36.9, gcs: 15, at: new Date(Date.now() - 3 * 86400000 + 8 * 60000).toISOString(), onOxygen: true, by: ER_TRIAGE_NURSE.name },
      { rr: 22, spo2: 95, sbp: 132, hr: 102, temp: 36.8, gcs: 15, at: new Date(Date.now() - 3 * 86400000 + 60 * 60000).toISOString(), onOxygen: true, by: ER_VIKRAM.name },
    ],
    disposition: 'admit_icu',
    dispositionNote: 'Trop I rising — for urgent PCI · ICU bed booked',
    phase: 'disposed',
  },
  // 6. Awaiting disposition — admit to ward
  {
    id: nextId(),
    patientId: 'PT-30006', name: 'Mohan Lal', age: 71, gender: 'M',
    arrival: 'ambulance', arrivedAt: minsAgo(180),
    triagedAt: minsAgo(170),
    doctorClaimAt: minsAgo(160), decisionAt: minsAgo(20),
    chiefComplaint: 'Worsening shortness of breath · ?CCF exacerbation', trauma: false,
    esi: 2, esiReason: 'NEWS2 7 — emergency response', area: 'CRITICAL',
    assignedTo: ER_VIKRAM, bedNumber: 'C-1',
    vitalsHistory: [
      { rr: 28, spo2: 88, sbp: 96, hr: 124, temp: 37.0, gcs: 14, at: minsAgo(170), onOxygen: true, by: ER_TRIAGE_NURSE.name },
      { rr: 22, spo2: 94, sbp: 110, hr: 102, temp: 36.9, gcs: 15, at: minsAgo(30), onOxygen: true, by: ER_VIKRAM.name },
    ],
    disposition: 'admit_ward', dispositionNote: 'Stabilised on IV diuretics + O2; admit Cardiology ward.',
    phase: 'awaiting_disposition',
  },
]

// ── Store ─────────────────────────────────────────────────────────────────

export const useERStore = create<ERState>((set, get) => ({
  patients: SEED,
  mciActive: false,

  toggleMCI: () => set(s => ({ mciActive: !s.mciActive })),

  registerArrival: (input) => {
    const id = nextId()
    set(s => ({
      patients: [{
        id,
        patientId: input.patientId,
        name: input.name,
        age: input.age,
        gender: input.gender,
        arrival: input.arrival,
        arrivedAt: new Date().toISOString(),
        chiefComplaint: input.chiefComplaint,
        trauma: !!input.trauma,
        vitalsHistory: [],
        phase: 'awaiting_triage',
      }, ...s.patients],
    }))
    return id
  },

  recordVitals: (id, v, by) => set(s => ({
    patients: s.patients.map(p => p.id === id
      ? { ...p, vitalsHistory: [...p.vitalsHistory, { ...v, at: new Date().toISOString(), by }] }
      : p),
  })),

  setESI: (id, esi, reason) => set(s => ({
    patients: s.patients.map(p => p.id === id
      ? { ...p, esi, esiReason: reason, triagedAt: p.triagedAt ?? new Date().toISOString(), phase: p.phase === 'awaiting_triage' ? 'triaged' as Phase : p.phase }
      : p),
  })),

  routeToArea: (id, area, bed) => set(s => ({
    patients: s.patients.map(p => p.id === id
      ? { ...p, area, bedNumber: bed ?? p.bedNumber, phase: 'in_treatment' as Phase }
      : p),
  })),

  claim: (id, doctor) => set(s => ({
    patients: s.patients.map(p => p.id === id
      ? { ...p, assignedTo: doctor, doctorClaimAt: p.doctorClaimAt ?? new Date().toISOString() }
      : p),
  })),

  unclaim: (id) => set(s => ({
    patients: s.patients.map(p => p.id === id ? { ...p, assignedTo: undefined } : p),
  })),

  setDisposition: (id, disposition, note) => {
    set(s => ({
      patients: s.patients.map(p => p.id === id
        ? { ...p, disposition, dispositionNote: note, decisionAt: new Date().toISOString(), phase: 'awaiting_disposition' as Phase }
        : p),
    }))
    const p = get().patients.find(x => x.id === id)
    if (p) {
      useNotificationStore.getState().add({
        type: 'system',
        priority: disposition === 'admit_icu' ? 'high' : 'medium',
        title: `ER disposition · ${p.name}`,
        body: `${dispositionLabel(disposition)}${note ? ` — ${note}` : ''}`,
        targetRole: disposition === 'admit_ward' || disposition === 'admit_icu' || disposition === 'admit_hdu' ? 'bed_manager' : 'reception',
        patientName: p.name,
        channels: ['in_app'],
      })
      // For admit_* dispositions, push an AdmissionRequest into the bed-manager queue.
      const admitMap = { admit_ward: 'General Ward', admit_icu: 'ICU', admit_hdu: 'Semi-Private' } as const
      if (disposition === 'admit_ward' || disposition === 'admit_icu' || disposition === 'admit_hdu') {
        const targetWard = admitMap[disposition]
        useAdmissionStore.getState().requestAdmission({
          patientId: p.patientId,
          patientName: p.name,
          patientAge: p.age,
          patientGender: p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other',
          diagnosis: p.chiefComplaint,
          admissionType: targetWard,
          bedTypePreference: targetWard,
          reason: `ER handover · ESI ${p.esi ?? '?'} · ${note ?? ''}`.trim(),
          requestedBy: p.assignedTo?.name ?? 'ER Doctor',
          department: 'Emergency',
          triageLevel: p.esi === 1 ? 'Critical' : p.esi === 2 ? 'High' : 'Routine',
          payerType: 'General',
        })
        useAuditStore.getState().log({
          userId: p.assignedTo?.id ?? 'ER-DOC',
          userName: p.assignedTo?.name ?? 'ER Doctor',
          action: 'er_disposition',
          resource: 'er_patient', resourceId: p.patientId,
          detail: `${p.name} · handover to bed-manager · ${dispositionLabel(disposition)} (${targetWard})`,
        })
      }
    }
  },

  dispose: (id) => set(s => ({
    patients: s.patients.map(p => p.id === id
      ? { ...p, phase: 'disposed' as Phase, dispositionAt: new Date().toISOString() }
      : p),
  })),

  logCallback: (id, calledBy, recipient) => set(s => ({
    patients: s.patients.map(p => p.id === id
      ? { ...p, callbackLogged: { calledBy, recipient, calledAt: new Date().toISOString() } }
      : p),
  })),
}))

export function dispositionLabel(d: Disposition): string {
  return {
    admit_ward: 'Admit · ward',
    admit_icu:  'Admit · ICU',
    admit_hdu:  'Admit · HDU',
    discharge:  'Discharge',
    transfer:   'Transfer out',
    deceased:   'Deceased',
    against_medical_advice: 'AMA (against medical advice)',
  }[d]
}
