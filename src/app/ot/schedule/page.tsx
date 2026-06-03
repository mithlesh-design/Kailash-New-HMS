"use client"

import { useState } from "react"
import { useOTStore } from "@/store/useOTStore"
import { Plus, X, Scissors } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { notifyAndAudit, notifyAndAuditMany } from "@/lib/notifyAndAudit"

const STATUS_COLOR: Record<string, string> = {
  Scheduled:     'bg-slate-100 text-slate-700 border-slate-200',
  'Pre-Op':      'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Recovery:      'bg-purple-50 text-purple-700 border-purple-200',
  Completed:     'bg-green-50 text-green-700 border-green-200',
}

const PROCEDURES_LIST = [
  'Total Knee Replacement (TKR)',
  'Total Hip Replacement (THR)',
  'Laparoscopic Cholecystectomy',
  'Appendicectomy',
  'TURP (Transurethral Resection)',
  'Caesarean Section',
  'Coronary Artery Bypass Graft (CABG)',
  'Cataract Surgery',
  'Hernia Repair',
  'Thyroidectomy',
  'Tonsillectomy',
  'Septoplasty',
]

const SURGEONS = ['Dr. Ravi Kumar', 'Dr. Kiran Joshi', 'Dr. Sanjay Mehta', 'Dr. Priya Menon']
const ANAESTHETISTS = ['Dr. Anisha Sharma', 'Dr. Praveen Bose']
const OT_ROOMS = ['OT-1', 'OT-2', 'OT-3']

const emptyForm = {
  patientName: '', patientId: '', patientAge: '', procedureName: '', surgeon: SURGEONS[0],
  anaesthetist: ANAESTHETISTS[0], otRoom: OT_ROOMS[0], scheduledTime: '09:00',
  durationMinutes: '60', bloodRequired: false, implants: '',
}

export default function OTSchedulePage() {
  const { procedures, scheduleProcedure } = useOTStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const handleAdd = () => {
    if (!form.patientName.trim() || !form.procedureName) {
      toast.error('Patient name and procedure are required')
      return
    }
    scheduleProcedure({
      patientId: form.patientId || `PT-${Date.now()}`,
      patientName: form.patientName,
      patientAge: parseInt(form.patientAge) || 0,
      procedureName: form.procedureName,
      surgeon: form.surgeon,
      anaesthetist: form.anaesthetist,
      otRoom: form.otRoom,
      scheduledTime: form.scheduledTime,
      durationMinutes: parseInt(form.durationMinutes) || 60,
      status: 'Scheduled',
      bloodRequired: form.bloodRequired,
      implants: form.implants ? [form.implants] : [],
    })
    // Notify the surgical team — anaesthetist + nurse (OT staff) + blood bank if blood required.
    notifyAndAuditMany(['ot', 'nurse'], {
      type: 'ot_confirmed', priority: 'high',
      title: `OT scheduled · ${form.procedureName}`,
      body: `${form.patientName} · ${form.procedureName} at ${form.otRoom} on ${form.scheduledTime}. Surgeon: ${form.surgeon}. Anaesthetist: ${form.anaesthetist}.`,
      patientName: form.patientName,
      audit: { action: 'ot_who_checklist', resource: 'ot_procedure', resourceId: form.patientId, detail: `Procedure ${form.procedureName} scheduled for ${form.patientName} at ${form.otRoom}`, userName: 'OT desk' },
    })
    if (form.bloodRequired) {
      notifyAndAudit({
        to: 'blood_bank', type: 'system', priority: 'high',
        title: `Blood reservation requested`,
        body: `${form.patientName} · ${form.procedureName} requires blood. Please reserve units for ${form.scheduledTime}.`,
        patientName: form.patientName,
        audit: { action: 'blood_issue', resource: 'ot_procedure', resourceId: form.patientId, detail: `Blood reservation requested for ${form.procedureName}`, userName: 'OT desk' },
      })
    }
    toast.success('Procedure scheduled · Anaesthetist + OT nurse notified')
    setForm(emptyForm)
    setShowForm(false)
  }

  const sorted = [...procedures].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">OT Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">{procedures.length} procedures today</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-4 w-4 mr-1.5" /> Cancel</> : <><Plus className="h-4 w-4 mr-1.5" /> Add Procedure</>}
        </Button>
      </div>

      {/* Add Procedure Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-5 border-blue-200 bg-blue-50/20">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Schedule New Procedure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Patient Name *</label>
                  <input
                    value={form.patientName}
                    onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Patient ID</label>
                  <input
                    value={form.patientId}
                    onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PT-XXXXX (optional)"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Age</label>
                  <input
                    type="number" value={form.patientAge}
                    onChange={e => setForm(f => ({ ...f, patientAge: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Years"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Procedure *</label>
                  <select
                    value={form.procedureName}
                    onChange={e => setForm(f => ({ ...f, procedureName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select procedure...</option>
                    {PROCEDURES_LIST.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Surgeon</label>
                  <select
                    value={form.surgeon}
                    onChange={e => setForm(f => ({ ...f, surgeon: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SURGEONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Anaesthetist</label>
                  <select
                    value={form.anaesthetist}
                    onChange={e => setForm(f => ({ ...f, anaesthetist: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ANAESTHETISTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">OT Room</label>
                  <select
                    value={form.otRoom}
                    onChange={e => setForm(f => ({ ...f, otRoom: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {OT_ROOMS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Scheduled Time</label>
                  <input
                    type="time" value={form.scheduledTime}
                    onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration (minutes)</label>
                  <input
                    type="number" value={form.durationMinutes}
                    onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15" step="15"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Implants/Consumables</label>
                  <input
                    value={form.implants}
                    onChange={e => setForm(f => ({ ...f, implants: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Knee implant, mesh"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={form.bloodRequired}
                    onChange={e => setForm(f => ({ ...f, bloodRequired: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Blood required</span>
                </label>
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={handleAdd} className="flex-1">Schedule Procedure</Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Procedure List */}
      <div className="space-y-3">
        {sorted.map((proc, i) => (
          <motion.div key={proc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-center flex-shrink-0 w-14">
                    <p className="text-xl font-bold text-slate-900">{proc.scheduledTime}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{proc.otRoom}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{proc.durationMinutes}m</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-slate-900">{proc.patientName}</p>
                      <NeonBadge variant="muted" className="text-[10px]">{proc.id}</NeonBadge>
                      {proc.bloodRequired && <NeonBadge variant="danger">Blood</NeonBadge>}
                      {proc.implants.length > 0 && <NeonBadge variant="blue">Implants</NeonBadge>}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{proc.procedureName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {proc.surgeon} · {proc.anaesthetist}
                    </p>
                    {proc.checklist.filter(c => c.critical && !c.checked).length > 0 && proc.status !== 'Completed' && (
                      <p className="text-xs font-bold text-amber-600 mt-1">
                        ⚠ {proc.checklist.filter(c => c.critical && !c.checked).length} critical checklist item(s) pending
                      </p>
                    )}
                  </div>
                </div>
                <span className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border flex-shrink-0", STATUS_COLOR[proc.status])}>
                  {proc.status}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
