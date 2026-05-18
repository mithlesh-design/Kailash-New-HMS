"use client"

import { useBloodBankStore } from "@/store/useBloodBankStore"
import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"

export default function BloodBankRequests() {
  const { crossMatchRequests, updateRequest } = useBloodBankStore()

  const statusVariant = (s: string): BadgeVariant => {
    if (s === 'compatible') return 'success'
    if (s === 'pending') return 'warning'
    if (s === 'issued') return 'primary'
    return 'danger'
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cross-Match Requests</h2>
        <p className="text-slate-500 text-sm mt-1">{crossMatchRequests.length} total requests</p>
      </div>
      <div className="space-y-3">
        {crossMatchRequests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{req.patientName} <span className="text-slate-400 font-normal text-sm">({req.patientId})</span></p>
                <p className="text-sm text-slate-600 mt-0.5">{req.bloodGroup} · {req.component} · {req.units} unit(s)</p>
                <p className="text-xs text-slate-400 mt-1">Requested by {req.requestedBy} · {new Date(req.requestedAt).toLocaleString()}</p>
              </div>
              <Badge variant={statusVariant(req.status)} className="flex-shrink-0">{req.status.toUpperCase()}</Badge>
            </div>
            {req.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateRequest(req.id, { status: 'compatible' })}
                  className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark Compatible
                </button>
                <button
                  onClick={() => updateRequest(req.id, { status: 'incompatible' })}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Mark Incompatible
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
