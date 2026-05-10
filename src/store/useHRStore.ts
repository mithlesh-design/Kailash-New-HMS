import { create } from 'zustand'

export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'Off'

export type StaffMember = {
  id: string
  name: string
  role: string
  department: string
  employeeId: string
}

export type ShiftEntry = {
  staffId: string
  date: string
  shift: ShiftType
  present?: boolean
}

export type LeaveRequest = {
  id: string
  staffId: string
  staffName: string
  department: string
  fromDate: string
  toDate: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
  requestedAt: string
}

interface HRState {
  staff: StaffMember[]
  shifts: ShiftEntry[]
  leaveRequests: LeaveRequest[]
  approveLeave: (id: string) => void
  rejectLeave: (id: string) => void
  updateShift: (staffId: string, date: string, shift: ShiftType) => void
}

const MOCK_STAFF: StaffMember[] = [
  { id: 'DR-1012', name: 'Dr. Priya Menon', role: 'Doctor', department: 'General Medicine', employeeId: 'EMP-1012' },
  { id: 'DR-1015', name: 'Dr. Vikram Rathore', role: 'Doctor', department: 'Emergency', employeeId: 'EMP-1015' },
  { id: 'NR-402', name: 'Nurse Anjali Desai', role: 'Nurse', department: 'General Ward', employeeId: 'EMP-0402' },
  { id: 'NR-403', name: 'Nurse Pooja Nair', role: 'Nurse', department: 'ICU', employeeId: 'EMP-0403' },
  { id: 'NR-404', name: 'Nurse Ramesh Rao', role: 'Nurse', department: 'General Ward', employeeId: 'EMP-0404' },
  { id: 'LB-992', name: 'Neha Gupta', role: 'Lab Technician', department: 'Pathology', employeeId: 'EMP-0992' },
  { id: 'RAD-304', name: 'Dr. Sameer Khan', role: 'Radiologist', department: 'Radiology', employeeId: 'EMP-0304' },
  { id: 'PH-301', name: 'Ritu Sharma', role: 'Pharmacist', department: 'Pharmacy', employeeId: 'EMP-0301' },
]

function getDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

const MOCK_SHIFTS: ShiftEntry[] = MOCK_STAFF.flatMap(staff =>
  [-3, -2, -1, 0, 1, 2, 3].map(offset => ({
    staffId: staff.id,
    date: getDateStr(offset),
    shift: (['Morning', 'Morning', 'Evening', 'Night', 'Off', 'Morning', 'Evening'] as ShiftType[])[
      (MOCK_STAFF.indexOf(staff) + offset + 7) % 7
    ],
  }))
)

export const useHRStore = create<HRState>((set) => ({
  staff: MOCK_STAFF,
  shifts: MOCK_SHIFTS,
  leaveRequests: [
    {
      id: 'LV-001',
      staffId: 'NR-404',
      staffName: 'Nurse Ramesh Rao',
      department: 'General Ward',
      fromDate: getDateStr(2),
      toDate: getDateStr(4),
      reason: 'Personal — family function',
      status: 'Pending',
      requestedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'LV-002',
      staffId: 'LB-992',
      staffName: 'Neha Gupta',
      department: 'Pathology',
      fromDate: getDateStr(5),
      toDate: getDateStr(6),
      reason: 'Medical leave',
      status: 'Pending',
      requestedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
  ],

  approveLeave: (id) =>
    set((s) => ({
      leaveRequests: s.leaveRequests.map(l => l.id === id ? { ...l, status: 'Approved' } : l),
    })),

  rejectLeave: (id) =>
    set((s) => ({
      leaveRequests: s.leaveRequests.map(l => l.id === id ? { ...l, status: 'Rejected' } : l),
    })),

  updateShift: (staffId, date, shift) =>
    set((s) => {
      const exists = s.shifts.find(sh => sh.staffId === staffId && sh.date === date)
      if (exists) {
        return { shifts: s.shifts.map(sh => sh.staffId === staffId && sh.date === date ? { ...sh, shift } : sh) }
      }
      return { shifts: [...s.shifts, { staffId, date, shift }] }
    }),
}))
