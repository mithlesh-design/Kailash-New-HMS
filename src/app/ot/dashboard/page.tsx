"use client"

import { useState, useEffect } from "react"
import { useOTStore } from "@/store/useOTStore"
import { Scissors, Clock, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"

const STATUS_COLOR: Record<string, string> = {
  Scheduled:     'bg-slate-100 text-slate-700 border-slate-200',
  'Pre-Op':      'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Recovery:      'bg-purple-50 text-purple-700 border-purple-200',
  Completed:     'bg-green-50 text-green-700 border-green-200',
}

const ROOM_COLOR: Record<string, string> = {
  Available:   'bg-green-50 border-green-200 text-green-700',
  'In Use':    'bg-blue-50 border-blue-200 text-blue-700',
  Cleaning:    'bg-amber-50 border-amber-200 text-amber-700',
  Maintenance: 'bg-red-50 border-red-200 text-red-700',
}

const STATUS_NEXT: Partial<Record<string, string>> = {
  Scheduled: 'Pre-Op', 'Pre-Op': 'In Progress', 'In Progress': 'Recovery', Recovery: 'Completed',
}

export default function OTDashboard() {
  const { procedures, otRooms, updateStatus } = useOTStore()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(iv)
  }, [])

  const inProgress = procedures.filter(p => p.status === 'In Progress')
  const preOp = procedures.filter(p => p.status === 'Pre-Op')
  const scheduled = procedures.filter(p => p.status === 'Scheduled')
  const completed = procedures.filter(p => p.status === 'Completed')

  const getElapsed = (startedAt?: string) =>
    startedAt ? Math.floor((now - new Date(startedAt).getTime()) / 60000) : 0

  const criticalIncomplete = procedures.filter(p =>
    p.status === 'Pre-Op' && p.checklist.some(c => c.critical && !c.checked)
  )

  return (
    <div className="space-y-6">
      {/* Critical pre-op warning */}
      {criticalIncomplete.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-300 shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">
              {criticalIncomplete.length} procedure(s) have incomplete critical pre-op checklist items
            </p>
            <p className="text-xs text-red-700 mt-0.5">Review checklists before advancing to In Progress.</p>
          </div>
          <Link href="/ot/checklist">
            <button className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
              Review
            </button>
          </Link>
        </motion.div>
      )}

      {/* OT Room Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">OT Room Status</h2>
        <div className="grid grid-cols-3 gap-3">
          {otRooms.map(room => {
            const proc = room.currentProcedureId
              ? procedures.find(p => p.id === room.currentProcedureId)
              : null
            const elapsed = proc?.startedAt ? getElapsed(proc.startedAt) : 0
            const remaining = proc ? proc.durationMinutes - elapsed : 0
            return (
              <Card key={room.id} className={cn("p-4 border-2", ROOM_COLOR[room.status])}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm">{room.name}</h3>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", ROOM_COLOR[room.status])}>
                    {room.status}
                  </span>
                </div>
                {proc ? (
                  <div>
                    <p className="text-xs font-semibold truncate">{proc.patientName}</p>
                    <p className="text-[11px] text-current opacity-70 truncate mt-0.5">{proc.procedureName}</p>
                    {proc.startedAt && (
                      <div className="flex items-center gap-1 mt-2 text-[11px] font-bold">
                        <Clock className="h-3 w-3" />
                        {remaining > 0 ? `~${remaining}m remaining` : 'Overtime'}
                      </div>
                    )}
                  </div>
                ) : room.nextScheduledTime ? (
                  <p className="text-xs opacity-70">Next: {room.nextScheduledTime}</p>
                ) : (
                  <p className="text-xs opacity-70">No scheduled procedures</p>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'In Progress', count: inProgress.length, color: 'border-t-blue-500' },
          { label: 'Pre-Op', count: preOp.length, color: 'border-t-amber-500' },
          { label: 'Scheduled', count: scheduled.length, color: 'border-t-slate-400' },
          { label: 'Completed', count: completed.length, color: 'border-t-green-500' },
        ].map(({ label, count, color }) => (
          <Card key={label} className={cn("p-4 text-center border-t-4", color)}>
            <h3 className="text-2xl font-bold text-slate-900">{count}</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Today's procedure timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Today&apos;s Schedule</h2>
          <Link href="/ot/schedule">
            <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              Full Schedule <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
        <div className="space-y-3">
          {procedures.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)).map((proc, i) => {
            const elapsed = proc.startedAt ? getElapsed(proc.startedAt) : 0
            const checklistComplete = proc.checklist.every(c => !c.critical || c.checked)
            const next = STATUS_NEXT[proc.status]
            return (
              <motion.div key={proc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn("p-5",
                  proc.status === 'In Progress' ? "border-blue-200 bg-blue-50/20" :
                  proc.status === 'Pre-Op' && !checklistComplete ? "border-amber-200 bg-amber-50/20" : ""
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-center flex-shrink-0 w-14">
                        <p className="text-lg font-bold text-slate-900">{proc.scheduledTime}</p>
                        <p className="text-[10px] text-slate-500">{proc.otRoom}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">{proc.patientName}</p>
                          <NeonBadge variant="muted">{proc.id}</NeonBadge>
                          {proc.bloodRequired && <NeonBadge variant="danger">Blood Required</NeonBadge>}
                          {!checklistComplete && proc.status === 'Pre-Op' && (
                            <NeonBadge variant="warning" dot pulse>Checklist Incomplete</NeonBadge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 font-medium mt-0.5">{proc.procedureName}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>{proc.surgeon}</span>
                          <span>Anaes: {proc.anaesthetist}</span>
                          <span>{proc.durationMinutes}m</span>
                        </div>
                        {proc.status === 'In Progress' && proc.startedAt && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-700">
                            <Clock className="h-3.5 w-3.5" />
                            {elapsed}m elapsed — ~{Math.max(proc.durationMinutes - elapsed, 0)}m remaining
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", STATUS_COLOR[proc.status])}>
                        {proc.status}
                      </span>
                      {next && (
                        <button
                          onClick={() => {
                            if (next === 'In Progress' && !checklistComplete) {
                              toast.error('Complete all critical checklist items before starting')
                              return
                            }
                            updateStatus(proc.id, next as typeof proc.status)
                            toast.success(`${proc.id} advanced to ${next}`)
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                        >
                          → {next}
                        </button>
                      )}
                      {proc.status === 'Pre-Op' && (
                        <Link href="/ot/checklist">
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors cursor-pointer border border-amber-200">
                            Checklist
                          </button>
                        </Link>
                      )}
                      {proc.status === 'Completed' && (
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
        </div>
      </div>
    </div>
  )
}
