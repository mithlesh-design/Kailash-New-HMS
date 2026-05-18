"use client"

import { useAuditStore } from "@/store/useAuditStore"

export default function AuditReports() {
  const { entries } = useAuditStore()
  const hitlRate = entries.length > 0 ? Math.round((entries.filter((e) => e.action.startsWith('hitl_accept')).length / Math.max(1, entries.filter((e) => e.action.startsWith('hitl_')).length)) * 100) : 0

  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Compliance Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-indigo-200 p-5">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">AI Accept Rate</p>
          <p className="text-4xl font-black text-indigo-700 mt-2">{hitlRate}%</p>
          <p className="text-xs text-slate-500 mt-2">Of HITL decisions resulted in acceptance</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Audit Coverage</p>
          <p className="text-4xl font-black text-slate-800 mt-2">{entries.length}</p>
          <p className="text-xs text-slate-500 mt-2">Total events in current session</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-5">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">NABH Readiness</p>
          <p className="text-4xl font-black text-green-700 mt-2">Beta</p>
          <p className="text-xs text-slate-500 mt-2">Audit trail active; full report generation coming</p>
        </div>
      </div>
    </div>
  )
}
