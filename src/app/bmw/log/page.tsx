"use client"

import { useBMWStore } from "@/store/useBMWStore"
import { Badge } from "@/components/ui/badge"

export default function BMWLog() {
  const { wasteLogs, updateLog } = useBMWStore()
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Disposal Log</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Date', 'Ward', 'Category', 'Weight', 'Bags', 'Manifest #', 'Status', 'Action'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {wasteLogs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{l.date}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{l.ward}</td>
                <td className="px-4 py-3">
                  <Badge variant={l.category === 'Yellow' ? 'warning' : l.category === 'Red' ? 'danger' : 'primary'}>{l.category}</Badge>
                </td>
                <td className="px-4 py-3">{l.weightKg}kg</td>
                <td className="px-4 py-3">{l.bagCount}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{l.manifestNumber ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={l.status === 'disposed' ? 'success' : l.status === 'pending' ? 'warning' : 'primary'}>{l.status.toUpperCase()}</Badge>
                </td>
                <td className="px-4 py-3">
                  {l.status === 'collected' && (
                    <button onClick={() => updateLog(l.id, { status: 'treated', treatedAt: new Date().toISOString() })} className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg">Mark Treated</button>
                  )}
                  {l.status === 'treated' && (
                    <button onClick={() => updateLog(l.id, { status: 'disposed', disposedAt: new Date().toISOString(), manifestNumber: `MF-${Date.now()}` })} className="text-xs px-2 py-1 bg-green-600 text-white rounded-lg">Mark Disposed</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
