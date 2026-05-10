"use client"

import { useCSSDStore } from "@/store/useCSSDStore"
import { Badge } from "@/components/ui/badge"

export default function CSSDCycles() {
  const { cycles } = useCSSDStore()
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Sterilization Cycle Log</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Batch #', 'Method', 'Started', 'Completed', 'Bio Indicator', 'Chemical Ind.', 'Status'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cycles.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{c.batchNumber}</td>
                <td className="px-4 py-3">{c.method}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(c.startedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-500">{c.completedAt ? new Date(c.completedAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-xs font-semibold">{c.biologicalIndicator === true ? <span className="text-green-700">Pass</span> : c.biologicalIndicator === false ? <span className="text-amber-600">Pending</span> : '—'}</td>
                <td className="px-4 py-3 text-xs font-semibold">{c.chemicalIndicatorPass === true ? <span className="text-green-700">Pass</span> : c.chemicalIndicatorPass === false ? <span className="text-red-600">Fail</span> : '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === 'passed' ? 'success' : c.status === 'failed' ? 'danger' : 'warning'}>
                    {c.status.toUpperCase()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
