import { create } from 'zustand'
import { useAuditStore } from '@/store/useAuditStore'

export type PrepStatus = 'queued' | 'preparing' | 'ready' | 'collected'
export type ProcurementStatus = 'immediate' | 'deferred_ipd' | 'procurement_requested'
export type ModificationReason = 'Has at home' | 'Partial fill' | 'Unable to afford' | 'Travelling today'

export interface QuantityModification {
  medicineName: string
  originalQty: number
  adjustedQty: number
  reason: ModificationReason
  adjustedAt: string
  adjustedBy: string
  requiresSupervisorOverride: boolean
  supervisorApprovedBy?: string
}

export const UNIT_PRICES: Record<string, number> = {
  'Paracetamol 500mg': 8,
  'Amoxicillin 250mg': 18,
  'ORS Sachets': 12,
  'Atorvastatin 10mg': 22,
  'Aspirin 75mg': 5,
  'Metoprolol 25mg': 15,
  'Diclofenac 50mg': 14,
  'Pantoprazole 40mg': 20,
  'Aspirin 75mg (IPD)': 5,
  'Heparin 5000U (IV)': 180,
  'Insulin Actrapid (IV)': 95,
  'Normal Saline 0.9% (1L)': 60,
  'KCl 20mEq (IV)': 45,
}

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
  estimatedReadyIn: number
  notes?: string
  triageLevel?: 'Low' | 'Medium' | 'High' | 'Critical'
  patientModifications?: string[]
  procurementStatus?: ProcurementStatus
  requestedByWardAt?: string
  wardBed?: string
  quantityModifications?: QuantityModification[]
  adjustedBillTotal?: number
  originalBillTotal?: number
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
  adjustQuantity: (prescriptionId: string, medicineName: string, newQty: number, reason: ModificationReason, adjustedBy: string) => void
  approveSupervisorOverride: (prescriptionId: string, medicineName: string, supervisorId: string) => void
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

  adjustQuantity: (prescriptionId, medicineName, newQty, reason, adjustedBy) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p => {
        if (p.id !== prescriptionId) return p
        const medicine = p.medicines.find(m => m.name === medicineName)
        if (!medicine) return p
        const originalQty = medicine.quantity
        const safeQty = Math.max(0, Math.min(originalQty, newQty))
        const requiresSupervisorOverride = originalQty > 0 && (originalQty - safeQty) / originalQty > 0.5
        const existingMods = (p.quantityModifications ?? []).filter(m => m.medicineName !== medicineName)
        const newMod: QuantityModification = {
          medicineName,
          originalQty,
          adjustedQty: safeQty,
          reason,
          adjustedAt: new Date().toISOString(),
          adjustedBy,
          requiresSupervisorOverride,
        }
        const allMods = [...existingMods, newMod]
        const adjustedBillTotal = p.medicines.reduce((sum, m) => {
          const mod = allMods.find(mod => mod.medicineName === m.name)
          const qty = mod ? mod.adjustedQty : m.quantity
          const price = UNIT_PRICES[m.name] ?? 0
          return sum + qty * price
        }, 0)
        const originalBillTotal = p.originalBillTotal ?? p.medicines.reduce((sum, m) => sum + m.quantity * (UNIT_PRICES[m.name] ?? 0), 0)

        useAuditStore.getState().log({
          userId: adjustedBy,
          userName: adjustedBy,
          action: 'pharmacy_qty_adjusted',
          resource: 'pharmacy_prescription',
          resourceId: prescriptionId,
          detail: `${medicineName}: ${originalQty} → ${safeQty} (${reason})`,
          before: { qty: originalQty },
          after: { qty: safeQty, reason },
        })

        return { ...p, quantityModifications: allMods, adjustedBillTotal, originalBillTotal }
      }),
    })),

  approveSupervisorOverride: (prescriptionId, medicineName, supervisorId) =>
    set(state => ({
      prescriptions: state.prescriptions.map(p => {
        if (p.id !== prescriptionId) return p
        const mods = (p.quantityModifications ?? []).map(m =>
          m.medicineName === medicineName ? { ...m, supervisorApprovedBy: supervisorId, requiresSupervisorOverride: false } : m
        )
        useAuditStore.getState().log({
          userId: supervisorId,
          userName: supervisorId,
          action: 'pharmacy_supervisor_override',
          resource: 'pharmacy_prescription',
          resourceId: prescriptionId,
          detail: `Supervisor override approved for ${medicineName}`,
        })
        return { ...p, quantityModifications: mods }
      }),
    })),
}))
