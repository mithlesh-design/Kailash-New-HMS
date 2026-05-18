"use client"

import { useState, useEffect } from "react"
import { useLabStore } from "@/store/useLabStore"
import { FlaskConical, AlertCircle, CheckCircle, Clock, ChevronDown, Timer, AlertTriangle, X } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const STATUS_ORDER = ['Collected', 'Processing', 'Analyzing', 'Completed'] as const
const STATUS_NEXT: Partial<Record<string, string>> = {
  Collected: 'Processing', Processing: 'Analyzing', Analyzing: 'Completed',
}
const STATUS_COLOR: Record<string, string> = {
  Collected:  'bg-slate-100 text-slate-700 border-slate-200',
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Analyzing:  'bg-amber-50 text-amber-700 border-amber-200',
  Completed:  'bg-green-50 text-green-700 border-green-200',
}

function TATTimer({ orderedAt, expectedTAT, status }: { orderedAt?: string; expectedTAT?: number; status: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!orderedAt || status === 'Completed') return
    const update = () => setElapsed(Math.floor((Date.now() - new Date(orderedAt).getTime()) / 60000))
    update()
    const iv = setInterval(update, 30000)
    return () => clearInterval(iv)
  }, [orderedAt, status])

  if (!orderedAt || !expectedTAT || status === 'Completed') return null

  const pct = Math.min((elapsed / expectedTAT) * 100, 100)
  const overdue = elapsed > expectedTAT
  const remaining = expectedTAT - elapsed

  return (
    <div className={cn("flex items-center gap-2 mt-2 text-xs font-semibold", overdue ? "text-red-600" : "text-slate-500")}>
      <Timer className="h-3.5 w-3.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span>{overdue ? `Overdue by ${elapsed - expectedTAT}m` : `${remaining}m remaining`}</span>
          <span>{elapsed}m / {expectedTAT}m</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", overdue ? "bg-red-500" : pct > 80 ? "bg-orange-400" : "bg-blue-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function CriticalModal({ sampleId, sampleName, onAcknowledge }: { sampleId: string; sampleName: string; onAcknowledge: (doctor: string) => void }) {
  const [doctor, setDoctor] = useState("")
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Critical Value Alert</h3>
            <p className="text-sm text-slate-500">{sampleId} — {sampleName}</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          This sample has a critical result that requires immediate physician acknowledgement before proceeding.
        </p>
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Notified Doctor</label>
          <select
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select doctor...</option>
            <option>Dr. Priya Menon</option>
            <option>Dr. Vikram Rathore</option>
            <option>Dr. Ravi Kumar</option>
          </select>
        </div>
        <Button
          onClick={() => { if (!doctor) return; onAcknowledge(doctor) }}
          variant="danger"
          className="w-full"
        >
          Acknowledge & Notify Doctor
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default function LabSamplesPage() {
  const { samples, advanceStatus, acknowledgeCritical } = useLabStore()
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'Overdue' | string>('All')
  const [criticalModal, setCriticalModal] = useState<{ id: string; name: string } | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(iv)
  }, [])

  const getElapsed = (orderedAt?: string) =>
    orderedAt ? Math.floor((now - new Date(orderedAt).getTime()) / 60000) : 0

  const isOverdue = (s: typeof samples[number]) =>
    s.status !== 'Completed' && s.orderedAt && s.expectedTAT
      ? getElapsed(s.orderedAt) > s.expectedTAT
      : false

  const filtered = samples.filter(s => {
    if (filter === 'All') return true
    if (filter === 'Urgent') return s.priority === 'Urgent'
    if (filter === 'Overdue') return isOverdue(s)
    return s.status === filter
  })

  const overdueCount = samples.filter(isOverdue).length
  const criticalPending = samples.filter(s => s.criticalValue && !s.criticalAcknowledgedBy).length

  const handleAdvance = (sample: typeof samples[number]) => {
    if (sample.criticalValue && !sample.criticalAcknowledgedBy) {
      setCriticalModal({ id: sample.id, name: sample.testName })
      return
    }
    advanceStatus(sample.id)
    toast.success(`${sample.id} advanced to ${STATUS_NEXT[sample.status]}`)
  }

  return (
    <div className="space-y-6">
      {/* Critical value alert banner */}
      {criticalPending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-300 shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">{criticalPending} critical value(s) require physician acknowledgement</p>
            <p className="text-xs text-red-700 mt-0.5">Cannot advance these samples until the ordering doctor has been notified.</p>
          </div>
        </motion.div>
      )}

      {/* Pipeline overview */}
      <div className="grid grid-cols-4 gap-3">
        {STATUS_ORDER.map(status => {
          const count = samples.filter(s => s.status === status).length
          const overdueCnt = samples.filter(s => s.status === status && isOverdue(s)).length
          return (
            <Card key={status} className={cn("p-4 text-center border-t-4",
              status === 'Completed' ? 'border-t-green-500' :
              status === 'Analyzing' ? 'border-t-amber-500' :
              status === 'Processing' ? 'border-t-blue-500' : 'border-t-slate-400'
            )}>
              <h3 className="text-2xl font-bold text-[#0F172A]">{count}</h3>
              <p className="text-xs font-bold text-[#64748B] mt-0.5">{status}</p>
              {overdueCnt > 0 && <p className="text-[10px] font-bold text-red-600 mt-1">{overdueCnt} overdue</p>}
            </Card>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'Urgent', 'Overdue', ...STATUS_ORDER] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("text-sm font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer relative",
              filter === f ? 'bg-violet-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {f}
            {f === 'Overdue' && overdueCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sample List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FlaskConical className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-semibold">No samples match this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(sample => {
              const overdue = isOverdue(sample)
              const criticalUnack = sample.criticalValue && !sample.criticalAcknowledgedBy
              return (
                <motion.div key={sample.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={cn("p-5",
                    criticalUnack ? "border-red-300 bg-red-50/40 shadow-red-100" :
                    overdue ? "border-orange-200 bg-orange-50/30" :
                    sample.aiAnomalyAlert ? "border-amber-200 bg-amber-50/20" : ""
                  )}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                          criticalUnack ? "bg-red-100 border-red-300" :
                          sample.priority === 'Urgent' ? "bg-red-50 border-red-200" : "bg-violet-50 border-violet-100"
                        )}>
                          <FlaskConical className={cn("h-5 w-5",
                            criticalUnack ? "text-red-700" :
                            sample.priority === 'Urgent' ? "text-red-600" : "text-violet-600"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[#0F172A] text-sm">{sample.id}</p>
                            <NeonBadge variant={sample.priority === 'Urgent' ? 'danger' : 'muted'}>{sample.priority}</NeonBadge>
                            {overdue && <NeonBadge variant="danger" dot pulse>Overdue</NeonBadge>}
                            {criticalUnack && <NeonBadge variant="danger" dot pulse>Critical — Unacknowledged</NeonBadge>}
                            {sample.criticalAcknowledgedBy && <NeonBadge variant="success">Ack by {sample.criticalAcknowledgedBy}</NeonBadge>}
                          </div>
                          <p className="text-sm text-[#64748B] mt-0.5 font-medium">{sample.testName}</p>
                          <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-0.5">
                            <span>{sample.patientName}</span>
                            {sample.orderedBy && <span>Ordered by {sample.orderedBy}</span>}
                          </div>
                          {sample.aiAnomalyAlert && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-red-600" role="alert">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                              AI Alert: {sample.aiAnomalyAlert}
                            </div>
                          )}
                          <TATTimer orderedAt={sample.orderedAt} expectedTAT={sample.expectedTAT} status={sample.status} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", STATUS_COLOR[sample.status])}>
                          {sample.status}
                        </span>
                        {STATUS_NEXT[sample.status] && (
                          <button
                            onClick={() => handleAdvance(sample)}
                            className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border",
                              criticalUnack
                                ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                : "bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200"
                            )}
                          >
                            {criticalUnack ? <AlertTriangle className="h-3 w-3" /> : <ChevronDown className="h-3 w-3 -rotate-90" />}
                            {criticalUnack ? "Ack First" : "Advance"}
                          </button>
                        )}
                        {sample.status === 'Completed' && (
                          <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                            <CheckCircle className="h-4 w-4" /> Done
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Critical value acknowledgement modal */}
      <AnimatePresence>
        {criticalModal && (
          <CriticalModal
            sampleId={criticalModal.id}
            sampleName={criticalModal.name}
            onAcknowledge={(doctor) => {
              acknowledgeCritical(criticalModal.id, doctor)
              advanceStatus(criticalModal.id)
              toast.success(`Critical value acknowledged by ${doctor}. Sample advanced.`)
              setCriticalModal(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
