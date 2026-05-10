"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useHRStore, type ShiftType, type StaffMember } from "@/store/useHRStore"
import {
  ClipboardList, ChevronLeft, ChevronRight, User, AlertTriangle,
  Stethoscope, Activity, FlaskConical, Pill, Sparkles, CheckCircle, XCircle
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const SHIFTS: ShiftType[] = ['Morning', 'Evening', 'Night']

const SHIFT_CONFIG: Record<ShiftType, { label: string; time: string; gradient: string; shadow: string; lightBg: string; textColor: string }> = {
  Morning: { label: 'Morning', time: '06:00 – 14:00', gradient: 'linear-gradient(135deg, #D97706, #F59E0B)', shadow: 'rgba(217,119,6,0.25)', lightBg: '#FFFBEB', textColor: '#78350F' },
  Evening: { label: 'Evening', time: '14:00 – 22:00', gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)', shadow: 'rgba(37,99,235,0.25)', lightBg: '#EFF6FF', textColor: '#1E3A8A' },
  Night:   { label: 'Night',   time: '22:00 – 06:00', gradient: 'linear-gradient(135deg, #4C1D95, #7C3AED)', shadow: 'rgba(76,29,149,0.25)', lightBg: '#F5F3FF', textColor: '#4C1D95' },
  Off:     { label: 'Off', time: '', gradient: 'linear-gradient(135deg, #94A3B8, #CBD5E1)', shadow: 'rgba(148,163,184,0.2)', lightBg: '#F8FAFC', textColor: '#94A3B8' },
}

const ROLE_ICON: Record<string, React.ElementType> = {
  Doctor: Stethoscope,
  Nurse: Activity,
  'Lab Technician': FlaskConical,
  Radiologist: Activity,
  Pharmacist: Pill,
}

const WARDS = ['ICU', 'Emergency', 'General Ward', 'Radiology', 'Pathology', 'Pharmacy', 'OT', 'Paediatrics']

const WARD_COLORS: Record<string, { bg: string; text: string }> = {
  ICU: { bg: '#FEE2E2', text: '#7F1D1D' },
  Emergency: { bg: '#FEF3C7', text: '#78350F' },
  'General Ward': { bg: '#DBEAFE', text: '#1E3A8A' },
  Radiology: { bg: '#F3E8FF', text: '#4C1D95' },
  Pathology: { bg: '#D1FAE5', text: '#065F46' },
  Pharmacy: { bg: '#FCE7F3', text: '#831843' },
  OT: { bg: '#E0F2FE', text: '#0C4A6E' },
  Paediatrics: { bg: '#FEF9C3', text: '#713F12' },
}

function getDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface DutyAssignment {
  staffId: string
  date: string
  shift: ShiftType
  ward: string
}

const INITIAL_ASSIGNMENTS: DutyAssignment[] = [
  { staffId: 'DR-1012', date: getDateStr(0), shift: 'Morning', ward: 'General Ward' },
  { staffId: 'DR-1015', date: getDateStr(0), shift: 'Morning', ward: 'Emergency' },
  { staffId: 'NR-402',  date: getDateStr(0), shift: 'Morning', ward: 'General Ward' },
  { staffId: 'NR-403',  date: getDateStr(0), shift: 'Evening', ward: 'ICU' },
  { staffId: 'NR-404',  date: getDateStr(0), shift: 'Night',   ward: 'General Ward' },
  { staffId: 'LB-992',  date: getDateStr(0), shift: 'Morning', ward: 'Pathology' },
  { staffId: 'RAD-304', date: getDateStr(0), shift: 'Morning', ward: 'Radiology' },
  { staffId: 'PH-301',  date: getDateStr(0), shift: 'Morning', ward: 'Pharmacy' },
  { staffId: 'DR-1012', date: getDateStr(1), shift: 'Morning', ward: 'General Ward' },
  { staffId: 'DR-1015', date: getDateStr(1), shift: 'Evening', ward: 'Emergency' },
  { staffId: 'NR-403',  date: getDateStr(1), shift: 'Morning', ward: 'ICU' },
  { staffId: 'NR-404',  date: getDateStr(1), shift: 'Morning', ward: 'General Ward' },
]

interface AssignModalProps {
  staff: StaffMember
  date: string
  current: DutyAssignment | undefined
  onSave: (shift: ShiftType, ward: string) => void
  onClose: () => void
}

function AssignModal({ staff, date, current, onSave, onClose }: AssignModalProps) {
  const [shift, setShift] = useState<ShiftType>(current?.shift ?? 'Morning')
  const [ward, setWard] = useState(current?.ward ?? staff.department)

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 w-full max-w-sm"
        style={{ boxShadow: '0 24px 64px rgba(15,23,42,0.2)' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{staff.name}</p>
            <p className="text-xs text-slate-500">{staff.role} · {formatDate(date)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFTS.map(s => {
                const cfg = SHIFT_CONFIG[s]
                return (
                  <button key={s} onClick={() => setShift(s)}
                    className="py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    style={shift === s
                      ? { background: cfg.gradient, color: '#fff', boxShadow: `0 4px 12px ${cfg.shadow}` }
                      : { background: cfg.lightBg, color: cfg.textColor }
                    }
                  >
                    <div>{cfg.label}</div>
                    <div className="text-[9px] opacity-70 mt-0.5">{cfg.time.split('–')[0].trim()}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Assigned Ward</label>
            <div className="grid grid-cols-2 gap-2">
              {WARDS.map(w => {
                const wc = WARD_COLORS[w] ?? { bg: '#F1F5F9', text: '#475569' }
                return (
                  <button key={w} onClick={() => setWard(w)}
                    className="py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all text-left"
                    style={ward === w
                      ? { background: wc.bg, color: wc.text, outline: `2px solid ${wc.text}30`, outlineOffset: 0 }
                      : { background: '#F8FAFC', color: '#64748B' }
                    }
                  >
                    {w}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => { onSave(shift, ward); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #2563EB, #3B82F6)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
          >
            Save Duty
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DutyAssignmentPage() {
  const { staff } = useHRStore()
  const [assignments, setAssignments] = useState<DutyAssignment[]>(INITIAL_ASSIGNMENTS)
  const [dateOffset, setDateOffset] = useState(0)
  const [selectedShift, setSelectedShift] = useState<ShiftType>('Morning')
  const [assigning, setAssigning] = useState<{ staff: StaffMember; date: string } | null>(null)
  const [roleFilter, setRoleFilter] = useState('All')

  const currentDate = getDateStr(dateOffset)
  const roles = ['All', ...Array.from(new Set(staff.map(s => s.role)))]
  const filteredStaff = roleFilter === 'All' ? staff : staff.filter(s => s.role === roleFilter)

  function getAssignment(staffId: string): DutyAssignment | undefined {
    return assignments.find(a => a.staffId === staffId && a.date === currentDate && a.shift === selectedShift)
  }

  function saveAssignment(staffId: string, shift: ShiftType, ward: string) {
    setAssignments(prev => {
      const others = prev.filter(a => !(a.staffId === staffId && a.date === currentDate && a.shift === selectedShift))
      return [...others, { staffId, date: currentDate, shift, ward }]
    })
    const member = staff.find(s => s.id === staffId)
    toast.success(`Duty saved for ${member?.name}`)
  }

  function removeAssignment(staffId: string) {
    setAssignments(prev => prev.filter(a => !(a.staffId === staffId && a.date === currentDate && a.shift === selectedShift)))
    const member = staff.find(s => s.id === staffId)
    toast.success(`Duty cleared for ${member?.name}`)
  }

  const shiftCfg = SHIFT_CONFIG[selectedShift]

  // Ward coverage summary for current shift+date
  const wardCoverage = WARDS.map(ward => ({
    ward,
    count: assignments.filter(a => a.date === currentDate && a.shift === selectedShift && a.ward === ward).length,
  }))

  const criticalUnderstaffed = ['ICU', 'Emergency'].filter(w => {
    const count = wardCoverage.find(wc => wc.ward === w)?.count ?? 0
    return count < 1
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duty Assignment</h1>
          <p className="text-sm text-slate-500 mt-0.5">Assign staff to wards and shifts by date</p>
        </div>
        {criticalUnderstaffed.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-700"
            style={{ background: '#FEE2E2', boxShadow: '0 2px 8px rgba(220,38,38,0.12)' }}>
            <AlertTriangle className="h-4 w-4" />
            {criticalUnderstaffed.join(' & ')} understaffed
          </div>
        )}
      </div>

      {/* Date Nav + Shift Selector */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date nav */}
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
          <button onClick={() => setDateOffset(d => d - 1)}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="text-sm font-bold text-slate-800 min-w-[130px] text-center">
            {dateOffset === 0 ? 'Today' : dateOffset === 1 ? 'Tomorrow' : dateOffset === -1 ? 'Yesterday' : formatDate(currentDate)}
          </span>
          <span className="text-xs text-slate-400">{formatDate(currentDate)}</span>
          <button onClick={() => setDateOffset(d => d + 1)}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Shift selector */}
        <div className="flex gap-2">
          {SHIFTS.map(s => {
            const cfg = SHIFT_CONFIG[s]
            return (
              <button key={s} onClick={() => setSelectedShift(s)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                style={selectedShift === s
                  ? { background: cfg.gradient, color: '#fff', boxShadow: `0 4px 12px ${cfg.shadow}` }
                  : { background: '#fff', color: cfg.textColor, boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }
                }
              >
                {cfg.label}
                <span className="text-[10px] opacity-70 hidden sm:inline">{cfg.time}</span>
              </button>
            )
          })}
        </div>

        {/* Role filter */}
        <div className="flex gap-1.5 ml-auto">
          {roles.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all"
              style={roleFilter === r
                ? { background: '#0F172A', color: '#fff' }
                : { background: '#fff', color: '#64748B', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Ward Coverage Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {wardCoverage.filter(wc => wc.count > 0 || ['ICU','Emergency'].includes(wc.ward)).map(wc => {
          const wc2 = WARD_COLORS[wc.ward] ?? { bg: '#F1F5F9', text: '#475569' }
          const isCritical = ['ICU', 'Emergency'].includes(wc.ward) && wc.count < 1
          return (
            <div key={wc.ward} className="flex items-center gap-3 p-3 rounded-xl bg-white"
              style={{ boxShadow: isCritical ? '0 0 0 2px #EF4444, 0 2px 8px rgba(239,68,68,0.15)' : '0 1px 4px rgba(15,23,42,0.06)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: wc2.bg, color: wc2.text }}>
                {wc.count}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{wc.ward}</p>
                <p className="text-[10px] text-slate-400">{wc.count === 0 ? 'Unstaffed' : `${wc.count} on duty`}</p>
              </div>
              {isCritical && <AlertTriangle className="h-3.5 w-3.5 text-red-500 ml-auto" />}
            </div>
          )
        })}
      </div>

      {/* Staff Assignment Board */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 8px 32px rgba(15,23,42,0.06)' }}>
        {/* Board Header */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-50">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: shiftCfg.gradient }}>
            <ClipboardList className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{shiftCfg.label} Shift — {formatDate(currentDate)}</p>
            <p className="text-xs text-slate-400">{shiftCfg.time} · Click a staff card to assign</p>
          </div>
        </div>

        {/* Staff cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredStaff.map((member, i) => {
            const assignment = getAssignment(member.id)
            const RoleIcon = ROLE_ICON[member.role] ?? User
            const wc = assignment ? (WARD_COLORS[assignment.ward] ?? { bg: '#F1F5F9', text: '#475569' }) : null

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all group"
                style={{ background: assignment ? shiftCfg.lightBg : '#F8FAFC', boxShadow: assignment ? `0 2px 8px ${shiftCfg.shadow}` : 'none' }}
                onClick={() => setAssigning({ staff: member, date: currentDate })}
              >
                {/* Role Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: assignment ? shiftCfg.gradient : 'linear-gradient(135deg, #94A3B8, #CBD5E1)', boxShadow: assignment ? `0 4px 10px ${shiftCfg.shadow}` : 'none' }}>
                  <RoleIcon className="h-5 w-5 text-white" />
                </div>

                {/* Staff Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>

                {/* Ward Badge */}
                {assignment && wc ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: wc.bg, color: wc.text }}>
                      {assignment.ward}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); removeAssignment(member.id) }}
                      className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <XCircle className="h-3 w-3" /> clear
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 rounded-lg bg-white group-hover:text-blue-500 transition-colors"
                    style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
                    + Assign
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', boxShadow: '0 2px 12px rgba(124,58,237,0.08)' }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-900">AI Duty Suggestion</p>
            <p className="text-xs text-violet-700 mt-1 leading-relaxed">
              Based on today&apos;s OPD load (47 patients) and 3 ICU admissions, recommend adding 1 additional nurse to ICU for the Evening shift.
              Dr. Vikram Rathore is scheduled Morning — consider extending to Evening for trauma coverage.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
                <CheckCircle className="h-3.5 w-3.5" /> Apply Suggestion
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-violet-700 bg-white/60 cursor-pointer hover:bg-white/80 transition-colors">
                <XCircle className="h-3.5 w-3.5" /> Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {assigning && (
          <AssignModal
            staff={assigning.staff}
            date={assigning.date}
            current={getAssignment(assigning.staff.id)}
            onSave={(shift, ward) => saveAssignment(assigning.staff.id, shift, ward)}
            onClose={() => setAssigning(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
