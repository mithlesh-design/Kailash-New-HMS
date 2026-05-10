import { create } from 'zustand'

export type PrepStatus = 'queued' | 'preparing' | 'ready' | 'collected'

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
}))
