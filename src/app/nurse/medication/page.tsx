"use client"

import { CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { useState } from "react"

const MAR_ENTRIES = [
  { id: 'MAR-001', patientName: 'Kiran Patil', bed: 'G-12', drug: 'Metformin 500mg', route: 'Oral', time: '08:00', status: 'given', givenBy: 'Anjali Desai', givenAt: '08:05' },
  { id: 'MAR-002', patientName: 'Kiran Patil', bed: 'G-12', drug: 'Amlodipine 5mg', route: 'Oral', time: '08:00', status: 'given', givenBy: 'Anjali Desai', givenAt: '08:05' },
  { id: 'MAR-003', patientName: 'Kiran Patil', bed: 'G-12', drug: 'Amoxiclav 625mg', route: 'Oral', time: '14:00', status: 'due', givenBy: '', givenAt: '' },
  { id: 'MAR-004', patientName: 'Mohan Lal', bed: 'ICU-3', drug: 'Noradrenaline infusion', route: 'IV', time: 'Continuous', status: 'running', givenBy: 'Kavitha Nair', givenAt: 'Ongoing' },
]

type MARStatus = 'given' | 'due' | 'running' | 'withheld'

const STATUS_CONFIG: Record<MARStatus, { color: string; icon: React.ElementType; label: string }> = {
  given:    { color: 'text-green-600 bg-green-50',  icon: CheckCircle,    label: 'Given' },
  due:      { color: 'text-amber-600 bg-amber-50',  icon: Clock,          label: 'Due' },
  running:  { color: 'text-blue-600 bg-blue-50',    icon: Clock,          label: 'Running' },
  withheld: { color: 'text-red-600 bg-red-50',      icon: AlertTriangle,  label: 'Withheld' },
}

export default function MedicationMAR() {
  const [entries, setEntries] = useState(MAR_ENTRIES)

  const markGiven = (id: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: 'given', givenBy: 'Anjali Desai', givenAt: new Date().toLocaleTimeString() } : e))
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Medication Administration Record (MAR)</h2>
        <p className="text-slate-500 text-sm mt-1">5-Rights verification: Patient · Drug · Dose · Route · Time</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 font-semibold flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        Always verify patient identity (name + MRN wristband) before administration
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Patient', 'Bed', 'Drug', 'Route', 'Time', 'Status', 'Given By', 'Action'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((e) => {
              const status = e.status as MARStatus
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.due
              const Icon = cfg.icon
              return (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{e.patientName}</td>
                  <td className="px-4 py-3 text-slate-600">{e.bed}</td>
                  <td className="px-4 py-3 font-medium">{e.drug}</td>
                  <td className="px-4 py-3 text-slate-500">{e.route}</td>
                  <td className="px-4 py-3 text-slate-500">{e.time}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${cfg.color}`}>
                      <Icon className="h-3 w-3" /> {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.givenBy || '—'} {e.givenAt ? `@ ${e.givenAt}` : ''}</td>
                  <td className="px-4 py-3">
                    {e.status === 'due' && (
                      <button onClick={() => markGiven(e.id)} className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Administer
                      </button>
                    )}
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
