import { create } from 'zustand'

export type InsuranceClaimStatus = 'Pending Pre-Auth' | 'Approved' | 'Rejected' | 'In Process'
export type SubmissionStatus = 'not_submitted' | 'validating' | 'validated' | 'submitted' | 'acknowledged'

export type AiValidationFlag = {
  field: string
  severity: 'ok' | 'warning' | 'error'
  message: string
}

export type AiClaimValidation = {
  completeness: number // 0–100
  flags: AiValidationFlag[]
  canSubmit: boolean
  validatedAt: string
}

export type InsuranceClaim = {
  id: string
  patientName: string
  provider: string
  amount: number
  status: InsuranceClaimStatus
  aiProbability?: number
  submissionStatus: SubmissionStatus
  aiValidation?: AiClaimValidation
  submittedAt?: string
  tpaReferenceId?: string
}

interface InsuranceState {
  totalClaimsValue: number
  pendingApprovals: number
  claims: InsuranceClaim[]
  setValidation: (claimId: string, validation: AiClaimValidation) => void
  setSubmissionStatus: (claimId: string, status: SubmissionStatus, tpaRef?: string) => void
}

export const useInsuranceStore = create<InsuranceState>((set) => ({
  totalClaimsValue: 1250000,
  pendingApprovals: 8,
  claims: [
    {
      id: 'CLM-001', patientName: 'Aarav Sharma', provider: 'HDFC Ergo', amount: 45000,
      status: 'In Process', aiProbability: 98, submissionStatus: 'not_submitted',
    },
    {
      id: 'CLM-002', patientName: 'Meena Devi', provider: 'Star Health', amount: 120000,
      status: 'Pending Pre-Auth', aiProbability: 45, submissionStatus: 'not_submitted',
    },
    {
      id: 'CLM-003', patientName: 'Rahul Verma', provider: 'ICICI Lombard', amount: 35000,
      status: 'Approved', aiProbability: 99, submissionStatus: 'submitted', tpaReferenceId: 'ICICI-2026-78432',
    },
  ],

  setValidation: (claimId, validation) =>
    set((s) => ({
      claims: s.claims.map(c =>
        c.id === claimId ? { ...c, aiValidation: validation, submissionStatus: 'validated' } : c
      ),
    })),

  setSubmissionStatus: (claimId, status, tpaRef) =>
    set((s) => ({
      claims: s.claims.map(c =>
        c.id === claimId
          ? { ...c, submissionStatus: status, submittedAt: status === 'submitted' ? new Date().toISOString() : c.submittedAt, tpaReferenceId: tpaRef ?? c.tpaReferenceId }
          : c
      ),
    })),
}))
