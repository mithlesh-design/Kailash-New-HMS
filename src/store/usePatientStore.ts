import { create } from 'zustand'

export type QueueStatus = 'waiting' | 'vitals' | 'consulting' | 'pharmacy' | 'billing' | 'done'
export type TriageLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export type FamilyViewableStatus = {
  wardRoom?: string
  journeyStatus?: string
  condition?: 'Stable' | 'Monitoring' | 'Critical' | 'Discharging'
  lastUpdatedAt?: string
  estimatedWaitMinutes?: number
}

export type Patient = {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  bloodGroup: string
  token: number
  queueStatus: QueueStatus
  estimatedWait: number
  doctor: string
  department: string
  vitals?: {
    bp: string
    temp: string
    weight: string
    spo2: string
    pulse: string
  } | null
  symptoms: string[]
  history: string[]
  registeredAt: string
  triageLevel?: TriageLevel
  hasReports?: boolean
  familyAccessToken?: string
  familyPhones?: string[]
  dishaConsentGiven?: boolean
  familyViewableStatus?: FamilyViewableStatus
}

export type Appointment = {
  id: string
  patientId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  status: 'upcoming' | 'confirmed' | 'cancelled'
}

export type Visit = {
  id: string
  patientId: string
  date: string
  doctor: string
  diagnosis: string
  notes: string
  prescriptions: { medicine: string; dosage: string; duration: string }[]
}

interface PatientState {
  patients: Patient[]
  queue: Patient[]
  visits: Visit[]
  appointments: Appointment[]
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient | null) => void
  updateStatus: (id: string, status: QueueStatus) => void
  addPatient: (patient: Partial<Patient> & { name: string; phone: string }) => void
  bookAppointment: (appt: Omit<Appointment, 'id'>) => void
  cancelAppointment: (id: string) => void
  generateFamilyToken: (patientId: string, familyPhones: string[], consentGiven: boolean) => string
  updateFamilyViewableStatus: (patientId: string, status: FamilyViewableStatus) => void
  getPatientByFamilyToken: (token: string) => Patient | undefined
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'PT-20391', name: 'Meera Pillai', age: 34, gender: 'Female', phone: '9876543210', bloodGroup: 'A+', token: 1,
    queueStatus: 'consulting', estimatedWait: 0, doctor: 'Dr. Priya Nair', department: 'General Medicine',
    vitals: { bp: '118/76', temp: '98.4°F', weight: '58 kg', spo2: '99%', pulse: '72 bpm' },
    symptoms: ['Headache for 2 days', 'Mild nausea'], history: ['Migraine history'], registeredAt: '09:10 AM',
    triageLevel: 'Medium',
    familyAccessToken: 'demo-family-token-meera-001',
    familyPhones: ['9876543211'],
    dishaConsentGiven: true,
    familyViewableStatus: {
      wardRoom: 'OPD Room 3',
      journeyStatus: 'In consultation with Dr. Priya Nair',
      condition: 'Stable',
      lastUpdatedAt: new Date().toISOString(),
      estimatedWaitMinutes: 0,
    },
  },
  {
    id: 'PT-20392', name: 'Aarav Sharma', age: 42, gender: 'Male', phone: '9871234560', bloodGroup: 'O+', token: 2,
    queueStatus: 'waiting', estimatedWait: 8, doctor: 'Dr. Priya Nair', department: 'General Medicine',
    vitals: { bp: '120/80', temp: '98.6°F', weight: '75 kg', spo2: '98%', pulse: '80 bpm' },
    symptoms: ['Persistent cough for 3 days', 'Mild fever', 'Fatigue'], history: ['Hypertension (managed)', 'No known drug allergies'], registeredAt: '09:35 AM',
    triageLevel: 'Low',
  },
  {
    id: 'PT-20393', name: 'Sonal Desai', age: 28, gender: 'Female', phone: '9823456780', bloodGroup: 'B+', token: 3,
    queueStatus: 'waiting', estimatedWait: 20, doctor: 'Dr. Priya Nair', department: 'General Medicine',
    vitals: undefined,
    symptoms: ['Stomach pain', 'Loose motions'], history: ['No significant history'], registeredAt: '09:50 AM',
    triageLevel: 'Low',
  },
  {
    id: 'PT-20394', name: 'Kiran Patil', age: 55, gender: 'Male', phone: '9900112233', bloodGroup: 'AB+', token: 4,
    queueStatus: 'waiting', estimatedWait: 35, doctor: 'Dr. Priya Nair', department: 'General Medicine',
    vitals: undefined,
    symptoms: ['Chest tightness', 'Shortness of breath'], history: ['Diabetes Type 2', 'Hypertension'], registeredAt: '10:05 AM',
    triageLevel: 'High',
  },
  {
    id: 'PT-20395', name: 'Nalini Kumar', age: 19, gender: 'Female', phone: '9712345678', bloodGroup: 'O-', token: 5,
    queueStatus: 'vitals', estimatedWait: 12, doctor: 'Dr. Priya Nair', department: 'General Medicine',
    vitals: undefined,
    symptoms: ['Fever', 'Sore throat'], history: ['No known allergies'], registeredAt: '09:55 AM',
    triageLevel: 'Low',
  },
  {
    id: 'PT-20396', name: 'Rakesh Verma', age: 61, gender: 'Male', phone: '9988776655', bloodGroup: 'A-', token: 6,
    queueStatus: 'pharmacy', estimatedWait: 0, doctor: 'Dr. Priya Nair', department: 'General Medicine',
    vitals: { bp: '140/90', temp: '97.8°F', weight: '82 kg', spo2: '97%', pulse: '78 bpm' },
    symptoms: ['Joint pain', 'Swelling in knee'], history: ['Osteoarthritis'], registeredAt: '08:45 AM',
    triageLevel: 'Low',
  },
]

const MOCK_VISITS: Visit[] = [
  {
    id: 'V-001', patientId: 'PT-20392', date: '2026-04-20', doctor: 'Dr. Priya Nair',
    diagnosis: 'Viral Upper Respiratory Tract Infection',
    notes: 'Advised rest and hydration. Follow up in 5 days if not improving.',
    prescriptions: [
      { medicine: 'Paracetamol 500mg', dosage: '1-0-1', duration: '5 days' },
      { medicine: 'Cetirizine 10mg', dosage: '0-0-1', duration: '3 days' },
    ],
  },
  {
    id: 'V-002', patientId: 'PT-20392', date: '2026-03-05', doctor: 'Dr. Priya Nair',
    diagnosis: 'Hypertension Follow-up',
    notes: 'BP controlled. Continue current medication.',
    prescriptions: [
      { medicine: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 days' },
    ],
  },
]

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-001', patientId: 'PT-20391', doctorName: 'Dr. Priya Nair', specialty: 'General Medicine',
    date: new Date().toISOString().slice(0, 10), time: '10:30 AM', status: 'confirmed',
  },
  {
    id: 'APT-002', patientId: 'PT-20391', doctorName: 'Dr. Rohan Mehta', specialty: 'Cardiology',
    date: new Date(Date.now() + 6 * 24 * 3600000).toISOString().slice(0, 10), time: '11:00 AM', status: 'upcoming',
  },
]

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: MOCK_PATIENTS,
  queue: MOCK_PATIENTS.filter(p => ['waiting', 'vitals', 'consulting'].includes(p.queueStatus)),
  visits: MOCK_VISITS,
  appointments: MOCK_APPOINTMENTS,
  selectedPatient: null,

  setSelectedPatient: (patient) => set({ selectedPatient: patient }),

  updateStatus: (id, status) => set((state) => {
    const updated = state.patients.map(p => p.id === id ? { ...p, queueStatus: status } : p)
    return {
      patients: updated,
      queue: updated.filter(p => ['waiting', 'vitals', 'consulting'].includes(p.queueStatus)),
    }
  }),

  bookAppointment: (appt) => set((s) => ({
    appointments: [...s.appointments, { ...appt, id: `APT-${Date.now()}` }],
  })),

  cancelAppointment: (id) => set((s) => ({
    appointments: s.appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a),
  })),

  generateFamilyToken: (patientId, familyPhones, consentGiven) => {
    const token = crypto.randomUUID()
    set(state => ({
      patients: state.patients.map(p =>
        p.id === patientId
          ? { ...p, familyAccessToken: token, familyPhones, dishaConsentGiven: consentGiven, familyViewableStatus: { lastUpdatedAt: new Date().toISOString() } }
          : p
      ),
    }))
    return token
  },

  updateFamilyViewableStatus: (patientId, status) =>
    set(state => ({
      patients: state.patients.map(p =>
        p.id === patientId ? { ...p, familyViewableStatus: { ...status, lastUpdatedAt: new Date().toISOString() } } : p
      ),
    })),

  getPatientByFamilyToken: (token) => {
    return get().patients.find(p => p.familyAccessToken === token)
  },

  addPatient: (partial) => set((state) => {
    const nextToken = Math.max(...state.patients.map(p => p.token), 0) + 1
    const patient: Patient = {
      id: partial.id ?? `PT-${Date.now()}`,
      name: partial.name,
      age: partial.age ?? 30,
      gender: partial.gender ?? 'Male',
      phone: partial.phone,
      bloodGroup: partial.bloodGroup ?? 'A+',
      token: partial.token ?? nextToken,
      queueStatus: 'waiting',
      estimatedWait: partial.estimatedWait ?? nextToken * 4,
      doctor: partial.doctor ?? 'Dr. Priya Nair',
      department: partial.department ?? 'General Medicine',
      vitals: null,
      symptoms: partial.symptoms ?? [],
      history: partial.history ?? [],
      registeredAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      triageLevel: partial.triageLevel ?? 'Low',
      hasReports: partial.hasReports ?? false,
    }
    return {
      patients: [patient, ...state.patients],
      queue: [patient, ...state.queue],
    }
  }),
}))
