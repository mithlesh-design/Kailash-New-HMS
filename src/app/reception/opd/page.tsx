"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, ArrowRight, UserPlus, X, CheckCircle2, Volume2, Clock,
  Activity, Sparkles, Stethoscope, Ambulance,
} from "lucide-react"
import { usePatientStore, type QueueStatus, type TriageLevel } from "@/store/usePatientStore"
import { OPD_ROOMS, doctorsForDept } from "@/lib/opd"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { OcrIntakeCard } from "@/components/reception/OcrIntakeCard"

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

const TRIAGE_RANK: Record<TriageLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
const getTriageTheme = (triage?: string) => {
  switch (triage) {
    case 'Critical': return { variant: 'danger' as const,   bar: 'bg-red-500' }
    case 'High':     return { variant: 'orange' as const,   bar: 'bg-orange-500' }
    case 'Medium':   return { variant: 'warning' as const,  bar: 'bg-amber-400' }
    default:         return { variant: 'success' as const,  bar: 'bg-green-500' }
  }
}

const DEPARTMENTS = Array.from(new Set(OPD_ROOMS.map(r => r.department)))
const TRIAGE_LEVELS: TriageLevel[] = ['Low', 'Medium', 'High', 'Critical']
const firstDoctorOf = (dept: string) => doctorsForDept(dept)[0]?.doctor ?? 'Dr. Priya Nair'

// Lightweight AI triage assist — keyword rules over the chief complaint.
// (Stands in for a model; gives reception an instant suggested priority + dept.)
function suggestTriage(complaint: string): { triage: TriageLevel; department: string; reason: string } | null {
  const c = complaint.toLowerCase().trim()
  if (!c) return null
  const has = (...words: string[]) => words.some(w => c.includes(w))
  if (has('chest pain', 'chest tightness', 'breathless', 'shortness of breath', 'unconscious', 'severe bleeding', 'stroke', 'collapse'))
    return { triage: 'Critical', department: 'Cardiology', reason: 'Possible cardiac/respiratory emergency — see immediately.' }
  if (has('high fever', 'severe pain', 'fracture', 'injury', 'head injury', 'vomiting blood', 'pregnan'))
    return { triage: 'High', department: has('fracture', 'injury') ? 'Orthopaedics' : 'General Medicine', reason: 'Urgent — prioritise for early assessment.' }
  if (has('fever', 'vomit', 'diarrhea', 'loose motion', 'abdominal', 'stomach', 'dizziness'))
    return { triage: 'Medium', department: 'General Medicine', reason: 'Moderate symptoms — standard triage.' }
  if (has('ear', 'throat', 'hearing', 'sinus')) return { triage: 'Low', department: 'ENT', reason: 'ENT complaint — routine.' }
  if (has('rash', 'skin', 'itch', 'acne')) return { triage: 'Low', department: 'Dermatology', reason: 'Skin complaint — routine.' }
  if (has('eye', 'vision', 'blurred')) return { triage: 'Low', department: 'Ophthalmology', reason: 'Eye complaint — routine.' }
  return { triage: 'Low', department: 'General Medicine', reason: 'No red flags detected — routine.' }
}

type WalkInForm = { name: string; phone: string; age: string; gender: 'Male' | 'Female' | 'Other'; symptoms: string; department: string; doctor: string; triage: TriageLevel }
const EMPTY_FORM: WalkInForm = { name: '', phone: '', age: '', gender: 'Male', symptoms: '', department: 'General Medicine', doctor: 'Dr. Priya Nair', triage: 'Low' }

export default function OpdQueuePage() {
  const { patients, updateStatus, addPatient, sendToEmergency } = usePatientStore()
  const [search, setSearch]       = useState("")
  const [filterTriage, setFilter] = useState<string>("All")
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [form, setForm]           = useState<WalkInForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [cleared, setCleared]     = useState<string[]>([])  // completed cards hidden from this board

  const suggestion = suggestTriage(form.symptoms)
  const todayISO = new Date().toISOString().slice(0, 10)

  const filtered = patients.filter(p => {
    const matchToday = (p.registeredDate ?? todayISO) === todayISO  // live board = today's patients only
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    const matchTriage = filterTriage === 'All' || p.triageLevel === filterTriage
    return matchToday && matchSearch && matchTriage
  })

  // Sort by triage priority first, then token — so Critical/High float to the top.
  const getColumn = (status: QueueStatus) =>
    filtered.filter(p => p.queueStatus === status && !(status === 'done' && cleared.includes(p.id)))
      .sort((a, b) => (TRIAGE_RANK[a.triageLevel ?? 'Low'] - TRIAGE_RANK[b.triageLevel ?? 'Low']) || a.token - b.token)

  const handleAdvance = (id: string, currentStatus: QueueStatus) => {
    const next = NEXT_STATUS[currentStatus]
    if (!next) return
    updateStatus(id, next)
    toast.success(`Patient moved to ${COLUMNS.find(c => c.key === next)?.label}`)
  }

  const announce = (token: number, name: string, room?: string) => {
    const msg = `Token number ${token}, ${name}, please proceed${room ? ` to ${room}` : ''}.`
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg))
      }
    } catch { /* speech optional */ }
    toast.success(`Announced token #${token}`, { description: name })
  }

  const handleWalkIn = async () => {
    if (!form.name.trim()) { toast.error('Enter the patient name'); return }
    if (!/^\d{10}$/.test(form.phone.trim())) { toast.error('Enter a valid 10-digit phone number'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    addPatient({
      name: form.name.trim(),
      phone: form.phone.trim(),
      age: parseInt(form.age) || 30,
      gender: form.gender,
      symptoms: form.symptoms ? [form.symptoms.trim()] : [],
      department: form.department,
      doctor: form.doctor,
      triageLevel: form.triage,
    })
    toast.success(`Walk-in registered: ${form.name}`, { description: `${form.triage} · ${form.department} · ${form.doctor}` })
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
                  filterTriage === t ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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

              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-slate-900">{label}</h3>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">{col.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <AnimatePresence>
                  {col.map((p) => {
                    const triage = getTriageTheme(p.triageLevel)
                    const isNow = p.queueStatus === 'consulting'
                    const isDone = p.queueStatus === 'done'
                    const nextLabel = NEXT_LABEL[p.queueStatus]
                    const canAnnounce = p.queueStatus === 'waiting' || p.queueStatus === 'vitals' || p.queueStatus === 'consulting'

                    return (
                      <motion.div
                        layoutId={p.id}
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "bg-white border shadow-sm rounded-xl p-3.5 hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden",
                          isNow ? "border-violet-200" : isDone ? "border-green-200 opacity-70" : "hover:border-slate-300"
                        )}
                      >
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", triage.bar)} />

                        <div className="flex items-start justify-between ml-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center font-bold text-[12px] flex-shrink-0",
                              isNow ? "bg-violet-50 text-violet-700 border border-violet-100" : "bg-slate-50 text-slate-700 border border-slate-100"
                            )}>#{p.token}</div>
                            <div>
                              <p className="text-[14px] font-bold text-slate-900 leading-tight">{p.name}</p>
                              <p className="text-[11px] font-medium text-slate-500">{p.department} • {p.age}y</p>
                            </div>
                          </div>
                          {p.triageLevel && (
                            <NeonBadge variant={triage.variant} className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold">{p.triageLevel}</NeonBadge>
                          )}
                        </div>

                        {p.symptoms.length > 0 && (
                          <p className="text-[12px] font-medium text-slate-500 ml-1.5 line-clamp-1">{p.symptoms.join(', ')}</p>
                        )}

                        {/* Meta: arrival, wait, vitals, doctor */}
                        <div className="ml-1.5 flex items-center gap-x-2.5 gap-y-1 flex-wrap text-[10.5px] font-medium text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.registeredAt}</span>
                          {p.queueStatus === 'waiting' && p.estimatedWait > 0 && <span>~{p.estimatedWait}m wait</span>}
                          {p.vitals
                            ? <span className="flex items-center gap-1 text-green-600 font-semibold"><Activity className="h-3 w-3" /> Vitals done</span>
                            : (p.queueStatus !== 'waiting' && <span className="flex items-center gap-1 text-amber-500 font-semibold"><Activity className="h-3 w-3" /> Vitals pending</span>)}
                          <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" /> {p.doctor.replace('Dr. ', '')}</span>
                        </div>

                        {/* Actions */}
                        <div className="ml-1.5 mt-0.5 flex items-center justify-between">
                          {nextLabel ? (
                            <button onClick={() => handleAdvance(p.id, p.queueStatus)} aria-label={nextLabel}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                              <ArrowRight className="h-3 w-3" aria-hidden="true" /> {nextLabel}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-600"><CheckCircle2 className="h-3 w-3" /> Visit complete</span>
                          )}
                          <div className="flex items-center gap-1">
                            {canAnnounce && (
                              <button onClick={() => { sendToEmergency(p.id); toast.error(`${p.name} sent to Emergency — ER notified`, { description: `${p.triageLevel ?? 'Low'} acuity` }) }}
                                aria-label={`Send ${p.name} to Emergency`} title="Send to Emergency"
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 transition cursor-pointer">
                                <Ambulance className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {canAnnounce && (
                              <button onClick={() => announce(p.token, p.name, isNow ? 'consultation' : undefined)} aria-label={`Announce token ${p.token}`} title="Announce / call token"
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer">
                                <Volume2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {isDone && (
                            <button onClick={() => setCleared(c => [...c, p.id])} className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition cursor-pointer">
                              Clear
                            </button>
                          )}
                        </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWalkIn(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="walkin-title">
              <div className="flex items-center justify-between mb-5">
                <h2 id="walkin-title" className="text-lg font-bold text-slate-900">Register Walk-in Patient</h2>
                <button onClick={() => setShowWalkIn(false)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"><X className="h-4 w-4 text-slate-500" /></button>
              </div>

              <div className="space-y-4">
                {/* M4-W2 — S6: Mock OCR Intake. Scan Aadhaar / insurance / lab
                    paper → 800 ms simulated OCR → prefill form fields. Every
                    field stays editable; the form is the source of truth. */}
                <OcrIntakeCard
                  onApply={(fields, docType) => {
                    setForm((f) => ({
                      ...f,
                      name:       fields.name?.value       ?? f.name,
                      phone:      (fields.phone?.value     ?? f.phone).replace(/\D/g, '').slice(-10),
                      age:        fields.age?.value        ?? f.age,
                      gender:     (fields.gender?.value as WalkInForm['gender']) ?? f.gender,
                    }))
                    toast.success(`Prefilled from ${docType === 'aadhaar' ? 'Aadhaar' : docType === 'insurance' ? 'insurance card' : 'lab paper'}`, { description: 'Review and submit when ready' })
                  }}
                />

                <div>
                  <label htmlFor="wi-name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <Input id="wi-name" placeholder="Patient full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-10 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="wi-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                    <Input id="wi-phone" type="tel" placeholder="10-digit number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-10 rounded-xl" maxLength={10} />
                  </div>
                  <div>
                    <label htmlFor="wi-age" className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                    <Input id="wi-age" type="number" placeholder="Yrs" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="h-10 rounded-xl" min={1} max={120} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as const).map(g => (
                      <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))}
                        className={cn("flex-1 h-10 rounded-xl text-sm font-semibold transition", form.gender === g ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="wi-symptoms" className="block text-sm font-semibold text-slate-700 mb-1.5">Chief Complaint</label>
                  <Input id="wi-symptoms" placeholder="e.g. Chest pain, fever" value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} className="h-10 rounded-xl" />
                </div>

                {/* AI triage suggestion */}
                {suggestion && form.symptoms.trim() && (
                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                    <div className="flex items-center gap-1.5 mb-1"><Sparkles className="h-3.5 w-3.5 text-violet-600" /><span className="text-[12px] font-bold text-violet-900">AI triage suggestion</span></div>
                    <p className="text-[12px] text-violet-800">Suggested <b>{suggestion.triage}</b> priority · <b>{suggestion.department}</b> — {suggestion.reason}</p>
                    {(form.triage !== suggestion.triage || form.department !== suggestion.department) && (
                      <button onClick={() => setForm(f => ({ ...f, triage: suggestion.triage, department: suggestion.department, doctor: firstDoctorOf(suggestion.department) }))}
                        className="mt-2 text-[12px] font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg px-3 py-1.5 transition">Apply suggestion</button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wi-dept" className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                    <select id="wi-dept" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value, doctor: firstDoctorOf(e.target.value) }))}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="wi-doctor" className="block text-sm font-semibold text-slate-700 mb-1.5">OPD doctor / room</label>
                    <select id="wi-doctor" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {doctorsForDept(form.department).length === 0
                        ? <option value="Dr. Priya Nair">Dr. Priya Nair</option>
                        : doctorsForDept(form.department).map(r => <option key={r.doctor} value={r.doctor}>{r.doctor} · {r.room}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="wi-triage" className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                    <select id="wi-triage" value={form.triage} onChange={e => setForm(f => ({ ...f, triage: e.target.value as TriageLevel }))}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {TRIAGE_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowWalkIn(false)} className="flex-1 h-11 rounded-xl cursor-pointer">Cancel</Button>
                <Button onClick={handleWalkIn} disabled={!form.name.trim() || !form.phone.trim() || submitting}
                  className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50">
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
