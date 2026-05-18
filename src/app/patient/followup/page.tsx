"use client"

import { useState } from "react"
import { useFollowupStore } from "@/store/useFollowupStore"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart, Pill, AlertTriangle, Calendar, CheckCircle, Download,
  Phone, ChevronDown, ChevronUp, Utensils, FileText,
  MessageCircle, Smartphone, MonitorSmartphone, Clock, Send,
  UserCheck, UserX, PhoneCall
} from "lucide-react"
import type { PostDischargeEvent } from "@/store/useFollowupStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const EVENT_CHANNEL_ICON: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  sms: Smartphone,
  in_app: MonitorSmartphone,
}

const EVENT_STATUS_CONFIG = {
  scheduled: { color: 'text-slate-500 bg-slate-50 border-slate-200', dot: 'bg-slate-400', label: 'Scheduled' },
  sent:      { color: 'text-blue-700 bg-blue-50 border-blue-200',    dot: 'bg-blue-500',  label: 'Sent' },
  responded: { color: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-500', label: 'Responded' },
  missed:    { color: 'text-red-700 bg-red-50 border-red-200',       dot: 'bg-red-500',   label: 'Missed' },
}

const FREQ_TIMES: Record<string, string[]> = {
  'once daily':     ['08:00'],
  'twice daily':    ['08:00', '20:00'],
  'bd':             ['08:00', '20:00'],
  'tds':            ['08:00', '14:00', '20:00'],
  'tds after meals':['08:00', '14:00', '20:00'],
  'three times':    ['08:00', '14:00', '20:00'],
  'od':             ['08:00'],
  'qid':            ['08:00', '12:00', '18:00', '22:00'],
}

function getMedTimes(frequency: string): string[] {
  const lower = frequency.toLowerCase()
  for (const [key, times] of Object.entries(FREQ_TIMES)) {
    if (lower.includes(key)) return times
  }
  return ['As directed']
}

const RISK_COLOR: Record<string, string> = {
  Low:    'bg-green-50 border-green-200 text-green-700',
  Medium: 'bg-amber-50 border-amber-200 text-amber-700',
  High:   'bg-red-50 border-red-200 text-red-700',
}

const RISK_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  Low: 'success', Medium: 'warning', High: 'danger',
}

const FLAG_GUIDANCE: Record<string, string> = {
  default: 'Monitor closely. If symptoms persist or worsen, contact your care team or visit the hospital.',
  severe: 'This is a medical emergency. Call 102 or go to the nearest emergency room immediately.',
}

export default function FollowUpPage() {
  const { patients, bookFollowup, scheduleCallback } = useFollowupStore()
  const [activePatientId, setActivePatientId] = useState(patients[0]?.patientId ?? '')
  const [followupDate, setFollowupDate] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>('summary')
  const [checkedFlags, setCheckedFlags] = useState<string[]>([])
  const [flagResult, setFlagResult] = useState<string | null>(null)

  const patient = patients.find(p => p.patientId === activePatientId)
  if (!patient) return <div className="p-8 text-center text-slate-400">No post-discharge records found.</div>

  const daysSinceDischarge = Math.floor((Date.now() - new Date(patient.dischargedOn).getTime()) / 86400000)

  const toggleFlag = (flag: string) => {
    setCheckedFlags(prev => {
      const next = prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]
      if (next.length > 0) {
        const hasSevere = next.some(f => f.toLowerCase().includes('chest') || f.toLowerCase().includes('breathless'))
        setFlagResult(hasSevere ? FLAG_GUIDANCE.severe : FLAG_GUIDANCE.default)
      } else {
        setFlagResult(null)
      }
      return next
    })
  }

  const toggle = (s: string) => setExpandedSection(expandedSection === s ? null : s)

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-4">
      {/* Patient selector if multiple */}
      {patients.length > 1 && (
        <div className="flex gap-2">
          {patients.map(p => (
            <button key={p.patientId} onClick={() => setActivePatientId(p.patientId)}
              className={cn("px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-all",
                activePatientId === p.patientId ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}>
              {p.patientName}
            </button>
          ))}
        </div>
      )}

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{patient.patientName}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{patient.diagnosis}</p>
            <p className="text-xs text-slate-400 mt-0.5">Discharged {daysSinceDischarge} day{daysSinceDischarge !== 1 ? 's' : ''} ago · {patient.attendingDoctor}</p>
          </div>
          <NeonBadge variant={RISK_VARIANT[patient.riskLevel]}>{patient.riskLevel} Risk</NeonBadge>
        </div>

        {patient.riskLevel === 'High' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Your care team will call you within 48 hours to check in on your recovery.
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {!patient.followUpBooked && (
            <div className="flex-1 flex gap-2">
              <input
                type="date"
                value={followupDate}
                onChange={e => setFollowupDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={() => {
                if (!followupDate) { toast.error('Select a date'); return }
                bookFollowup(patient.patientId, followupDate)
                toast.success('Follow-up appointment booked')
              }}>
                <Calendar className="h-4 w-4 mr-1.5" /> Book Follow-up
              </Button>
            </div>
          )}
          {patient.followUpBooked && patient.followUpDate && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-800">
                <CheckCircle className="h-4 w-4" />
                Follow-up: {new Date(patient.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border",
                patient.doctorAvailable !== false
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              )}>
                {patient.doctorAvailable !== false
                  ? <><UserCheck className="h-3.5 w-3.5" /> {patient.attendingDoctor} — Available on this date</>
                  : <><UserX className="h-3.5 w-3.5" /> {patient.attendingDoctor} — Not available — please call to reschedule</>
                }
              </div>
            </div>
          )}
          {!patient.callbackScheduled && (
            <Button variant="secondary" onClick={() => { scheduleCallback(patient.patientId); toast.success('Callback scheduled — our team will call you') }}>
              <Phone className="h-4 w-4 mr-1.5" /> Request Callback
            </Button>
          )}
          {patient.callbackScheduled && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-800">
              <Phone className="h-4 w-4" /> Callback scheduled
            </div>
          )}
        </div>
      </div>

      {/* Post-discharge care timeline */}
      {patient.postDischargeEvents.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <Send className="h-5 w-5 text-violet-600" />
            <span className="font-bold text-slate-900 text-sm">Post-Discharge Care Timeline</span>
          </div>
          <div className="divide-y divide-slate-50">
            {patient.postDischargeEvents.map((ev: PostDischargeEvent) => {
              const cfg = EVENT_STATUS_CONFIG[ev.status]
              const ChIcon = EVENT_CHANNEL_ICON[ev.channel] ?? Smartphone
              return (
                <div key={ev.id} className="flex items-start gap-3 px-5 py-3">
                  <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1.5", cfg.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-slate-800">{ev.label}</p>
                      <span className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border", cfg.color)}>
                        <ChIcon className="h-2.5 w-2.5" />
                        {ev.channel === 'whatsapp' ? 'WhatsApp' : ev.channel.toUpperCase()}
                      </span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", cfg.color)}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{new Date(ev.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-slate-500 mt-0.5 italic">"{ev.message}"</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Medicine reminder schedule */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Clock className="h-5 w-5 text-amber-600" />
          <span className="font-bold text-slate-900 text-sm">Medicine Reminder Schedule</span>
        </div>
        <div className="divide-y divide-slate-50">
          {patient.medications.map((med, i) => {
            const times = getMedTimes(med.frequency)
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                  <Pill className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{med.name} {med.dose}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{med.duration}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {times.map(t => (
                    <span key={t} className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sections */}
      {[
        {
          id: 'summary', icon: FileText, label: 'Discharge Summary',
          content: (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{patient.dischargeSummary}</p>
          ),
        },
        {
          id: 'medications', icon: Pill, label: `Medications (${patient.medications.length})`,
          content: (
            <div className="space-y-2">
              {patient.medications.map((med, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Pill className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{med.name} {med.dose}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{med.frequency} · {med.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'redflags', icon: AlertTriangle, label: 'When to Return / Red Flags',
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Check any symptoms you are experiencing right now:</p>
              <div className="space-y-2">
                {patient.redFlagSymptoms.map((flag, i) => (
                  <button
                    key={i}
                    onClick={() => toggleFlag(flag)}
                    className={cn("w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all",
                      checkedFlags.includes(flag) ? "bg-red-50 border-red-300" : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("h-5 w-5 rounded flex items-center justify-center border-2 flex-shrink-0",
                      checkedFlags.includes(flag) ? "bg-red-500 border-red-500" : "border-slate-300"
                    )}>
                      {checkedFlags.includes(flag) && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <span className={cn("text-sm font-medium", checkedFlags.includes(flag) ? "text-red-800" : "text-slate-700")}>
                      {flag}
                    </span>
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {flagResult && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("p-4 rounded-xl border flex items-start gap-3",
                      flagResult === FLAG_GUIDANCE.severe ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-200"
                    )}
                  >
                    <AlertTriangle className={cn("h-5 w-5 flex-shrink-0 mt-0.5", flagResult === FLAG_GUIDANCE.severe ? "text-red-600" : "text-amber-600")} />
                    <p className={cn("text-sm font-semibold", flagResult === FLAG_GUIDANCE.severe ? "text-red-900" : "text-amber-900")}>
                      {flagResult}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ),
        },
        {
          id: 'diet', icon: Utensils, label: 'Diet & Lifestyle',
          content: <p className="text-sm text-slate-700 leading-relaxed">{patient.dietaryAdvice}</p>,
        },
        {
          id: 'documents', icon: Download, label: 'Claim & Reimbursement Documents',
          content: (
            <div>
              {patient.claimDocumentsReady ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Your claim documents are ready for download.
                  </p>
                  {['Discharge Summary', 'Hospital Bills & Receipts', 'Investigation Reports', 'Pharmacy Bills'].map(doc => (
                    <button key={doc} onClick={() => toast.info('Document download coming soon')}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-semibold text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <span>{doc}</span>
                      <Download className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <p className="font-bold mb-1">Documents not yet ready</p>
                  <p>Your discharge documents are being processed. They will be available for download within 24 hours. You will receive an SMS notification.</p>
                </div>
              )}
            </div>
          ),
        },
        {
          id: 'emergency', icon: PhoneCall, label: 'Emergency Contacts',
          content: (
            <div className="space-y-2">
              {[
                { label: 'Kailash Hospital Emergency', number: '1800-XXX-0101', note: 'Available 24/7', color: 'text-red-700 bg-red-50 border-red-200' },
                { label: 'Ambulance', number: '102', note: 'National Emergency', color: 'text-red-700 bg-red-50 border-red-200' },
                { label: 'OPD Appointment Desk', number: '+91 98XXX XXXXX', note: 'Mon–Sat 8am–6pm', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { label: 'Patient Care Helpdesk', number: '+91 98XXX XXXXX', note: 'WhatsApp & Call', color: 'text-green-700 bg-green-50 border-green-200' },
              ].map(({ label: l, number, note, color }) => (
                <div key={l} className={cn("flex items-center justify-between p-3 rounded-xl border", color)}>
                  <div>
                    <p className="text-sm font-bold">{l}</p>
                    <p className="text-xs opacity-70 mt-0.5">{note}</p>
                  </div>
                  <a href={`tel:${number.replace(/\s/g,'')}`} className="font-bold text-sm">{number}</a>
                </div>
              ))}
            </div>
          ),
        },
      ].map(({ id, icon: Icon, label, content }) => (
        <div key={id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggle(id)}
            className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">{label}</span>
            </div>
            {expandedSection === id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>
          <AnimatePresence>
            {expandedSection === id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">{content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
