"use client"

import { useState } from "react"
import { useAuditStore } from "@/store/useAuditStore"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AuditLog() {
  const { entries } = useAuditStore()
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? entries.filter((e) =>
        e.action.includes(filter) || e.userName.toLowerCase().includes(filter.toLowerCase()) || e.resource.includes(filter)
      )
    : entries

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Full Audit Trail</h2>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by action, user, resource..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Timestamp', 'User', 'Action', 'Resource', 'Detail'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No audit events recorded. Events are captured as users interact with clinical features.</td></tr>
            ) : filtered.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{entry.userName}</td>
                <td className="px-4 py-3">
                  <Badge variant={entry.action.startsWith('hitl') ? 'primary' : entry.action.startsWith('ai_feedback') ? 'purple' : 'default'}>
                    {entry.action.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{entry.resource}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-48 truncate">{entry.detail ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
