import { wrapAiResponse } from '@/lib/ai-helpers'
import type { AiEnvelope } from '@/types/ai'

export interface DischargeSummary {
  admissionId: string
  patientName: string
  admissionDate: string
  dischargeDate: string
  admittingDiagnosis: string
  dischargeDiagnosis: string
  treatmentSummary: string
  proceduresDone: string[]
  conditionAtDischarge: string
  dischargeMedications: Array<{ name: string; dose: string; duration: string }>
  followUpInstructions: string[]
  followUpDate: string
  warningSymptoms: string[]
  dietAdvice: string
  activityRestrictions: string
}

export async function generateDischargeSummary(admissionId: string): Promise<AiEnvelope<DischargeSummary>> {
  await new Promise((r) => setTimeout(r, 700))
  return wrapAiResponse<DischargeSummary>(
    {
      admissionId,
      patientName: 'Kiran Patil',
      admissionDate: '2026-05-05',
      dischargeDate: '2026-05-09',
      admittingDiagnosis: 'Community Acquired Pneumonia (J18.9)',
      dischargeDiagnosis: 'Resolving Community Acquired Pneumonia with Diabetic Ketoacidosis',
      treatmentSummary: 'Patient admitted with productive cough, fever and SpO2 91%. Treated with IV antibiotics (Piperacillin-Tazobactam 4.5g Q8H × 3 days then step-down to oral Amoxiclav). DKA managed with IV insulin protocol and fluid resuscitation. Oxygen supplementation weaned over 36 hours.',
      proceduresDone: ['Chest X-ray (AP)', 'ABG × 3', 'IV line insertion', 'Nebulisation × 8 sessions'],
      conditionAtDischarge: 'Stable. Afebrile × 48hrs. SpO2 97% RA. Tolerating oral feed. Blood glucose controlled.',
      dischargeMedications: [
        { name: 'Amoxicillin-Clavulanate 625mg', dose: 'TID', duration: '5 days' },
        { name: 'Metformin 500mg', dose: 'BD', duration: 'Ongoing — HOLD if GFR falls' },
        { name: 'Amlodipine 5mg', dose: 'OD', duration: 'Ongoing' },
        { name: 'Salbutamol inhaler', dose: '2 puffs Q6H PRN', duration: '7 days then review' },
      ],
      followUpInstructions: ['Pulmonology OPD in 2 weeks', 'Endocrinology review for HbA1c in 3 months', 'Repeat X-ray chest at 6 weeks'],
      followUpDate: '2026-05-23',
      warningSymptoms: ['Return immediately if fever >38.5°C', 'Worsening breathlessness', 'Inability to take oral medications', 'Blood glucose <70 or >300 mg/dL'],
      dietAdvice: 'Diabetic diet. Limit carbohydrates. Small frequent meals. Avoid sugary drinks.',
      activityRestrictions: 'Avoid strenuous activity for 2 weeks. Bed rest as needed. Graded return to normal activity.',
    },
    0.87,
    'Summary compiled from admission notes, nursing documentation, medication administration records, and lab trends.'
  )
}
