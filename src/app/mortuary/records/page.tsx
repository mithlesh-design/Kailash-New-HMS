"use client"

import { useMortuaryStore } from "@/store/useMortuaryStore"
import { Badge } from "@/components/ui/badge"

export default function MortuaryRecords() {
  const { records } = useMortuaryStore()
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Deceased Records</h2>
      <div className="space-y-3">
        {records.map((r) => (
          <div key={r.id} className={`bg-white rounded-xl border p-4 ${r.isMLC ? 'border-red-200' : 'border-slate-200'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-slate-400">Name</p><p className="font-bold text-slate-900">{r.patientName}</p></div>
              <div><p className="text-xs text-slate-400">Age/Gender</p><p className="font-semibold">{r.age}Y / {r.gender}</p></div>
              <div><p className="text-xs text-slate-400">Cause of Death</p><p className="font-semibold">{r.causeOfDeath}</p></div>
              <div><p className="text-xs text-slate-400">Legal Status</p><Badge variant={r.legalClearance === 'cleared' ? 'success' : r.legalClearance === 'mlc' ? 'danger' : 'warning'}>{r.legalClearance.toUpperCase()}</Badge></div>
              <div><p className="text-xs text-slate-400">Time of Death</p><p className="font-semibold text-sm">{new Date(r.timeOfDeath).toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-400">Certified by</p><p className="font-semibold">{r.certifiedBy}</p></div>
              <div><p className="text-xs text-slate-400">Slot</p><p className="font-semibold">{r.bodySlot}</p></div>
              {r.deathCertificateNumber && <div><p className="text-xs text-slate-400">Death Cert.</p><p className="font-semibold text-xs">{r.deathCertificateNumber}</p></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
