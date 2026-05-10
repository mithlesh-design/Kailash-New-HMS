import { create } from 'zustand'

export type InsuranceClaim = {
  id: string
  patientName: string
  provider: string
  amount: number
  status: 'Pending Pre-Auth' | 'Approved' | 'Rejected' | 'In Process'
  aiProbability?: number // Probability of approval
}

interface InsuranceState {
  totalClaimsValue: number
  pendingApprovals: number
  claims: InsuranceClaim[]
}

export const useInsuranceStore = create<InsuranceState>(() => ({
  totalClaimsValue: 1250000,
  pendingApprovals: 8,
  claims: [
    { id: 'CLM-001', patientName: 'Aarav Sharma', provider: 'HDFC Ergo', amount: 45000, status: 'In Process', aiProbability: 98 },
    { id: 'CLM-002', patientName: 'Meena Devi', provider: 'Star Health', amount: 120000, status: 'Pending Pre-Auth', aiProbability: 45 },
    { id: 'CLM-003', patientName: 'Rahul Verma', provider: 'ICICI Lombard', amount: 35000, status: 'Approved', aiProbability: 99 },
  ],
}))
