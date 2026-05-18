import { create } from 'zustand'

export type PrepStatus = 'queued' | 'preparing' | 'ready' | 'collected'
export type ProcurementStatus = 'immediate' | 'deferred_ipd' | 'procurement_requested'

export interface PharmacyPrescription {
  id: string
  patientId: string
  patientName: string
  tokenNumber: number
  doctorName: string
  department: string
  medicines: PharmacyMedicine[]
  status: PrepStatus
  dispatchedAt: string
  estimatedReadyIn: number  // minutes
  notes?: string
  triageLevel?: 'Low' | 'Medium' | 'High' | 'Critical'
  patientModifications?: string[]  // medicine names patient already has at home
  procurementStatus?: ProcurementStatus  // OPD=immediate, IPD=deferred_ipd until ward requests
  requestedByWardAt?: string             // set when ward nursing staff triggers procurement
  wardBed?: string
}

export interface PharmacyMedicine {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
}

interface PharmacyStore {
  prescriptions: PharmacyPrescription[]
  addPrescription: (p: PharmacyPrescription) => void
  updateStatus: (id: string, status: PrepStatus) => void
  markCollected: (id: string) => void
  togglePatientModification: (prescriptionId: string, medicineName: string) => void
  applyModification: (prescriptionId: string) => void
  requestProcurement: (id: string) => void
}

const DEMO_PRESCRIPTIONS: PharmacyPrescription[] = [
  {
    id: 'RX001',
    patientId: 'P001',
    patientName: 'Meera Pillai',
    tokenNumber: 7,
    doctorName: 'Dr. Priya Nair',
    department: 'General Medicine',
    status: 'preparing',
    dispatchedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    estimatedReadyIn: 4,
    triageLevel: 'Medium',
    medicines: [
      { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TDS', duration: '5 days', quantity: 15 },
      { name: 'Amoxicillin 250mg', dosage: '250mg', frequency: 'BD', duration: '7 days', quantity: 14 },
      { name: 'ORS Sachets', dosage: '1 sachet', frequency: 'After loose motions', duration: 'As needed', quantity: 10 },
    ],
  },
  {
    id: 'RX002',
    patientId: 'P006',
    patientName: 'Rakesh Verma',
    tokenNumber: 3,
    doctorName: 'Dr. Arjun Mehta',
    department: 'Cardiology',
    status: 'ready',
    dispatchedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    estimatedReadyIn: 0,
    triageLevel: 'High',
    medicines: [
      { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: 'OD at night', duration: '30 days', quantity: 30 },
      { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'OD after breakfast', duration: '30 days', quantity: 30 },
      { name: 'Metoprolol 25mg', dosage: '25mg', frequency: 'BD', duration: '30 days', quantity: 60 },
    ],
  },
  {
    id: 'RX003',
    patientId: 'P004',
    patientName: 'Kiran Patil',
    tokenNumber: 12,
    doctorName: 'Dr. Sunita Rao',
    department: 'Orthopedics',
    status: 'queued',
    dispatchedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    estimatedReadyIn: 10,
    triageLevel: 'Low',
    medicines: [
      { name: 'Diclofenac 50mg', dosage: '50mg', frequency: 'BD after food', duration: '5 days', quantity: 10 },
      { name: 'Pantoprazole 40mg', dosage: '40mg', frequency: 'OD before breakfast', duration: '5 days', quantity: 5 },
    ],
    procurementStatus: 'immediate',
  },
  {
    id: 'RX-IPD-001',
    patientId: 'PT-10210',
    patientName: 'Vikram Nair',
    tokenNumber: 0,
    doctorName: 'Dr. Priya Menon',
    department: 'Cardiology',
    status: 'queued',
    dispatchedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    estimatedReadyIn: 0,
    triageLevel: 'Critical',
    wardBed: 'ICU-02',
    procurementStatus: 'deferred_ipd',
    medicines: [
      { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'OD', duration: '30 days', quantity: 30 },
      { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: 'OD at night', duration: '30 days', quantity: 30 },
      { name: 'Heparin 5000U (IV)', dosage: '5000 units', frequency: 'Q6H', duration: 'Per protocol', quantity: 12 },
    ],
  },
  {
    id: 'RX-IPD-002',
    patientId: 'PT-10211',
    patientName: 'Lakshmi Iyer',
    tokenNumber: 0,
    doctorName: 'Dr. Vikram Rathore',
    department: 'Endocrinology',
    status: 'queued',
    dispatchedAt: new Date(Date.now() - 50 * 60000).toISOString(),
    estimatedReadyIn: 0,
    triageLevel: 'High',
    wardBed: 'General Ward — 104',
    procurementStatus: 'deferred_ipd',
    medicines: [
      { name: 'Insulin Actrapid (IV)', dosage: '0.1 units/kg/hr', frequency: 'Continuous infusion', duration: 'Until DKA resolved', quantity: 3 },
      { name: 'Normal Saline 0.9% (1L)', dosage: '1L', frequency: 'Per fluid protocol', duration: 'As needed', quantity: 5 },
      { name: 'KCl 20mEq (IV)', dosage: '20mEq', frequency: 'Per potassium protocol', duration: 'As needed', quantity: 6 },
    ],
  },
]

export const usePharmacyStore = create<PharmacyStore>((set) => ({
  prescriptions: DEMO_PRESCRIPTIONS,

  addPrescription: (p) =>
    set(state => ({ prescriptions: [p, ...state.prescriptions] })),

  updateStatus: (id, status) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p =>
        p.id === id ? { ...p, status, estimatedReadyIn: status === 'ready' ? 0 : p.estimatedReadyIn } : p
      ),
    })),

  markCollected: (id) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p =>
        p.id === id ? { ...p, status: 'collected' as PrepStatus } : p
      ),
    })),

  togglePatientModification: (prescriptionId, medicineName) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p => {
        if (p.id !== prescriptionId) return p
        const mods = p.patientModifications ?? []
        return {
          ...p,
          patientModifications: mods.includes(medicineName)
            ? mods.filter(m => m !== medicineName)
            : [...mods, medicineName],
        }
      }),
    })),

  applyModification: (prescriptionId) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p =>
        p.id === prescriptionId ? { ...p } : p
      ),
    })),

  requestProcurement: (id) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p =>
        p.id === id
          ? { ...p, procurementStatus: 'procurement_requested' as ProcurementStatus, requestedByWardAt: new Date().toISOString() }
          : p
      ),
    })),
}))
