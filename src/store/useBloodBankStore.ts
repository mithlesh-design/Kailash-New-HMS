import { create } from 'zustand'

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type BloodComponent = 'Whole Blood' | 'Packed RBC' | 'Fresh Frozen Plasma' | 'Platelets' | 'Cryoprecipitate'
export type CrossMatchStatus = 'pending' | 'compatible' | 'incompatible' | 'issued'

export interface BloodUnit {
  id: string
  bloodGroup: BloodGroup
  component: BloodComponent
  bagNumber: string
  collectedOn: string
  expiresOn: string
  donorId: string
  issuedTo?: string
  status: 'available' | 'reserved' | 'issued' | 'expired'
}

export interface CrossMatchRequest {
  id: string
  patientId: string
  patientName: string
  bloodGroup: BloodGroup
  component: BloodComponent
  units: number
  requestedBy: string
  requestedAt: string
  status: CrossMatchStatus
  issuedUnitIds?: string[]
}

interface BloodBankState {
  units: BloodUnit[]
  crossMatchRequests: CrossMatchRequest[]
  inventorySummary: () => Record<BloodGroup, number>
  addRequest: (r: Omit<CrossMatchRequest, 'id' | 'requestedAt'>) => void
  updateRequest: (id: string, update: Partial<CrossMatchRequest>) => void
  issueUnit: (unitId: string, patientId: string) => void
}

const BLOOD_UNITS: BloodUnit[] = [
  { id: 'BU-001', bloodGroup: 'O+', component: 'Packed RBC', bagNumber: 'BAG-4521', collectedOn: '2026-05-01', expiresOn: '2026-06-12', donorId: 'DN-001', status: 'available' },
  { id: 'BU-002', bloodGroup: 'O+', component: 'Packed RBC', bagNumber: 'BAG-4522', collectedOn: '2026-05-03', expiresOn: '2026-06-14', donorId: 'DN-002', status: 'available' },
  { id: 'BU-003', bloodGroup: 'A+', component: 'Packed RBC', bagNumber: 'BAG-4523', collectedOn: '2026-04-28', expiresOn: '2026-06-09', donorId: 'DN-003', status: 'available' },
  { id: 'BU-004', bloodGroup: 'B+', component: 'Platelets',  bagNumber: 'BAG-4524', collectedOn: '2026-05-06', expiresOn: '2026-05-11', donorId: 'DN-004', status: 'available' },
  { id: 'BU-005', bloodGroup: 'AB+', component: 'Fresh Frozen Plasma', bagNumber: 'BAG-4525', collectedOn: '2026-05-01', expiresOn: '2026-11-01', donorId: 'DN-005', status: 'available' },
  { id: 'BU-006', bloodGroup: 'O-', component: 'Packed RBC', bagNumber: 'BAG-4526', collectedOn: '2026-05-05', expiresOn: '2026-06-16', donorId: 'DN-006', status: 'available' },
  { id: 'BU-007', bloodGroup: 'A-', component: 'Packed RBC', bagNumber: 'BAG-4527', collectedOn: '2026-04-25', expiresOn: '2026-06-06', donorId: 'DN-007', status: 'reserved' },
  { id: 'BU-008', bloodGroup: 'B-', component: 'Platelets',  bagNumber: 'BAG-4528', collectedOn: '2026-05-04', expiresOn: '2026-05-09', donorId: 'DN-008', status: 'available' },
]

const CROSS_MATCH_REQUESTS: CrossMatchRequest[] = [
  { id: 'CMR-001', patientId: 'PT-20394', patientName: 'Kiran Patil', bloodGroup: 'O+', component: 'Packed RBC', units: 2, requestedBy: 'Dr. Priya Menon', requestedAt: new Date(Date.now() - 3600000).toISOString(), status: 'pending' },
  { id: 'CMR-002', patientId: 'PT-20398', patientName: 'Mohan Lal', bloodGroup: 'A+', component: 'Fresh Frozen Plasma', units: 1, requestedBy: 'Dr. Vikram Rathore', requestedAt: new Date(Date.now() - 7200000).toISOString(), status: 'compatible', issuedUnitIds: [] },
]

export const useBloodBankStore = create<BloodBankState>((set, get) => ({
  units: BLOOD_UNITS,
  crossMatchRequests: CROSS_MATCH_REQUESTS,
  inventorySummary: () => {
    const avail = get().units.filter((u) => u.status === 'available')
    const summary: Record<BloodGroup, number> = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 }
    avail.forEach((u) => { summary[u.bloodGroup] = (summary[u.bloodGroup] ?? 0) + 1 })
    return summary
  },
  addRequest: (r) =>
    set((state) => ({
      crossMatchRequests: [{ ...r, id: `CMR-${Date.now()}`, requestedAt: new Date().toISOString() }, ...state.crossMatchRequests],
    })),
  updateRequest: (id, update) =>
    set((state) => ({
      crossMatchRequests: state.crossMatchRequests.map((r) => r.id === id ? { ...r, ...update } : r),
    })),
  issueUnit: (unitId, patientId) =>
    set((state) => ({
      units: state.units.map((u) => u.id === unitId ? { ...u, status: 'issued', issuedTo: patientId } : u),
    })),
}))
