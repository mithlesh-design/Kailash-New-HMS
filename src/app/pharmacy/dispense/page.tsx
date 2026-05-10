"use client"

import { useState } from "react"
import { CheckCircle, Package, AlertTriangle } from "lucide-react"
import { isAllergyContraindicated } from "@/rules-engine/allergy-block"
import { checkInteractions } from "@/rules-engine/drug-interactions"
import { toast } from "sonner"

const DISPENSE_QUEUE = [
  { id: 'RX-001', patient: 'Kiran Patil', age: 52, patientId: 'PT-20394', allergies: ['Penicillin', 'Sulfonamides'], prescribedBy: 'Dr. Priya Menon', items: [{ drug: 'Amoxicillin-Clavulanate', dose: '625mg', route: 'Oral', frequency: 'TID', days: 5 }, { drug: 'Paracetamol', dose: '500mg', route: 'Oral', frequency: 'Q6H PRN', days: 5 }] },
  { id: 'RX-002', patient: 'Mohan Lal', age: 60, patientId: 'PT-20398', allergies: [], prescribedBy: 'Dr. Vikram Rathore', items: [{ drug: 'Morphine', dose: '5mg', route: 'IV', frequency: 'Q4H PRN', days: 2 }] },
]

export default function PharmacyDispense() {
  const [dispensed, setDispensed] = useState<string[]>([])

  const handleDispense = (rx: typeof DISPENSE_QUEUE[0]) => {
    const drugs = rx.items.map((i) => i.drug)
    const interactions = checkInteractions(drugs)
    const majorInteraction = interactions.find((i) => i.severity === 'major')
    const allergyBlock = rx.items.find((item) => isAllergyContraindicated(item.drug, rx.allergies).blocked)

    if (allergyBlock) {
      const result = isAllergyContraindicated(allergyBlock.drug, rx.allergies)
      toast.error(`ALLERGY BLOCK: ${allergyBlock.drug} contraindicated — ${result.reaction}`)
      return
    }
    if (majorInteraction) {
      toast.warning(`Drug interaction: ${majorInteraction.drug1} + ${majorInteraction.drug2} — ${majorInteraction.effect}`)
    }
    setDispensed((prev) => [...prev, rx.id])
    toast.success(`${rx.id} dispensed to ${rx.patient}`)
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dispensing Queue</h2>
        <p className="text-slate-500 text-sm mt-1">Allergy and drug interaction rules applied at point of dispense</p>
      </div>

      <div className="space-y-4">
        {DISPENSE_QUEUE.map((rx) => {
          const isDone = dispensed.includes(rx.id)
          const allergyWarnings = rx.items.filter((item) => isAllergyContraindicated(item.drug, rx.allergies).blocked)
          return (
            <div key={rx.id} className={`bg-white rounded-xl border p-4 ${isDone ? 'border-green-200 opacity-60' : allergyWarnings.length > 0 ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{rx.patient}</p>
                    <span className="text-xs text-slate-400">{rx.patientId}</span>
                    {rx.allergies.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> ALLERGIES: {rx.allergies.join(', ')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Prescribed by {rx.prescribedBy}</p>
                  <div className="mt-2 space-y-1">
                    {rx.items.map((item, i) => {
                      const blocked = isAllergyContraindicated(item.drug, rx.allergies).blocked
                      return (
                        <div key={i} className={`flex items-center gap-2 text-sm ${blocked ? 'text-red-600 line-through' : 'text-slate-700'}`}>
                          <Package className="h-3.5 w-3.5 flex-shrink-0" />
                          {item.drug} {item.dose} — {item.route} {item.frequency} × {item.days}d
                          {blocked && <span className="text-[10px] font-bold text-red-600 no-underline">[BLOCKED]</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
                {isDone ? (
                  <div className="flex items-center gap-1 text-green-600 font-semibold text-sm flex-shrink-0">
                    <CheckCircle className="h-5 w-5" /> Dispensed
                  </div>
                ) : (
                  <button
                    onClick={() => handleDispense(rx)}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${allergyWarnings.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {allergyWarnings.length > 0 ? 'Override & Dispense' : 'Dispense'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
