import { create } from 'zustand'

export type LabSample = {
  id: string
  patientName: string
  patientId?: string
  testName: string
  status: 'Collected' | 'Processing' | 'Analyzing' | 'Completed'
  priority: 'Routine' | 'Urgent'
  orderedBy?: string
  orderedAt?: string
  expectedTAT?: number
  criticalValue?: boolean
  criticalAcknowledgedBy?: string
  aiAnomalyAlert?: string
  result?: string
}

interface LabState {
  pendingTests: number
  samples: LabSample[]
  addOrderFromDoctor: (order: Omit<LabSample, 'id' | 'status'>) => void
  advanceStatus: (id: string) => void
  acknowledgeCritical: (id: string, doctorName: string) => void
}

const TAT_BY_TEST: Record<string, number> = {
  'Complete Blood Count (CBC)': 60,
  'Blood Culture': 120,
  'Lipid Profile': 90,
  'Liver Function Test (LFT)': 90,
  'Renal Function Test (RFT)': 60,
  'HbA1c': 120,
  'Urine Routine/Microscopy': 45,
  'Thyroid Profile (TSH)': 180,
  'CRP / ESR': 60,
  'Blood Glucose (FBS/PPBS)': 30,
}

const STATUS_FLOW: LabSample['status'][] = ['Collected', 'Processing', 'Analyzing', 'Completed']

export const useLabStore = create<LabState>((set) => ({
  pendingTests: 15,
  samples: [
    {
      id: 'LAB-401',
      patientName: 'Aarav Sharma',
      patientId: 'PT-10234',
      testName: 'Complete Blood Count (CBC)',
      status: 'Processing',
      priority: 'Routine',
      orderedBy: 'Dr. Priya Menon',
      orderedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      expectedTAT: 60,
    },
    {
      id: 'LAB-402',
      patientName: 'Sunita Sharma',
      patientId: 'PT-10235',
      testName: 'Blood Culture',
      status: 'Analyzing',
      priority: 'Urgent',
      orderedBy: 'Dr. Vikram Rathore',
      orderedAt: new Date(Date.now() - 100 * 60000).toISOString(),
      expectedTAT: 120,
      criticalValue: true,
      aiAnomalyAlert: 'High WBC count detected',
    },
    {
      id: 'LAB-403',
      patientName: 'Ramesh Kumar',
      patientId: 'PT-10236',
      testName: 'Lipid Profile',
      status: 'Collected',
      priority: 'Routine',
      orderedBy: 'Dr. Priya Menon',
      orderedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      expectedTAT: 90,
    },
  ],

  addOrderFromDoctor: (order) =>
    set((s) => ({
      pendingTests: s.pendingTests + 1,
      samples: [
        ...s.samples,
        {
          ...order,
          id: `LAB-${Date.now()}`,
          status: 'Collected',
          orderedAt: new Date().toISOString(),
          expectedTAT: TAT_BY_TEST[order.testName] ?? 90,
        },
      ],
    })),

  advanceStatus: (id) =>
    set((s) => ({
      samples: s.samples.map((sample) => {
        if (sample.id !== id) return sample
        const idx = STATUS_FLOW.indexOf(sample.status)
        const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]
        return { ...sample, status: next }
      }),
    })),

  acknowledgeCritical: (id, doctorName) =>
    set((s) => ({
      samples: s.samples.map((sample) =>
        sample.id === id ? { ...sample, criticalAcknowledgedBy: doctorName } : sample
      ),
    })),
}))
