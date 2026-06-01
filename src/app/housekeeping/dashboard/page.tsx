"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Clock, CheckCircle2, AlertCircle, User } from "lucide-react"
import { useHousekeepingStore } from "@/store/useHousekeepingStore"
import { useAdmissionStore } from "@/store/useAdmissionStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const PRIORITY_STYLE: Record<string, string> = {
  Urgent: "bg-red-50 border-red-200",
  High: "bg-orange-50 border-orange-200",
  Routine: "bg-slate-50 border-slate-200",
}
const PRIORITY_BADGE: Record<string, "danger" | "warning" | "muted"> = {
  Urgent: "danger",
  High: "warning",
  Routine: "muted",
}

export default function HousekeepingDashboard() {
  const { tasks, staff, assignTask, startTask, completeTask, verifyTask } = useHousekeepingStore()
  const { confirmBedReady } = useAdmissionStore()
  const [filter, setFilter] = useState<string>('All')

  const filtered = tasks.filter(t => filter === 'All' || t.status === filter)
  const pending = tasks.filter(t => t.status === 'Pending').length
  const inProgress = tasks.filter(t => t.status === 'In Progress').length
  const done = tasks.filter(t => t.status === 'Done').length
  const verified = tasks.filter(t => t.status === 'Verified').length

  const elapsed = (dateStr?: string) => {
    if (!dateStr) return '—'
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const handleVerify = (taskId: string, bedId: string) => {
    verifyTask(taskId, 'Head Nurse')
    confirmBedReady(bedId)
    toast.success("Bed verified and marked as Available")
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending", value: pending, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "In Progress", value: inProgress, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          { label: "Done (Unverified)", value: done, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Verified", value: verified, color: "text-green-600", bg: "bg-green-50 border-green-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("rounded-xl border p-5", bg)}>
            <p className={cn("text-3xl font-bold", color)}>{value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Task list */}
        <div className="col-span-2 bg-white border shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Cleaning Queue</h2>
            <div className="flex gap-2">
              {['All', 'Pending', 'In Progress', 'Done', 'Verified'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors",
                    filter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {filtered.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn("p-4", PRIORITY_STYLE[task.priority])}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-slate-900">Bed {task.bedNumber}</span>
                        <NeonBadge variant={PRIORITY_BADGE[task.priority]} className="text-[10px]">{task.priority}</NeonBadge>
                        <span className="text-xs text-slate-500">{task.ward}</span>
                        <NeonBadge
                          variant={task.status === 'Verified' ? 'success' : task.status === 'In Progress' ? 'warning' : task.status === 'Done' ? 'blue' : 'muted'}
                          className="text-[10px]"
                        >
                          {task.status}
                        </NeonBadge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{task.reason} clean</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Requested {elapsed(task.requestedAt)} ago</span>
                        {task.startedAt && <span>Started: {elapsed(task.startedAt)} ago</span>}
                        {task.assignedTo && <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignedTo}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'Pending' && !task.assignedTo && (
                        <select
                          onChange={e => { if (e.target.value) { assignTask(task.id, e.target.value); toast.info(`Assigned to ${e.target.value}`) } }}
                          defaultValue=""
                          className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 text-slate-700 bg-white focus:outline-none cursor-pointer"
                        >
                          <option value="" disabled>Assign staff</option>
                          {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      )}
                      {task.status === 'Pending' && task.assignedTo && (
                        <Button size="sm" variant="secondary" onClick={() => { startTask(task.id); toast.info(`Cleaning started for Bed ${task.bedNumber}`) }}>
                          Start
                        </Button>
                      )}
                      {task.status === 'In Progress' && (
                        <Button size="sm" variant="secondary" onClick={() => { completeTask(task.id); toast.info("Marked as done — awaiting verification") }}>
                          Mark Done
                        </Button>
                      )}
                      {task.status === 'Done' && (
                        <Button size="sm" variant="primary" onClick={() => handleVerify(task.id, task.bedId)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
                        </Button>
                      )}
                      {task.status === 'Verified' && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">No tasks in this view</p>
              </div>
            )}
          </div>
        </div>

        {/* Staff Status */}
        <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Housekeeping Staff</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {staff.map(member => {
              const currentTask = member.currentTaskId ? tasks.find(t => t.id === member.currentTaskId) : null
              return (
                <div key={member.id} className="p-4 flex items-center gap-3">
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                    currentTask ? "bg-yellow-500" : "bg-green-500"
                  )}>
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                    {currentTask ? (
                      <p className="text-xs text-yellow-700 font-medium">Cleaning Bed {currentTask.bedNumber}</p>
                    ) : (
                      <p className="text-xs text-green-700 font-medium">Available</p>
                    )}
                  </div>
                  <NeonBadge variant={currentTask ? "warning" : "success"} className="text-[10px]">
                    {currentTask ? "Busy" : "Free"}
                  </NeonBadge>
                </div>
              )
            })}
          </div>

          {pending > 0 && (
            <div className="p-4 border-t border-slate-100 bg-orange-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <p className="text-xs font-semibold text-orange-800">{pending} task(s) awaiting assignment</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
