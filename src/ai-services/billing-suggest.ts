import { wrapAiResponse } from '@/lib/ai-helpers'
import type { AiEnvelope } from '@/types/ai'

export interface BillingCodeSuggestion { code: string; description: string; amount: number; justification: string; confidence: number }
export async function suggestBillingCodes(encounter: Record<string, unknown>): Promise<AiEnvelope<BillingCodeSuggestion[]>> {
  await new Promise((r) => setTimeout(r, 400))
  void encounter
  return wrapAiResponse<BillingCodeSuggestion[]>([{ code: 'IPD-MED-001', description: 'Inpatient Medical Management — General Ward', amount: 5500, justification: 'Day rate for general ward', confidence: 0.97 }, { code: 'LAB-CBC-001', description: 'Complete Blood Count', amount: 350, justification: 'Ordered on admission', confidence: 0.99 }, { code: 'PROC-IV-001', description: 'IV Line Insertion and Care', amount: 400, justification: 'IV access documented in nursing notes', confidence: 0.92 }], 0.88, 'Billing codes mapped from clinical documentation and procedure logs.')
}

export type IPDChargeType = 'consultation' | 'lab' | 'radiology' | 'pharmacy' | 'ward' | 'procedure' | 'consumable' | 'nursing' | 'ot'

export interface IPDChargeSuggestion {
  type: IPDChargeType
  description: string
  amount: number
  quantity: number
  source: string
  justification: string
  isNonPayable?: boolean
}

const WARD_TEMPLATES: IPDChargeSuggestion[] = [
  { type: 'ward',        description: 'General Ward Charges',                        amount: 2000, quantity: 1, source: 'Ward',     justification: 'Per diem ward charges based on bed category' },
  { type: 'nursing',     description: 'Nursing Care & Monitoring Charges',           amount: 1500, quantity: 1, source: 'Nursing',  justification: 'Daily nursing rounds, vitals monitoring, documentation' },
  { type: 'consumable',  description: 'Disposable Consumables (IV lines, syringes)', amount: 800,  quantity: 1, source: 'Nursing',  justification: 'Standard single-use consumables during ward stay' },
  { type: 'pharmacy',    description: 'IV Fluid Administration',                     amount: 600,  quantity: 1, source: 'Pharmacy', justification: 'IV maintenance fluids per nursing administration record' },
  { type: 'lab',         description: 'Monitoring Investigations (CBC + Metabolic)', amount: 950,  quantity: 1, source: 'Lab',      justification: 'Routine monitoring investigations during admission' },
  { type: 'consultation',description: 'Attending Physician Ward Visit',              amount: 1500, quantity: 1, source: 'Doctor',   justification: 'Daily ward rounds by attending specialist' },
]

const OT_TEMPLATES: IPDChargeSuggestion[] = [
  { type: 'ot',         description: 'OT Charges — Surgeon Fee',                             amount: 15000, quantity: 1, source: 'OT', justification: 'Standard surgeon fee for the procedure performed' },
  { type: 'ot',         description: 'OT Charges — Anaesthesia Fee',                         amount: 8000,  quantity: 1, source: 'OT', justification: 'Anaesthesiologist charges for intra-op monitoring and anaesthesia' },
  { type: 'ot',         description: 'OT Room & Equipment Charges',                          amount: 5000,  quantity: 1, source: 'OT', justification: 'OT room usage, sterilisation, and equipment overhead' },
  { type: 'consumable', description: 'OT Consumables (sterile drapes, gloves, sutures)',     amount: 3500,  quantity: 1, source: 'OT', justification: 'Disposables consumed during surgical procedure per OT checklist' },
]

export async function generateIPDCharges(
  visitType: string,
  admissionDateISO: string | undefined,
  hasOTProcedure: boolean,
  existingDescriptions: string[],
): Promise<AiEnvelope<IPDChargeSuggestion[]>> {
  await new Promise((r) => setTimeout(r, 1100))

  const daysAdmitted = admissionDateISO
    ? Math.max(1, Math.ceil((Date.now() - new Date(admissionDateISO).getTime()) / (24 * 3600000)))
    : 1

  const existingLower = existingDescriptions.map(d => d.toLowerCase())
  const isAlreadyPresent = (keyword: string) => existingLower.some(d => d.includes(keyword.toLowerCase()))

  const suggestions: IPDChargeSuggestion[] = []

  if (visitType === 'IPD') {
    for (const t of WARD_TEMPLATES) {
      const keyword = t.description.split(' ')[0]
      if (isAlreadyPresent(keyword)) continue
      const isDailyCharge = t.type === 'ward' || t.type === 'nursing'
      suggestions.push({ ...t, quantity: isDailyCharge ? daysAdmitted : 1 })
    }
  }

  if (hasOTProcedure) {
    for (const t of OT_TEMPLATES) {
      const keyword = t.description.split('—')[1]?.trim().split(' ')[0] ?? t.description.split(' ')[0]
      if (isAlreadyPresent(keyword)) continue
      suggestions.push({ ...t })
    }
  }

  const reasoning = `AI analysed ${daysAdmitted} day(s) of ward records${hasOTProcedure ? ' and OT procedure data' : ''}. Suggested charges are based on standard care protocols — review quantities and amounts before adding to bill.`

  return wrapAiResponse<IPDChargeSuggestion[]>(suggestions, 0.89, reasoning)
}
