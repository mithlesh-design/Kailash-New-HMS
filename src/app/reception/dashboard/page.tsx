"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, ArrowRight, UserPlus, X, CheckCircle2 } from "lucide-react"
import { usePatientStore, type QueueStatus } from "@/store/usePatientStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const COLUMNS: { key: QueueStatus; label: string; color: string }[] = [
  { key: 'waiting',    label: 'Waiting Room',     color: 'border-t-slate-300' },
  { key: 'vitals',     label: 'Triage / Vitals',  color: 'border-t-amber-500' },
  { key: 'consulting', label: 'In Consultation',  color: 'border-t-blue-500' },
  { key: 'pharmacy',   label: 'Pharmacy Queued',  color: 'border-t-green-500' },
  { key: 'billing',    label: 'Billing',          color: 'border-t-amber-500' },
  { key: 'done',       label: 'Completed',        color: 'border-t-green-500' },
]

const NEXT_STATUS: Partial<Record<QueueStatus, QueueStatus>> = {
  waiting: 'vitals', vitals: 'consulting', consulting: 'pharmacy', pharmacy: 'billing', billing: 'done',
}

const NEXT_LABEL: Partial<Record<QueueStatus, string>> = {
  waiting: 'Send to Vitals', vitals: 'Send to Doctor', consulting: 'Send to Pharmacy',
  pharmacy: 'Send to Billing', billing: 'Mark Done',
}

const getTriageTheme = (triage?: string) => {
  switch (triage) {
    case 'Critical': return { variant: 'danger' as const,   bar: 'bg-red-500' }
    case 'High':     return { variant: 'orange' as const,   bar: 'bg-orange-500' }
    case 'Medium':   return { variant: 'warning' as const,  bar: 'bg-amber-400' }
    default:         return { variant: 'success' as const,  bar: 'bg-green-500' }
  }
}

type WalkInForm = { name: string; phone: string; age: string; symptoms: string; department: string }
const EMPTY_FORM: WalkInForm = { name: '', phone: '', age: '', symptoms: '', department: 'General Medicine' }

export default function ReceptionDashboard() {
  const { patients, updateStatus, addPatient } = usePatientStore()
  const [search, setSearch]       = useState("")
  const [filterTriage, setFilter] = useState<string>("All")
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [form, setForm]           = useState<WalkInForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    const matchTriage = filterTriage === 'All' || p.triageLevel === filterTriage
    return matchSearch && matchTriage
  })

  const getColumn = (status: QueueStatus) =>
    filtered.filter(p => p.queueStatus === status).sort((a, b) => a.token - b.token)

  const handleAdvance = (id: string, currentStatus: QueueStatus) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    updateStatus(id, next)
    toast.success(`Patient moved to ${COLUMNS.find(c => c.key === next)?.label}`)
  }

  const handleWalkIn = async () => {
    if (!form.name.trim() || !form.phone.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    addPatient({
      name: form.name.trim(),
      phone: form.phone.trim(),
      age: parseInt(form.age) || 30,
      symptoms: form.symptoms ? [form.symptoms.trim()] : [],
      department: form.department,
    })
    toast.success(`Walk-in registered: ${form.name}`)
    setForm(EMPTY_FORM)
    setShowWalkIn(false)
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input
              placeholder="Search patients by name or ID..."
              aria-label="Search patients"
              className="pl-10 h-10 text-[14px] font-medium shadow-sm border-slate-200 bg-white focus-visible:ring-blue-500 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                  filterTriage === t
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Button
          onClick={() => setShowWalkIn(true)}
          size="lg"
          className="h-10 px-5 gap-2 font-bold shadow-sm hover:shadow-md transition-all rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Register Walk-in
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4 items-start">
        {COLUMNS.map(({ key, label, color }) => {
          const col = getColumn(key)
          return (
            <div key={key} className={cn("flex-1 min-w-[260px] max-w-[320px] flex flex-col bg-[#F1F5F9] rounded-2xl border border-slate-200/60 border-t-4 max-h-full", color)}>

              {/* Column Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-slate-900">{label}</h3>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {col.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <AnimatePresence>
                  {col.map((p) => {
                    const triage = getTriageTheme(p.triageLevel)
                    const isNow = p.queueStatus === 'consulting'
                    const isDone = p.queueStatus === 'done'
                    const nextLabel = NEXT_LABEL[p.queueStatus]

                    return (
                      <motion.div
                        layoutId={p.id}
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "bg-white border shadow-sm rounded-xl p-3.5 hover:shadow-md transition-all flex flex-col gap-2.5 relative overflow-hidden",
                          isNow ? "border-violet-200" : isDone ? "border-green-200 opacity-70" : "hover:border-slate-300"
                        )}
                      >
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", triage.bar)} />

                        <div className="flex items-start justify-between ml-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-[12px] flex-shrink-0",
                              isNow ? "bg-violet-50 text-violet-700 border border-violet-100" : "bg-slate-50 text-slate-700 border border-slate-100"
                            )}>
                              #{p.token}
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-slate-900 leading-tight">{p.name}</p>
                              <p className="text-[11px] font-medium text-slate-500">{p.department} • {p.age}y</p>
                            </div>
                          </div>
                          {p.triageLevel && (
                            <NeonBadge variant={triage.variant} className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                              {p.triageLevel}
                            </NeonBadge>
                          )}
                        </div>

                        {p.symptoms.length > 0 && (
                          <p className="text-[12px] font-medium text-slate-500 ml-1.5 line-clamp-1">
                            {p.symptoms.join(', ')}
                          </p>
                        )}

                        {nextLabel && (
                          <button
                            onClick={() => handleAdvance(p.id, p.queueStatus)}
                            aria-label={nextLabel}
                            className="ml-1.5 mt-1 flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                          >
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            {nextLabel}
                          </button>
                        )}
                        {isDone && (
                          <div className="ml-1.5 flex items-center gap-1.5 text-[11px] font-bold text-green-600">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Visit complete
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {col.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200/80 rounded-xl bg-white/50">
                    <p className="text-[12px] font-semibold text-slate-400">Empty</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Walk-in Modal */}
      <AnimatePresence>
        {showWalkIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWalkIn(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="walkin-title"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 id="walkin-title" className="text-lg font-bold text-slate-900">Register Walk-in Patient</h2>
                <button onClick={() => setShowWalkIn(false)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="walkin-name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <Input id="walkin-name" placeholder="Patient full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-10 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="walkin-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                    <Input id="walkin-phone" type="tel" placeholder="10-digit number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-10 rounded-xl" maxLength={10} />
                  </div>
                  <div>
                    <label htmlFor="walkin-age" className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                    <Input id="walkin-age" type="number" placeholder="Years" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="h-10 rounded-xl" min={1} max={120} />
                  </div>
                </div>
                <div>
                  <label htmlFor="walkin-dept" className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                  <select
                    id="walkin-dept"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['General Medicine', 'Cardiology', 'Orthopaedics', 'Gynaecology', 'ENT', 'Ophthalmology', 'Dermatology', 'Paediatrics'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="walkin-symptoms" className="block text-sm font-semibold text-slate-700 mb-1.5">Chief Complaint</label>
                  <Input id="walkin-symptoms" placeholder="e.g. Fever, headache" value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} className="h-10 rounded-xl" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowWalkIn(false)} className="flex-1 h-11 rounded-xl cursor-pointer">Cancel</Button>
                <Button
                  onClick={handleWalkIn}
                  disabled={!form.name.trim() || !form.phone.trim() || submitting}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register & Add to Queue'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
