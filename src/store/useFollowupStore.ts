import { create } from 'zustand'

export type FollowupPatient = {
  id: string
  patientId: string
  patientName: string
  dischargedOn: string
  diagnosis: string
  attendingDoctor: string
  followUpDate?: string
  followUpBooked: boolean
  riskLevel: 'Low' | 'Medium' | 'High'
  callbackScheduled: boolean
  callbackDone: boolean
  dischargeSummary: string
  medications: { name: string; dose: string; frequency: string; duration: string }[]
  redFlagSymptoms: string[]
  dietaryAdvice: string
  claimDocumentsReady: boolean
  readmitted?: boolean
}

interface FollowupState {
  patients: FollowupPatient[]
  bookFollowup: (patientId: string, date: string) => void
  scheduleCallback: (patientId: string) => void
  markCallbackDone: (patientId: string) => void
}

export const useFollowupStore = create<FollowupState>((set) => ({
  patients: [
    {
      id: 'FU-001',
      patientId: 'PT-10203',
      patientName: 'Mohan Lal',
      dischargedOn: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      diagnosis: 'Type 2 Diabetes — stabilised',
      attendingDoctor: 'Dr. Priya Menon',
      followUpDate: new Date(Date.now() + 12 * 24 * 3600000).toISOString(),
      followUpBooked: true,
      riskLevel: 'Medium',
      callbackScheduled: true,
      callbackDone: false,
      dischargeSummary: 'Patient stabilised on insulin regimen. HbA1c reduced from 11.2% to expected 8.5% with current therapy. Oral hypoglycaemics initiated. Renal function stable.',
      medications: [
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', duration: '3 months' },
        { name: 'Glimepiride', dose: '2mg', frequency: 'Once daily (morning)', duration: '3 months' },
        { name: 'Lisinopril', dose: '5mg', frequency: 'Once daily', duration: 'Ongoing' },
      ],
      redFlagSymptoms: ['Blood glucose >300 mg/dL consistently', 'Fever >38.5°C for >2 days', 'Swelling in feet or legs', 'Chest pain or breathlessness', 'Decreased urination'],
      dietaryAdvice: 'Low-carbohydrate diet. Avoid sugar and processed foods. Small frequent meals. Regular blood glucose monitoring at home twice daily.',
      claimDocumentsReady: true,
    },
    {
      id: 'FU-002',
      patientId: 'PT-10202',
      patientName: 'Priya Sharma',
      dischargedOn: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
      diagnosis: 'Post-laparoscopic appendectomy',
      attendingDoctor: 'Dr. Ravi Kumar',
      followUpBooked: false,
      riskLevel: 'Low',
      callbackScheduled: false,
      callbackDone: false,
      dischargeSummary: 'Uncomplicated laparoscopic appendectomy. Patient recovered well. Oral diet tolerated. Wound clean and dry. Discharged on oral antibiotics.',
      medications: [
        { name: 'Amoxicillin-Clavulanate', dose: '625mg', frequency: 'Twice daily', duration: '5 days' },
        { name: 'Ibuprofen', dose: '400mg', frequency: 'TDS after meals', duration: '3 days' },
        { name: 'Pantoprazole', dose: '40mg', frequency: 'Once daily (morning)', duration: '7 days' },
      ],
      redFlagSymptoms: ['Fever >38°C', 'Increasing abdominal pain', 'Wound redness/discharge', 'Inability to eat or drink', 'Vomiting not settling'],
      dietaryAdvice: 'Light, easily digestible food for 1 week. Avoid heavy lifting or strenuous activity for 2 weeks. Keep surgical site dry.',
      claimDocumentsReady: false,
    },
  ],

  bookFollowup: (patientId, date) =>
    set((s) => ({
      patients: s.patients.map(p => p.patientId === patientId ? { ...p, followUpDate: date, followUpBooked: true } : p),
    })),

  scheduleCallback: (patientId) =>
    set((s) => ({
      patients: s.patients.map(p => p.patientId === patientId ? { ...p, callbackScheduled: true } : p),
    })),

  markCallbackDone: (patientId) =>
    set((s) => ({
      patients: s.patients.map(p => p.patientId === patientId ? { ...p, callbackDone: true } : p),
    })),
}))
