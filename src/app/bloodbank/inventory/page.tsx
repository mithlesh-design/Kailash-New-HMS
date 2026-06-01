"use client"

import { useBloodBankStore } from "@/store/useBloodBankStore"
import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"

export default function BloodBankInventory() {
  const { units } = useBloodBankStore()

  const statusVariant = (s: string): BadgeVariant => {
    if (s === 'available') return 'success'
    if (s === 'reserved') return 'warning'
    if (s === 'issued') return 'primary'
    return 'danger'
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Blood Unit Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">{units.length} total units tracked</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
          <Package className="h-4 w-4" /> Add Unit
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Bag #', 'Blood Group', 'Component', 'Collected', 'Expires', 'Status'].map((h) => (
                <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {units.map((u) => {
              const daysToExpiry = Math.round((new Date(u.expiresOn).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.bagNumber}</td>
                  <td className="px-4 py-3 font-bold text-red-700">{u.bloodGroup}</td>
                  <td className="px-4 py-3 text-slate-700">{u.component}</td>
                  <td className="px-4 py-3 text-slate-500">{u.collectedOn}</td>
                  <td className={`px-4 py-3 font-medium ${daysToExpiry < 7 ? 'text-red-600' : 'text-slate-600'}`}>
                    {u.expiresOn} {daysToExpiry < 7 && <span className="text-[10px] ml-1 bg-red-100 text-red-700 px-1 rounded">⚠ {daysToExpiry}d</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
