"use client"

import { useState } from "react"
import { useWardStore, type PatientBed, type Vitals } from "@/store/useWardStore"
import { useDischargeStore } from "@/store/useDischargeStore"
import { Activity, AlertCircle, Bed, ClipboardList, Stethoscope, Clock, X, CheckCircle, Pill, Droplets, LogOut } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

type VitalsForm = { hr: string; bp: string; temp: string; spo2: string }

function VitalsModal({ patient, onClose, onSave }: {
  patient: PatientBed
  onClose: () => void
  onSave: (vitals: Vitals) => void
}) {
  const [form, setForm] = useState<VitalsForm>({
    hr:   String(patient.vitals.hr),
    bp:   patient.vitals.bp,
    temp: String(patient.vitals.temp),
    spo2: String(patient.vitals.spo2),
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const hr   = parseInt(form.hr)
    const temp = parseFloat(form.temp)
    const spo2 = parseInt(form.spo2)
    if (isNaN(hr) || isNaN(temp) || isNaN(spo2) || !form.bp.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    onSave({ hr, bp: form.bp, temp, spo2 })
    setSaving(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
        aria-labelledby="vitals-modal-title"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 id="vitals-modal-title" className="text-base font-bold text-slate-900">Update Vitals</h2>
            <p className="text-sm text-slate-500 font-medium">{patient.name} · {patient.bedNumber}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'hr',   label: 'Heart Rate (bpm)',   type: 'number', placeholder: '72' },
            { key: 'bp',   label: 'Blood Pressure',     type: 'text',   placeholder: '120/80' },
            { key: 'temp', label: 'Temperature (°F)',   type: 'number', placeholder: '98.6' },
            { key: 'spo2', label: 'SpO2 (%)',            type: 'number', placeholder: '98' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label htmlFor={`vital-${key}`} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                id={`vital-${key}`}
                type={type}
                placeholder={placeholder}
                value={form[key as keyof VitalsForm]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-50"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function NurseDashboard() {
  const { patients, activeNurses, availableBeds, updateVitals, dismissAlert } = useWardStore()
  const { initDischarge, dischargeQueue } = useDischargeStore()
  const [editingPatient, setEditingPatient] = useState<PatientBed | null>(null)

  const handleMarkForDischarge = (patient: PatientBed) => {
    const alreadyQueued = dischargeQueue.some(d => d.patientId === patient.id)
    if (alreadyQueued) {
      toast.info(`${patient.name} is already in the discharge queue`)
      return
    }
    initDischarge({
      patientId: patient.id,
      patientName: patient.name,
      wardBed: patient.bedNumber,
      diagnosis: 'See medical record',
      admittedOn: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
      expectedDischarge: new Date().toISOString(),
      attendingDoctor: 'Dr. Priya Menon',
      payerType: 'General',
      condition: patient.condition === 'Discharging' ? 'Stable' : patient.condition,
    })
    toast.success(`${patient.name} added to discharge queue`)
  }

  const criticalPatients = patients.filter(p => p.condition === 'Critical')

  const handleSaveVitals = (id: string, vitals: Vitals) => {
    updateVitals(id, vitals)
    toast.success('Vitals updated successfully')
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Patients',  value: patients.length,         icon: Activity,    bg: 'bg-green-50/80',  ib: 'text-green-600',  lb: 'text-green-800/60' },
          { label: 'Critical Alerts',  value: criticalPatients.length, icon: AlertCircle, bg: 'bg-red-50/80',    ib: 'text-red-600',    lb: 'text-red-800/60' },
          { label: 'Available Beds',   value: availableBeds,           icon: Bed,         bg: 'bg-blue-50/80',   ib: 'text-blue-600',   lb: 'text-blue-800/60' },
          { label: 'Nurses on Duty',   value: activeNurses,            icon: Stethoscope, bg: 'bg-sky-50/80',    ib: 'text-sky-600',    lb: 'text-sky-800/60' },
        ].map(({ label, value, icon: Icon, bg, ib, lb }) => (
          <div key={label} className={`rounded-xl ${bg} p-4 flex items-center gap-4`}>
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

      {/* AI Deterioration Alerts */}
      {criticalPatients.filter(p => p.aiAlert).length > 0 && (
        <Card className="p-5 bg-red-50/80 shadow-sm" role="alert" aria-live="polite">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-red-900">AI Deterioration Alerts</h2>
          </div>
          <div className="space-y-3">
            {criticalPatients.filter(p => p.aiAlert).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-red-200">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-bold text-[#0F172A] text-sm">{p.name}</p>
                    <p className="text-xs text-[#64748B]">{p.bedNumber}</p>
                  </div>
                  <NeonBadge variant="danger">{p.aiAlert}</NeonBadge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-red-600">HR: {p.vitals.hr} · BP: {p.vitals.bp}</p>
                    <p className="text-[11px] text-slate-500">Last: {p.lastChecked}</p>
                  </div>
                  <button
                    onClick={() => { dismissAlert(p.id); toast('Alert acknowledged') }}
                    aria-label={`Dismiss alert for ${p.name}`}
                    className="p-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4 text-slate-400 hover:text-green-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ward Overview */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Ward Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map(patient => (
            <Card key={patient.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#0F172A]">{patient.name}</h3>
                    <p className="text-sm font-medium text-[#64748B] flex items-center gap-1 mt-0.5">
                      <Bed className="h-3.5 w-3.5" aria-hidden="true" /> {patient.bedNumber}
                    </p>
                  </div>
                  <NeonBadge
                    variant={patient.condition === 'Critical' ? 'danger' : patient.condition === 'Stable' ? 'success' : 'warning'}
                  >
                    {patient.condition}
                  </NeonBadge>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-3 grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Heart Rate',     value: `${patient.vitals.hr} bpm`,    abnormal: patient.vitals.hr > 100 },
                    { label: 'Blood Pressure', value: patient.vitals.bp,             abnormal: false },
                    { label: 'SpO2',           value: `${patient.vitals.spo2}%`,     abnormal: patient.vitals.spo2 < 95 },
                    { label: 'Temp',           value: `${patient.vitals.temp}°F`,    abnormal: patient.vitals.temp > 100 },
                  ].map(({ label, value, abnormal }) => (
                    <div key={label}>
                      <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">{label}</p>
                      <p className={`font-bold text-sm ${abnormal ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>
                        {value}
                        {abnormal && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">!</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current meds/IV drips */}
              {((patient.currentMedications?.filter(m => m.status === 'Active') ?? []).length > 0 ||
                (patient.ivDrips?.filter(d => d.status === 'Running') ?? []).length > 0) && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {patient.currentMedications?.filter(m => m.status === 'Active').map((med, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50/80 px-2 py-0.5 rounded-full">
                      <Pill className="h-2.5 w-2.5" /> {med.name}
                    </span>
                  ))}
                  {patient.ivDrips?.filter(d => d.status === 'Running').map((drip, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-full">
                      <Droplets className="h-2.5 w-2.5" /> {drip.fluid}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Clock className="h-3 w-3" aria-hidden="true" /> {patient.lastChecked}
                  {(patient.rounds?.length ?? 0) > 0 && (
                    <span className="text-green-600 font-medium">· Rounded</span>
                  )}
                  {!(patient.rounds?.length) && (
                    <span className="text-amber-500 font-medium">· Rounds pending</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMarkForDischarge(patient)}
                    title="Mark for discharge"
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer px-2 py-1 rounded-lg"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Discharge
                  </button>
                  <button
                    onClick={() => setEditingPatient(patient)}
                    className="text-sm font-bold text-[#10B981] hover:text-[#059669] transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-green-50"
                  >
                    Update Vitals
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Vitals Update Modal */}
      <AnimatePresence>
        {editingPatient && (
          <VitalsModal
            patient={editingPatient}
            onClose={() => setEditingPatient(null)}
            onSave={(vitals) => handleSaveVitals(editingPatient.id, vitals)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
