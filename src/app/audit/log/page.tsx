"use client"

import { useMemo, useState } from "react"
import { Search, Filter, AlertTriangle, ShieldAlert, ChevronDown, ChevronRight, Download } from "lucide-react"
import { useAuditStore, moduleOf, severityOf } from "@/store/useAuditStore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const MODULES = [
  'AI HITL', 'Doctor', 'Nursing', 'Pharmacy', 'Lab', 'Radiology', 'OT', 'Emergency',
  'Reception', 'Insurance', 'Billing', 'Discharge', 'Blood Bank', 'BMW', 'CSSD',
  'Dietary', 'Mortuary', 'Ambulance', 'Housekeeping', 'Admission', 'HR', 'Finance', 'DISHA', 'Quality', 'System',
]
const SEVERITY_TINT: Record<string, string> = {
  info: 'bg-slate-100 text-slate-600',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
}
const MODULE_TINT: Record<string, string> = {
  'AI HITL': 'bg-violet-50 text-violet-700',
  Doctor: 'bg-blue-50 text-blue-700',
  Nursing: 'bg-emerald-50 text-emerald-700',
  Pharmacy: 'bg-pink-50 text-pink-700',
  Lab: 'bg-fuchsia-50 text-fuchsia-700',
  Radiology: 'bg-indigo-50 text-indigo-700',
  OT: 'bg-purple-50 text-purple-700',
  Emergency: 'bg-red-50 text-red-700',
  Insurance: 'bg-teal-50 text-teal-700',
  Billing: 'bg-amber-50 text-amber-700',
  Discharge: 'bg-green-50 text-green-700',
  'Blood Bank': 'bg-rose-50 text-rose-700',
  BMW: 'bg-yellow-50 text-yellow-700',
  CSSD: 'bg-teal-50 text-teal-700',
  Dietary: 'bg-green-50 text-green-700',
  Mortuary: 'bg-slate-200 text-slate-700',
  Ambulance: 'bg-orange-50 text-orange-700',
  Housekeeping: 'bg-violet-50 text-violet-700',
  Admission: 'bg-sky-50 text-sky-700',
  Reception: 'bg-orange-100 text-orange-800',
  HR: 'bg-violet-100 text-violet-800',
  Finance: 'bg-emerald-100 text-emerald-800',
  DISHA: 'bg-rose-100 text-rose-800',
  Quality: 'bg-cyan-50 text-cyan-700',
  System: 'bg-slate-100 text-slate-500',
  Other: 'bg-slate-100 text-slate-500',
}

const timeStr = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function AuditLog() {
  const entries = useAuditStore(s => s.entries)
  const [filter, setFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState<'all' | string>('all')
  const [severity, setSeverity] = useState<'all' | 'info' | 'warning' | 'critical'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const mod = moduleOf(e.action)
      const sev = severityOf(e.action)
      if (moduleFilter !== 'all' && mod !== moduleFilter) return false
      if (severity !== 'all' && sev !== severity) return false
      if (filter) {
        const f = filter.toLowerCase()
        return e.action.toLowerCase().includes(f)
          || e.userName.toLowerCase().includes(f)
          || e.resource.toLowerCase().includes(f)
          || (e.detail ?? '').toLowerCase().includes(f)
          || (e.resourceId ?? '').toLowerCase().includes(f)
      }
      return true
    })
  }, [entries, filter, moduleFilter, severity])

  const totalCounts = useMemo(() => {
    const byModule = new Map<string, number>()
    const bySeverity = { info: 0, warning: 0, critical: 0 }
    for (const e of entries) {
      const m = moduleOf(e.action)
      byModule.set(m, (byModule.get(m) ?? 0) + 1)
      bySeverity[severityOf(e.action)]++
    }
    return { byModule, bySeverity }
  }, [entries])

  const exportJSON = () => {
    const json = JSON.stringify(filtered, null, 2)
    if (typeof window !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    toast.success(`Exported ${filtered.length} audit entries`)
  }

  return (
    <div className="space-y-5 pt-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Full Audit Trail</h2>
          <p className="text-sm text-slate-500 mt-0.5">Cross-module event log · NABH evidence-ready · {entries.length} total events</p>
        </div>
        <button onClick={exportJSON}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl cursor-pointer">
          <Download className="h-3.5 w-3.5" />Export JSON
        </button>
      </div>

      {/* Severity strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Info events</p><p className="text-xl font-bold text-slate-900">{totalCounts.bySeverity.info}</p></div>
        <div className="rounded-xl bg-amber-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Warnings</p><p className="text-xl font-bold text-slate-900">{totalCounts.bySeverity.warning}</p></div>
        <div className="rounded-xl bg-red-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-red-700">Critical</p><p className="text-xl font-bold text-slate-900">{totalCounts.bySeverity.critical}</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="Search action, user, resource, detail…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100" data-testid="audit-severity-filter">
          <Filter className="h-3 w-3 text-slate-400 ml-1" />
          {(['all', 'info', 'warning', 'critical'] as const).map(s => (
            <button key={s} onClick={() => setSeverity(s)}
              data-testid={`audit-severity-chip-${s}`}
              className={cn('px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition capitalize',
                severity === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 flex-wrap" data-testid="audit-module-filter">
          <button onClick={() => setModuleFilter('all')}
            data-testid="audit-module-chip-all"
            className={cn('px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer',
              moduleFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>All modules</button>
          {MODULES.filter(m => (totalCounts.byModule.get(m) ?? 0) > 0).map(m => (
            <button key={m} onClick={() => setModuleFilter(m)}
              data-testid={`audit-module-chip-${m.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn('px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer',
                moduleFilter === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {m} <span className="text-slate-400">{totalCounts.byModule.get(m)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Event list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-slate-400 text-sm">No events match the current filters.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(e => {
              const mod = moduleOf(e.action)
              const sev = severityOf(e.action)
              const open = expanded === e.id
              return (
                <div key={e.id}>
                  <button onClick={() => setExpanded(open ? null : e.id)}
                    className="w-full text-left p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer">
                    <div className="flex flex-col items-center gap-1 w-24 flex-shrink-0">
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', MODULE_TINT[mod] ?? MODULE_TINT.Other)}>{mod}</span>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded uppercase', SEVERITY_TINT[sev])}>{sev}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                        {sev === 'critical' && <ShieldAlert className="h-3.5 w-3.5 text-red-600" />}
                        {sev === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                        <span>{e.action.replace(/_/g, ' ')}</span>
                        <span className="text-[11px] font-bold text-slate-400">{e.resource}{e.resourceId ? ` · ${e.resourceId}` : ''}</span>
                      </p>
                      {e.detail && <p className="text-[12px] text-slate-600 mt-0.5">{e.detail}</p>}
                      <p className="text-[11px] text-slate-400 mt-0.5">by <b>{e.userName}</b> ({e.userId}) · {timeStr(e.timestamp)} · {e.ipStub}</p>
                    </div>
                    {open ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />}
                  </button>
                  {open && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-3 text-[11px] font-mono text-slate-600 overflow-x-auto">
                      <pre>{JSON.stringify({
                        id: e.id,
                        action: e.action,
                        resource: e.resource,
                        resourceId: e.resourceId,
                        actor: { id: e.userId, name: e.userName, ip: e.ipStub },
                        at: e.timestamp,
                        detail: e.detail,
                        before: e.before,
                        after: e.after,
                      }, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
