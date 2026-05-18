import { create } from 'zustand'

export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Maintenance'

export type Bed = {
  id: string
  bedNumber: string
  ward: 'General Ward' | 'ICU' | 'Private Room' | 'Semi-Private' | 'Day Care'
  floor: string
  status: BedStatus
  occupantId?: string
  occupantName?: string
  cleaningAssignedTo?: string
  lastCleaned?: string
  gender?: 'Male' | 'Female' | 'Any'
}

export type AdmissionBundle = {
  prescriptions: Array<{ medicine: string; dosage: string; duration: string; instructions?: string }>
  labOrders: Array<{ testName: string; priority: string }>
  radiologyOrders: Array<{ scanType: string; bodyPart: string; priority: string }>
  allergies: string
  comorbidities: string
  specialInstructions: string
  urgency: 'Routine' | 'Urgent' | 'Emergency'
}

export type AdmissionRequest = {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  patientGender: string
  diagnosis: string
  admissionType: string
  bedTypePreference: string
  reason: string
  requestedBy: string
  department: string
  triageLevel?: string
  payerType: string
  requestedAt: string
  status: 'Pending' | 'Assigned' | 'Admitted' | 'Cancelled'
  assignedBedId?: string
  bundle?: AdmissionBundle
}

interface AdmissionState {
  beds: Bed[]
  admissionRequests: AdmissionRequest[]
  requestAdmission: (req: Omit<AdmissionRequest, 'id' | 'requestedAt' | 'status'>) => void
  assignBed: (requestId: string, bedId: string) => void
  markAdmitted: (requestId: string) => void
  markBedForCleaning: (bedId: string, staffName?: string) => void
  confirmBedReady: (bedId: string) => void
  cancelRequest: (requestId: string) => void
}

const MOCK_BEDS: Bed[] = [
  { id: 'BED-101', bedNumber: '101', ward: 'General Ward', floor: 'Ground', status: 'Available', gender: 'Male' },
  { id: 'BED-102', bedNumber: '102', ward: 'General Ward', floor: 'Ground', status: 'Occupied', occupantId: 'PT-10201', occupantName: 'Raju Singh', gender: 'Male' },
  { id: 'BED-103', bedNumber: '103', ward: 'General Ward', floor: 'Ground', status: 'Cleaning', gender: 'Female' },
  { id: 'BED-104', bedNumber: '104', ward: 'General Ward', floor: 'Ground', status: 'Available', gender: 'Female' },
  { id: 'BED-105', bedNumber: '105', ward: 'General Ward', floor: 'Ground', status: 'Occupied', occupantId: 'PT-10202', occupantName: 'Priya Sharma', gender: 'Female' },
  { id: 'BED-201', bedNumber: '201', ward: 'Semi-Private', floor: '1st', status: 'Available', gender: 'Any' },
  { id: 'BED-202', bedNumber: '202', ward: 'Semi-Private', floor: '1st', status: 'Occupied', occupantId: 'PT-10203', occupantName: 'Mohan Lal', gender: 'Any' },
  { id: 'BED-301', bedNumber: '301', ward: 'Private Room', floor: '2nd', status: 'Available', gender: 'Any' },
  { id: 'BED-302', bedNumber: '302', ward: 'Private Room', floor: '2nd', status: 'Reserved', gender: 'Any' },
  { id: 'BED-ICU-01', bedNumber: 'ICU-01', ward: 'ICU', floor: 'Ground', status: 'Occupied', occupantId: 'PT-10204', occupantName: 'Sunita Devi', gender: 'Any' },
  { id: 'BED-ICU-02', bedNumber: 'ICU-02', ward: 'ICU', floor: 'Ground', status: 'Available', gender: 'Any' },
  { id: 'BED-ICU-03', bedNumber: 'ICU-03', ward: 'ICU', floor: 'Ground', status: 'Maintenance', gender: 'Any' },
  { id: 'BED-DC-01', bedNumber: 'DC-01', ward: 'Day Care', floor: '1st', status: 'Available', gender: 'Any' },
  { id: 'BED-DC-02', bedNumber: 'DC-02', ward: 'Day Care', floor: '1st', status: 'Available', gender: 'Any' },
]

export const useAdmissionStore = create<AdmissionState>((set) => ({
  beds: MOCK_BEDS,
  admissionRequests: [
    {
      id: 'ADM-REQ-001',
      patientId: 'PT-10210',
      patientName: 'Vikram Nair',
      patientAge: 54,
      patientGender: 'Male',
      diagnosis: 'Acute MI — post-PCI',
      admissionType: 'ICU',
      bedTypePreference: 'ICU',
      reason: 'Post cardiac intervention monitoring required',
      requestedBy: 'Dr. Priya Menon',
      department: 'Cardiology',
      triageLevel: 'Critical',
      payerType: 'Cashless (HDFC Ergo)',
      requestedAt: new Date(Date.now() - 20 * 60000).toISOString(),
      status: 'Pending',
      bundle: {
        prescriptions: [
          { medicine: 'Aspirin 75mg', dosage: '75mg', duration: '30 days', instructions: 'OD after breakfast' },
          { medicine: 'Atorvastatin 10mg', dosage: '10mg', duration: '30 days', instructions: 'OD at night' },
        ],
        labOrders: [
          { testName: 'Troponin I', priority: 'Urgent' },
          { testName: 'Complete Blood Count (CBC)', priority: 'Routine' },
          { testName: 'Renal Function Test (RFT)', priority: 'Routine' },
        ],
        radiologyOrders: [
          { scanType: 'X-Ray', bodyPart: 'Chest', priority: 'Urgent' },
        ],
        allergies: 'Beta-blockers — causes bronchospasm',
        comorbidities: 'Hypertension, Type 2 Diabetes',
        specialInstructions: 'ECG monitoring continuous. Cardiac diet. NPO until further notice.',
        urgency: 'Emergency',
      },
    },
    {
      id: 'ADM-REQ-002',
      patientId: 'PT-10211',
      patientName: 'Lakshmi Iyer',
      patientAge: 38,
      patientGender: 'Female',
      diagnosis: 'Diabetic Ketoacidosis',
      admissionType: 'General Ward',
      bedTypePreference: 'General Ward',
      reason: 'IV insulin and electrolyte correction needed',
      requestedBy: 'Dr. Vikram Rathore',
      department: 'Endocrinology',
      triageLevel: 'High',
      payerType: 'General',
      requestedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      status: 'Pending',
      bundle: {
        prescriptions: [
          { medicine: 'Insulin Actrapid (IV)', dosage: '0.1 units/kg/hr', duration: 'Until DKA resolved', instructions: 'IV infusion — titrate per protocol' },
          { medicine: 'Normal Saline 0.9%', dosage: '1L over 1 hour', duration: 'As per fluid protocol', instructions: 'IV bolus then maintenance' },
        ],
        labOrders: [
          { testName: 'Blood Glucose (FBS/PPBS)', priority: 'Urgent' },
          { testName: 'Serum Electrolytes', priority: 'Urgent' },
          { testName: 'HbA1c', priority: 'Routine' },
          { testName: 'Coagulation Profile (PT/APTT)', priority: 'Routine' },
        ],
        radiologyOrders: [],
        allergies: 'None known',
        comorbidities: 'Type 1 Diabetes since age 14',
        specialInstructions: 'Hourly CBG monitoring. Target glucose 150–250 mg/dL. Watch for hypokalemia.',
        urgency: 'Urgent',
      },
    },
  ],

  requestAdmission: (req) =>
    set((s) => ({
      admissionRequests: [
        ...s.admissionRequests,
        { ...req, id: `ADM-REQ-${Date.now()}`, requestedAt: new Date().toISOString(), status: 'Pending' },
      ],
    })),

  assignBed: (requestId, bedId) =>
    set((s) => {
      const req = s.admissionRequests.find(r => r.id === requestId)
      if (!req) return s
      return {
        admissionRequests: s.admissionRequests.map(r =>
          r.id === requestId ? { ...r, status: 'Assigned', assignedBedId: bedId } : r
        ),
        beds: s.beds.map(b =>
          b.id === bedId
            ? { ...b, status: 'Occupied', occupantId: req.patientId, occupantName: req.patientName }
            : b
        ),
      }
    }),

  markAdmitted: (requestId) =>
    set((s) => ({
      admissionRequests: s.admissionRequests.map(r =>
        r.id === requestId ? { ...r, status: 'Admitted' } : r
      ),
    })),

  markBedForCleaning: (bedId, staffName) =>
    set((s) => ({
      beds: s.beds.map(b =>
        b.id === bedId ? { ...b, status: 'Cleaning', cleaningAssignedTo: staffName } : b
      ),
    })),

  confirmBedReady: (bedId) =>
    set((s) => ({
      beds: s.beds.map(b =>
        b.id === bedId ? { ...b, status: 'Available', cleaningAssignedTo: undefined, lastCleaned: new Date().toISOString() } : b
      ),
    })),

  cancelRequest: (requestId) =>
    set((s) => ({
      admissionRequests: s.admissionRequests.map(r =>
        r.id === requestId ? { ...r, status: 'Cancelled' } : r
      ),
    })),
}))
