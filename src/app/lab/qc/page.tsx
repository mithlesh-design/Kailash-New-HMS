"use client"

import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

type QCStatus = 'pass' | 'fail' | 'warning'

const QC_LOG = [
  { id: 'QC-001', analyzer: 'Beckman Coulter AU680', test: 'Glucose', level: 'Level 1', targetMean: 5.0, measured: 5.1, sdRange: 0.3, cv: 2.1, status: 'pass' as QCStatus, runAt: '2026-05-09T07:00:00Z', operator: 'Neha Gupta' },
  { id: 'QC-002', analyzer: 'Beckman Coulter AU680', test: 'Creatinine', level: 'Level 2', targetMean: 2.0, measured: 2.4, sdRange: 0.2, cv: 9.5, status: 'fail' as QCStatus, runAt: '2026-05-09T07:05:00Z', operator: 'Neha Gupta' },
  { id: 'QC-003', analyzer: 'Sysmex XN-1000', test: 'Haemoglobin', level: 'Level 1', targetMean: 12.0, measured: 12.1, sdRange: 0.4, cv: 1.9, status: 'pass' as QCStatus, runAt: '2026-05-09T07:10:00Z', operator: 'Neha Gupta' },
  { id: 'QC-004', analyzer: 'Sysmex XN-1000', test: 'WBC', level: 'Level 2', targetMean: 10.0, measured: 10.6, sdRange: 0.8, cv: 5.8, status: 'warning' as QCStatus, runAt: '2026-05-09T07:12:00Z', operator: 'Neha Gupta' },
]

const STATUS_CONFIG: Record<QCStatus, { icon: React.ElementType; color: string; bg: string }> = {
  pass:    { icon: CheckCircle,  color: 'text-green-700',  bg: 'bg-green-100' },
  fail:    { icon: XCircle,      color: 'text-red-700',    bg: 'bg-red-100' },
  warning: { icon: AlertTriangle,color: 'text-amber-700',  bg: 'bg-amber-100' },
}

export default function LabQC() {
  const [entries] = useState(QC_LOG)
  const failures = entries.filter((e) => e.status === 'fail').length
  const warnings = entries.filter((e) => e.status === 'warning').length

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quality Control</h2>
        <p className="text-slate-500 text-sm mt-1">Daily QC runs — Westgard rules applied</p>
      </div>

      {failures > 0 && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 font-semibold">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          {failures} QC failure(s) detected — do not release patient results until resolved
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Pass</p>
          <p className="text-3xl font-black text-green-700 mt-1">{entries.filter((e) => e.status === 'pass').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 text-center">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Warning</p>
          <p className="text-3xl font-black text-amber-700 mt-1">{warnings}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 text-center">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Fail</p>
          <p className="text-3xl font-black text-red-600 mt-1">{failures}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Analyzer', 'Test', 'Level', 'Target', 'Measured', 'CV%', 'Status', 'Operator'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((e) => {
              const cfg = STATUS_CONFIG[e.status]
              const Icon = cfg.icon
              return (
                <tr key={e.id} className={`hover:bg-slate-50 ${e.status === 'fail' ? 'bg-red-50' : e.status === 'warning' ? 'bg-amber-50' : ''}`}>
                  <td className="px-4 py-3 text-xs text-slate-600">{e.analyzer}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{e.test}</td>
                  <td className="px-4 py-3 text-slate-500">{e.level}</td>
                  <td className="px-4 py-3">{e.targetMean} ±{e.sdRange}</td>
                  <td className="px-4 py-3 font-semibold">{e.measured}</td>
                  <td className={`px-4 py-3 font-bold ${e.cv > 5 ? 'text-red-600' : e.cv > 3 ? 'text-amber-600' : 'text-green-600'}`}>{e.cv}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      <Icon className="h-3 w-3" /> {e.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.operator}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
