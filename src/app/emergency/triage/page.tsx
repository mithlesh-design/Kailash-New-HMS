"use client"

import { useState } from "react"
import { useEmergencyStore, type TriagePatient } from "@/store/useEmergencyStore"
import { Ambulance, Plus, Activity, Clock, X, AlertTriangle } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

function maskName(name: string) {
  const parts = name.trim().split(' ')
  return parts.map((p, i) => (i === 0 ? p : p[0] + '.')).join(' ')
}

const SEVERITY_ORDER = { Red: 0, Yellow: 1, Green: 2 }

export default function TriagePage() {
  const { triageQueue, admitPatient, addToTriage } = useEmergencyStore()
  const [filter, setFilter]  = useState<'All' | 'Red' | 'Yellow' | 'Green'>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', chiefComplaint: '', severity: 'Yellow' as TriagePatient['severity'], eta: 'In Waiting', ambulanceId: '' })

  const sorted = [...triageQueue]
    .filter(p => filter === 'All' || p.severity === filter)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const handleAdd = () => {
    if (!form.name.trim() || !form.chiefComplaint.trim()) return
    addToTriage({
      name: form.name,
      chiefComplaint: form.chiefComplaint,
      severity: form.severity,
      eta: form.eta,
      ambulanceId: form.ambulanceId || undefined,
    })
    toast.success(`${form.name} added to triage queue`)
    setForm({ name: '', chiefComplaint: '', severity: 'Yellow', eta: 'In Waiting', ambulanceId: '' })
    setShowAdd(false)
  }

  const SEVERITY_LABEL: Record<TriagePatient['severity'], string> = {
    Red: 'Immediate', Yellow: 'Urgent', Green: 'Minor',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Triage Queue</h1>
          <p className="text-sm text-[#64748B] mt-1">{triageQueue.length} patients · sorted by severity</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer shadow-md"
        >
          <Plus className="h-4 w-4" /> Add Patient
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['All', 'Red', 'Yellow', 'Green'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
              filter === s
                ? s === 'Red' ? 'bg-red-600 text-white' : s === 'Yellow' ? 'bg-amber-500 text-white' : s === 'Green' ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === 'All' ? `All (${triageQueue.length})` : `${s} (${triageQueue.filter(p => p.severity === s).length})`}
          </button>
        ))}
      </div>

      {/* Triage Cards */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Activity className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-base font-semibold">No patients in triage</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.map(patient => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className={`rounded-xl p-5 shadow-sm ${patient.severity === 'Red' ? 'bg-red-50/60' : patient.severity === 'Yellow' ? 'bg-amber-50/60' : 'bg-green-50/60'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 bg-white shadow-sm ${
                        patient.severity === 'Red' ? 'text-red-700' :
                        patient.severity === 'Yellow' ? 'text-amber-700' :
                        'text-green-700'
                      }`}>
                        {patient.severity === 'Red' ? '!' : patient.severity === 'Yellow' ? '~' : '✓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#0F172A]">{maskName(patient.name)}</h3>
                          <NeonBadge variant={patient.severity === 'Red' ? 'danger' : patient.severity === 'Yellow' ? 'warning' : 'success'} dot>
                            {SEVERITY_LABEL[patient.severity]}
                          </NeonBadge>
                        </div>
                        <p className="text-sm text-[#64748B] mt-0.5">{patient.chiefComplaint}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {patient.ambulanceId && (
                            <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                              <Ambulance className="h-3 w-3" /> {patient.ambulanceId}
                            </span>
                          )}
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {patient.eta}
                          </span>
                          <span className="text-xs font-medium text-slate-400">{patient.id}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { admitPatient(patient.id); toast.success(`${maskName(patient.name)} admitted`) }}
                      aria-label={`Admit ${maskName(patient.name)}`}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 text-sm font-bold transition-colors cursor-pointer shadow-sm flex-shrink-0"
                    >
                      Admit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Patient Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-triage-title"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 id="add-triage-title" className="text-lg font-bold text-slate-900">Add Triage Patient</h2>
                <button onClick={() => setShowAdd(false)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="t-name" className="block text-sm font-semibold text-slate-700 mb-1.5">Patient Name *</label>
                  <input id="t-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name or 'Unknown Male'" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label htmlFor="t-complaint" className="block text-sm font-semibold text-slate-700 mb-1.5">Chief Complaint *</label>
                  <input id="t-complaint" value={form.chiefComplaint} onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} placeholder="e.g. Chest pain, RTA, Laceration" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="t-severity" className="block text-sm font-semibold text-slate-700 mb-1.5">Severity</label>
                    <select id="t-severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value as TriagePatient['severity'] }))} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="Red">Red — Immediate</option>
                      <option value="Yellow">Yellow — Urgent</option>
                      <option value="Green">Green — Minor</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="t-eta" className="block text-sm font-semibold text-slate-700 mb-1.5">ETA / Status</label>
                    <select id="t-eta" value={form.eta} onChange={e => setForm(f => ({ ...f, eta: e.target.value }))} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option>In Waiting</option>
                      <option>Arriving in 5 mins</option>
                      <option>Arriving in 10 mins</option>
                      <option>En Route</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="t-amb" className="block text-sm font-semibold text-slate-700 mb-1.5">Ambulance ID (optional)</label>
                  <input id="t-amb" value={form.ambulanceId} onChange={e => setForm(f => ({ ...f, ambulanceId: e.target.value }))} placeholder="e.g. AMB-104" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                <button
                  onClick={handleAdd}
                  disabled={!form.name.trim() || !form.chiefComplaint.trim()}
                  className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Add to Triage
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
