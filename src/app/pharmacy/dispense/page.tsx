"use client"

import { useState } from "react"
import { CheckCircle, Package, AlertTriangle, Clock, Bed, Sparkles } from "lucide-react"
import { isAllergyContraindicated } from "@/rules-engine/allergy-block"
import { checkInteractions } from "@/rules-engine/drug-interactions"
import { usePharmacyStore } from "@/store/usePharmacyStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const OPD_QUEUE = [
  { id: 'RX-001', patient: 'Kiran Patil', age: 52, patientId: 'PT-20394', allergies: ['Penicillin', 'Sulfonamides'], prescribedBy: 'Dr. Priya Menon', items: [{ drug: 'Amoxicillin-Clavulanate', dose: '625mg', route: 'Oral', frequency: 'TID', days: 5 }, { drug: 'Paracetamol', dose: '500mg', route: 'Oral', frequency: 'Q6H PRN', days: 5 }] },
  { id: 'RX-002', patient: 'Mohan Lal', age: 60, patientId: 'PT-20398', allergies: [], prescribedBy: 'Dr. Vikram Rathore', items: [{ drug: 'Morphine', dose: '5mg', route: 'IV', frequency: 'Q4H PRN', days: 2 }] },
]

export default function PharmacyDispense() {
  const { prescriptions, updateStatus, requestProcurement } = usePharmacyStore()
  const [dispensed, setDispensed] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'opd' | 'ipd'>('opd')

  const ipdDeferred = prescriptions.filter(p => p.procurementStatus === 'deferred_ipd')
  const ipdRequested = prescriptions.filter(p => p.procurementStatus === 'procurement_requested')

  const handleDispense = (rx: typeof OPD_QUEUE[0]) => {
    const drugs = rx.items.map(i => i.drug)
    const interactions = checkInteractions(drugs)
    const majorInteraction = interactions.find(i => i.severity === 'major')
    const allergyBlock = rx.items.find(item => isAllergyContraindicated(item.drug, rx.allergies).blocked)

    if (allergyBlock) {
      const result = isAllergyContraindicated(allergyBlock.drug, rx.allergies)
      toast.error(`ALLERGY BLOCK: ${allergyBlock.drug} contraindicated — ${result.reaction}`)
      return
    }
    if (majorInteraction) {
      toast.warning(`Drug interaction: ${majorInteraction.drug1} + ${majorInteraction.drug2} — ${majorInteraction.effect}`)
    }
    setDispensed(prev => [...prev, rx.id])
    toast.success(`${rx.id} dispensed to ${rx.patient}`)
  }

  const elapsed = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dispensing Queue</h2>
        <p className="text-slate-500 text-sm mt-1">Allergy and drug interaction rules applied at point of dispense</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
        {[
          { key: 'opd', label: 'OPD Queue', count: OPD_QUEUE.filter(r => !dispensed.includes(r.id)).length },
          { key: 'ipd', label: 'IPD Procurement', count: ipdDeferred.length + ipdRequested.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'opd' | 'ipd')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer",
              activeTab === tab.key
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                activeTab === tab.key
                  ? tab.key === 'ipd' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  : 'bg-slate-200 text-slate-500'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'opd' && (
        <div className="space-y-4">
          {OPD_QUEUE.map(rx => {
            const isDone = dispensed.includes(rx.id)
            const allergyWarnings = rx.items.filter(item => isAllergyContraindicated(item.drug, rx.allergies).blocked)
            return (
              <div key={rx.id} className={`bg-white rounded-xl border p-4 ${isDone ? 'border-green-200 opacity-60' : allergyWarnings.length > 0 ? 'border-red-200' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                      className={`flex-shrink-0 px-4 py-2 text-sm font-bold rounded-xl transition-colors cursor-pointer ${allergyWarnings.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {allergyWarnings.length > 0 ? 'Override & Dispense' : 'Dispense'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {OPD_QUEUE.filter(r => !dispensed.includes(r.id)).length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">OPD queue cleared</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ipd' && (
        <div className="space-y-6">
          {/* IPD Procurement Requested — action needed */}
          {ipdRequested.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-slate-900">Procurement Requested by Ward ({ipdRequested.length})</h3>
                <NeonBadge variant="warning" dot pulse>Action needed</NeonBadge>
              </div>
              <div className="space-y-3">
                {ipdRequested.map(rx => (
                  <div key={rx.id} className="bg-white rounded-xl border border-orange-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-900">{rx.patientName}</p>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Bed className="h-3 w-3" />{rx.wardBed}</span>
                          {rx.triageLevel && <NeonBadge variant={rx.triageLevel === 'Critical' ? 'danger' : rx.triageLevel === 'High' ? 'warning' : 'muted'}>{rx.triageLevel}</NeonBadge>}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">Requested by ward · {elapsed(rx.requestedByWardAt!)}</p>
                        <div className="space-y-1">
                          {rx.medicines.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                              <Package className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                              {m.name} — {m.dosage} · {m.frequency} · Qty: {m.quantity}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => { updateStatus(rx.id, 'preparing'); toast.success(`Preparing IPD procurement for ${rx.patientName}`) }}
                        className="flex-shrink-0 px-4 py-2 text-sm font-bold rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
                      >
                        Start Preparing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IPD Deferred — awaiting ward request */}
          {ipdDeferred.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900">Awaiting Ward Request ({ipdDeferred.length})</h3>
                <span className="text-xs text-slate-400 font-medium">Ward nursing staff will trigger procurement when patient is admitted</span>
              </div>
              <div className="space-y-3">
                {ipdDeferred.map(rx => (
                  <div key={rx.id} className="bg-white rounded-xl border border-blue-100 p-4 opacity-75">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-900">{rx.patientName}</p>
                          <span className="flex items-center gap-1 text-xs text-slate-500"><Bed className="h-3 w-3" />{rx.wardBed ?? 'IPD'}</span>
                          {rx.triageLevel && <NeonBadge variant={rx.triageLevel === 'Critical' ? 'danger' : rx.triageLevel === 'High' ? 'warning' : 'muted'}>{rx.triageLevel}</NeonBadge>}
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">IPD — Deferred</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{rx.doctorName} · {elapsed(rx.dispatchedAt)}</p>
                        <div className="space-y-1">
                          {rx.medicines.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <Package className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                              {m.name} — {m.dosage} · {m.frequency}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 flex-shrink-0">Pending ward trigger</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ipdDeferred.length === 0 && ipdRequested.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">No IPD procurement items</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
