import { create } from 'zustand'

export type RadiologyScan = {
  id: string
  patientName: string
  patientId?: string
  scanType: 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound'
  bodyPart?: string
  status: 'Scheduled' | 'In Progress' | 'Ready for Review' | 'Reported'
  time: string
  scheduledAt?: string
  expectedTAT?: number
  orderedBy?: string
  priority?: 'Routine' | 'Urgent'
  aiFinding?: string
  reportReady?: boolean
}

interface RadiologyState {
  scansToday: number
  scans: RadiologyScan[]
  addOrderFromDoctor: (order: Omit<RadiologyScan, 'id' | 'status' | 'time'>) => void
  advanceStatus: (id: string) => void
}

const TAT_BY_SCAN: Record<string, number> = {
  'X-Ray': 30,
  'CT Scan': 60,
  'MRI': 120,
  'Ultrasound': 45,
}

const STATUS_FLOW: RadiologyScan['status'][] = ['Scheduled', 'In Progress', 'Ready for Review', 'Reported']

export const useRadiologyStore = create<RadiologyState>((set) => ({
  scansToday: 24,
  scans: [
    {
      id: 'RAD-901',
      patientName: 'Amit Singh',
      patientId: 'PT-10230',
      scanType: 'MRI',
      bodyPart: 'Lumbar Spine',
      status: 'Ready for Review',
      time: '09:00 AM',
      scheduledAt: new Date(Date.now() - 130 * 60000).toISOString(),
      expectedTAT: 120,
      orderedBy: 'Dr. Priya Menon',
      priority: 'Routine',
      aiFinding: 'Potential L4-L5 Herniation',
    },
    {
      id: 'RAD-902',
      patientName: 'Meena Devi',
      patientId: 'PT-10231',
      scanType: 'CT Scan',
      bodyPart: 'Chest',
      status: 'In Progress',
      time: '10:30 AM',
      scheduledAt: new Date(Date.now() - 40 * 60000).toISOString(),
      expectedTAT: 60,
      orderedBy: 'Dr. Vikram Rathore',
      priority: 'Urgent',
    },
    {
      id: 'RAD-903',
      patientName: 'Rahul Verma',
      patientId: 'PT-10232',
      scanType: 'X-Ray',
      bodyPart: 'Chest',
      status: 'Scheduled',
      time: '11:15 AM',
      scheduledAt: new Date(Date.now() - 10 * 60000).toISOString(),
      expectedTAT: 30,
      orderedBy: 'Dr. Priya Menon',
      priority: 'Routine',
    },
  ],

  addOrderFromDoctor: (order) =>
    set((s) => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      return {
        scansToday: s.scansToday + 1,
        scans: [
          ...s.scans,
          {
            ...order,
            id: `RAD-${Date.now()}`,
            status: 'Scheduled',
            time: timeStr,
            scheduledAt: now.toISOString(),
            expectedTAT: TAT_BY_SCAN[order.scanType] ?? 60,
          },
        ],
      }
    }),

  advanceStatus: (id) =>
    set((s) => ({
      scans: s.scans.map((scan) => {
        if (scan.id !== id) return scan
        const idx = STATUS_FLOW.indexOf(scan.status)
        const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]
        return { ...scan, status: next, reportReady: next === 'Reported' }
      }),
    })),
}))
