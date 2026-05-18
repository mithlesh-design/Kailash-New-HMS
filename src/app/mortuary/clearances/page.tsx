"use client"

import { useMortuaryStore } from "@/store/useMortuaryStore"
import { CheckCircle } from "lucide-react"

export default function MortuaryClearances() {
  const { records, updateRecord } = useMortuaryStore()
  const pending = records.filter((r) => r.legalClearance !== 'released')

  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Legal Clearances</h2>
      <div className="space-y-3">
        {pending.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{r.patientName} — Slot {r.bodySlot}</p>
                <p className="text-xs text-slate-500">{r.causeOfDeath} · {new Date(r.timeOfDeath).toLocaleString()}</p>
                {r.isMLC && <p className="text-xs text-red-600 font-semibold mt-0.5">MLC: {r.mlcNumber} · PS: {r.policeStation}</p>}
                {r.autopsyRequired && !r.autopsyCompletedAt && <p className="text-xs text-amber-600 font-semibold mt-0.5">Autopsy required — pending</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.legalClearance === 'cleared' ? 'bg-green-100 text-green-700' : r.legalClearance === 'mlc' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {r.legalClearance.toUpperCase()}
                </span>
                {r.legalClearance === 'cleared' && (
                  <button
                    onClick={() => updateRecord(r.id, { legalClearance: 'released', releasedAt: new Date().toISOString() })}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Release to Family
                  </button>
                )}
                {r.legalClearance === 'pending' && !r.isMLC && (
                  <button
                    onClick={() => updateRecord(r.id, { legalClearance: 'cleared', deathCertificateNumber: `DC-2026-${Date.now().toString().slice(-4)}` })}
                    className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Issue Death Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
