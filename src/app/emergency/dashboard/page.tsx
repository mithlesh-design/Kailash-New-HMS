"use client"

import { useState } from "react"
import { useEmergencyStore, type TriagePatient } from "@/store/useEmergencyStore"
import { Activity, AlertTriangle, Ambulance, Clock, Users, X, Bed } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

function maskName(name: string): string {
  const parts = name.trim().split(' ')
  return parts.map((p, i) => i === 0 ? p : p[0] + '.').join(' ')
}

function AdmitModal({ patient, onClose, onConfirm }: {
  patient: TriagePatient
  onClose: () => void
  onConfirm: () => void
}) {
  const [ward, setWard] = useState('General Ward')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admit-modal-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="admit-modal-title" className="text-base font-bold text-slate-900">Admit Patient</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
          <p className="text-sm font-bold text-slate-900">{patient.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{patient.chiefComplaint}</p>
          <div className="mt-2">
            <NeonBadge variant={patient.severity === 'Red' ? 'danger' : patient.severity === 'Yellow' ? 'warning' : 'success'}>
              {patient.severity} Priority
            </NeonBadge>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="admit-ward" className="block text-sm font-semibold text-slate-700 mb-1.5">
            <Bed className="h-4 w-4 inline mr-1" /> Admit to Ward
          </label>
          <select
            id="admit-ward"
            value={ward}
            onChange={e => setWard(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {['Emergency Ward', 'General Ward', 'ICU', 'Trauma Bay', 'Observation'].map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            Confirm Admit to {ward}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function EmergencyDashboard() {
  const { activeTraumas, codeBlueCount, triageQueue, admitPatient } = useEmergencyStore()
  const [admittingPatient, setAdmittingPatient] = useState<TriagePatient | null>(null)

  const avgWaitMins = triageQueue.length === 0
    ? 0
    : Math.round(triageQueue.filter(p => p.eta === 'In Waiting').length * 6 + triageQueue.filter(p => p.ambulanceId).length * 8)

  const handleAdmit = () => {
    if (!admittingPatient) return
    admitPatient(admittingPatient.id)
    toast.success(`${admittingPatient.name} admitted successfully`)
    setAdmittingPatient(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Emergency Command Center</h1>
          <p className="text-sm text-[#64748B]">Live triage and trauma tracking</p>
        </div>
        <NeonBadge
          variant={codeBlueCount > 0 ? 'danger' : 'muted'}
          className={codeBlueCount > 0 ? 'animate-pulse' : ''}
          aria-live="polite"
          aria-atomic="true"
        >
          Code Blue Active: {codeBlueCount}
        </NeonBadge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Traumas', value: activeTraumas,        icon: Activity,  cardBg: 'bg-red-50/80',    ib: 'text-red-600',    lb: 'text-red-800/60' },
          { label: 'In Triage',      value: triageQueue.length,   icon: Users,     cardBg: 'bg-amber-50/80',  ib: 'text-amber-600',  lb: 'text-amber-800/60' },
          { label: 'Inbound EMS',    value: triageQueue.filter(p => p.ambulanceId).length, icon: Ambulance, cardBg: 'bg-blue-50/80', ib: 'text-blue-600', lb: 'text-blue-800/60' },
          { label: 'Avg Wait',       value: `${avgWaitMins} min`, icon: Clock,     cardBg: 'bg-green-50/80',  ib: 'text-green-600',  lb: 'text-green-800/60' },
        ].map(({ label, value, icon: Icon, cardBg, ib, lb }) => (
          <div key={label} className={`rounded-xl ${cardBg} p-4 flex items-center gap-4`}>
            <div className="p-3 rounded-xl bg-white shadow-sm flex-shrink-0">
              <Icon className={`h-5 w-5 ${ib}`} aria-hidden="true" />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${lb}`}>{label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Triage Board */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-3">Live Triage Board</h2>
        <Card className="overflow-hidden border-slate-200">
          {triageQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Activity className="h-8 w-8 mb-3" />
              <p className="text-sm font-semibold">No active triage patients</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm" role="table">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Chief Complaint</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">ETA / Status</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {triageQueue
                    .sort((a, b) => {
                      const order = { Red: 0, Yellow: 1, Green: 2 }
                      return order[a.severity] - order[b.severity]
                    })
                    .map(patient => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <NeonBadge
                            variant={patient.severity === 'Red' ? 'danger' : patient.severity === 'Yellow' ? 'warning' : 'success'}
                            dot
                          >
                            {patient.severity === 'Red' ? 'Immediate' : patient.severity === 'Yellow' ? 'Urgent' : 'Minor'}
                          </NeonBadge>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#0F172A]">{maskName(patient.name)}</p>
                          <p className="text-xs text-[#64748B]">{patient.id}</p>
                        </td>
                        <td className="px-5 py-4 text-[#0F172A] font-medium">
                          {patient.chiefComplaint}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {patient.ambulanceId && <Ambulance className="h-4 w-4 text-[#3B82F6]" aria-hidden="true" />}
                            <span className="text-[#64748B] text-sm">{patient.eta ?? 'In Waiting'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setAdmittingPatient(patient)}
                            aria-label={`Admit ${maskName(patient.name)}`}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-red-100"
                          >
                            Admit
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Admit Modal */}
      <AnimatePresence>
        {admittingPatient && (
          <AdmitModal
            patient={admittingPatient}
            onClose={() => setAdmittingPatient(null)}
            onConfirm={handleAdmit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
