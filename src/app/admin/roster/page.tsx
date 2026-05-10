"use client"

import { useState } from "react"
import { useHRStore, type ShiftType } from "@/store/useHRStore"
import { motion } from "framer-motion"
import { Users, CheckCircle, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SHIFTS: ShiftType[] = ['Morning', 'Evening', 'Night', 'Off']

const SHIFT_COLOR: Record<ShiftType, string> = {
  Morning: 'bg-amber-50 text-amber-700 border-amber-200',
  Evening: 'bg-blue-50 text-blue-700 border-blue-200',
  Night:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  Off:     'bg-slate-100 text-slate-400 border-slate-200',
}

const CRITICAL_DEPTS = ['ICU', 'Emergency']
const MIN_STAFF: Record<string, number> = { ICU: 2, Emergency: 2 }

function getDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function RosterPage() {
  const { staff, shifts, leaveRequests, approveLeave, rejectLeave, updateShift } = useHRStore()
  const [weekOffset, setWeekOffset] = useState(0)
  const [deptFilter, setDeptFilter] = useState('All')
  const [editCell, setEditCell] = useState<{ staffId: string; date: string } | null>(null)

  const departments = ['All', ...Array.from(new Set(staff.map(s => s.department)))]
  const filteredStaff = deptFilter === 'All' ? staff : staff.filter(s => s.department === deptFilter)

  const weekDates = Array.from({ length: 7 }, (_, i) => getDateStr(weekOffset * 7 + i - 3))

  const getShift = (staffId: string, date: string): ShiftType => {
    return shifts.find(s => s.staffId === staffId && s.date === date)?.shift ?? 'Off'
  }

  const shiftCoverage = weekDates.map(date => {
    const alerts: string[] = []
    CRITICAL_DEPTS.forEach(dept => {
      const onDuty = filteredStaff.filter(s => s.department === dept && getShift(s.id, date) !== 'Off').length
      if (onDuty < (MIN_STAFF[dept] ?? 1)) alerts.push(`${dept} understaffed (${onDuty}/${MIN_STAFF[dept]})`)
    })
    return { date, alerts }
  })

  const pendingLeave = leaveRequests.filter(l => l.status === 'Pending')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Roster</h1>
          <p className="text-sm text-slate-500 mt-0.5">{staff.length} staff members · 7-day schedule</p>
        </div>
        {pendingLeave.length > 0 && (
          <NeonBadge variant="warning" dot pulse>{pendingLeave.length} leave request(s) pending</NeonBadge>
        )}
      </div>

      {/* Leave Requests */}
      {pendingLeave.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50/20">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Pending Leave Requests</h3>
          <div className="space-y-3">
            {pendingLeave.map(leave => (
              <div key={leave.id} className="flex items-center justify-between gap-4 p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{leave.staffName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {leave.department} · {formatDate(leave.fromDate)} — {formatDate(leave.toDate)}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 italic">{leave.reason}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { approveLeave(leave.id); toast.success(`Leave approved for ${leave.staffName}`) }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold transition-colors cursor-pointer border border-green-200"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => { rejectLeave(leave.id); toast.success(`Leave rejected for ${leave.staffName}`) }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer border border-red-200"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Staffing alerts */}
      {shiftCoverage.some(c => c.alerts.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {shiftCoverage.filter(c => c.alerts.length > 0).map(({ date, alerts }) => (
            <div key={date} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              {formatDate(date)}: {alerts.join(' · ')}
            </div>
          ))}
        </div>
      )}

      {/* Department filter + week nav */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {departments.map(dept => (
            <button key={dept} onClick={() => setDeptFilter(dept)}
              className={cn("text-sm font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all",
                deptFilter === dept ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}>
              {dept}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 w-32 text-center">
            {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} week` : `${weekOffset} week`}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Roster grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-bold text-slate-600 w-44">Staff</th>
              {weekDates.map(date => {
                const isToday = date === new Date().toISOString().split('T')[0]
                const hasAlert = shiftCoverage.find(c => c.date === date)?.alerts.length ?? 0 > 0
                return (
                  <th key={date} className={cn("text-center px-2 py-3 font-bold text-slate-600", isToday && "bg-blue-50")}>
                    <div className={cn("text-xs", isToday ? "text-blue-700 font-extrabold" : "")}>
                      {formatDate(date)}
                    </div>
                    {hasAlert && <AlertTriangle className="h-3 w-3 text-red-500 mx-auto mt-0.5" />}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member, rowIdx) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIdx * 0.03 }}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.role} · {member.department}</p>
                </td>
                {weekDates.map(date => {
                  const shift = getShift(member.id, date)
                  const isEditing = editCell?.staffId === member.id && editCell?.date === date
                  const isToday = date === new Date().toISOString().split('T')[0]
                  return (
                    <td key={date} className={cn("px-2 py-3 text-center", isToday && "bg-blue-50/50")}>
                      {isEditing ? (
                        <select
                          value={shift}
                          autoFocus
                          onBlur={() => setEditCell(null)}
                          onChange={e => {
                            updateShift(member.id, date, e.target.value as ShiftType)
                            setEditCell(null)
                            toast.success(`Shift updated for ${member.name}`)
                          }}
                          className="text-xs rounded-lg border border-blue-300 px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          {SHIFTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditCell({ staffId: member.id, date })}
                          className={cn("text-[11px] font-bold px-2 py-1 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity", SHIFT_COLOR[shift])}
                        >
                          {shift === 'Off' ? '—' : shift.slice(0, 3)}
                        </button>
                      )}
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-semibold text-slate-500">Shifts:</span>
        {SHIFTS.map(s => (
          <span key={s} className={cn("px-2 py-0.5 rounded-lg border font-semibold", SHIFT_COLOR[s])}>{s}</span>
        ))}
        <span className="text-slate-400 ml-2">Click any cell to edit</span>
      </div>
    </div>
  )
}
