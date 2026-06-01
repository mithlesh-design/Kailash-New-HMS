export const ALL_ROLES = [
  // Clinical
  'doctor',
  'nurse',
  'pharmacy',
  'lab',
  'radiology',
  'emergency',
  // Operations
  'reception',
  'bed_manager',
  'discharge',
  // Inpatient Care
  'ot',
  // Finance
  'billing',
  'insurance',
  // Management
  'admin',
  'quality',
  'housekeeping',
  'inventory',
  // Support (7 new)
  'blood_bank',
  'cssd',
  'dietary',
  'bmw',
  'mortuary',
  'ambulance',
  'audit_officer',
  // Patient
  'patient',
] as const

export type Role = (typeof ALL_ROLES)[number]
