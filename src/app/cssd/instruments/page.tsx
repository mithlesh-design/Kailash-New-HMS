"use client"

import { useCSSDStore } from "@/store/useCSSDStore"
import { Badge } from "@/components/ui/badge"

export default function CSSDInstruments() {
  const { instruments } = useCSSDStore()
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Instrument Tracking</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {instruments.map((ins) => (
          <div key={ins.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{ins.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ins.category}</p>
              </div>
              <Badge variant={ins.status === 'ready' ? 'success' : ins.status === 'in_use' ? 'primary' : ins.status === 'sterilizing' ? 'warning' : 'danger'}>
                {ins.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p>Quantity: <span className="font-semibold">{ins.quantity}</span></p>
              {ins.lastSterilizedAt && <p>Last Sterilized: <span className="font-semibold">{new Date(ins.lastSterilizedAt).toLocaleString()}</span></p>}
              {ins.assignedOT && <p>Assigned to: <span className="font-semibold text-blue-600">{ins.assignedOT}</span></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
