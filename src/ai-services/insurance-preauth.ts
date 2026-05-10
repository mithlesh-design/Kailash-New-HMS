import { wrapAiResponse } from '@/lib/ai-helpers'
import type { AiEnvelope } from '@/types/ai'

export interface PreAuthDraft {
  admissionId: string
  insurerId: string
  policyNumber: string
  diagnosisCodes: string[]
  plannedProcedures: string[]
  estimatedCost: number
  requestedAmount: number
  clinicalJustification: string
  attachmentsRequired: string[]
}

export async function draftPreAuth(admissionId: string): Promise<AiEnvelope<PreAuthDraft>> {
  await new Promise((r) => setTimeout(r, 500))
  return wrapAiResponse<PreAuthDraft>(
    { admissionId, insurerId: 'INS-STAR-001', policyNumber: 'SHI-2026-445892', diagnosisCodes: ['J18.9', 'E11'], plannedProcedures: ['Chest X-ray', 'CBC', 'Blood Culture', 'IV Antibiotic Therapy'], estimatedCost: 42500, requestedAmount: 38000, clinicalJustification: 'Patient admitted with community acquired pneumonia requiring IV antibiotics, oxygen therapy and continuous monitoring due to SpO2 <92% and WBC >18,000.', attachmentsRequired: ['Admission summary', 'Lab reports', 'Chest X-ray report', 'Treating doctor letter'] },
    0.83,
    'Pre-auth draft generated from admission data, ICD codes, and insurer policy matrix.'
  )
}
