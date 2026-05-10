"use client"

import { useAmbulanceStore } from "@/store/useAmbulanceStore"

export default function AmbulanceLog() {
  const { trips } = useAmbulanceStore()
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Trip Log</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Vehicle', 'Type', 'Pickup', 'Destination', 'Dispatched', 'Response Time', 'Status'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{t.vehicleNumber}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.tripType === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{t.tripType.toUpperCase()}</span></td>
                <td className="px-4 py-3 text-slate-600 max-w-32 truncate">{t.pickupLocation}</td>
                <td className="px-4 py-3 text-slate-600 max-w-32 truncate">{t.destination}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(t.dispatchedAt).toLocaleString()}</td>
                <td className="px-4 py-3">{t.responseTimeMinutes !== undefined ? `${t.responseTimeMinutes} min` : '—'}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{t.status.replace('_', ' ').toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
