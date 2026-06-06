"use client"

import { useMemo } from "react"
import {
  User, Stethoscope, Calendar, Activity, ShieldAlert, AlertTriangle,
  CheckCircle2, Pill, Droplet, Wrench, Clock, BedDouble,
} from "lucide-react"
import type { Bed } from "@/store/useAdmissionStore"
import { useInpatientStore, latestVitalsRecord, type Inpatient } from "@/store/useInpatientStore"
import { cn } from "@/lib/utils"

const CONDITION_TINT: Record<string, string> = {
  Critical:           'bg-red-50 text-red-700 border-red-200',
  Serious:            'bg-orange-50 text-orange-700 border-orange-200',
  Stable:             'bg-emerald-50 text-emerald-700 border-emerald-200',
  Improving:          'bg-blue-50 text-blue-700 border-blue-200',
  'Discharge-ready':  'bg-blue-50 text-blue-700 border-blue-200',
}

const STAGE_LABEL: Record<string, string> = {
  admitted:        'Admitted',
  under_treatment: 'Under treatment',
  pre_op:          'Pre-op',
  in_surgery:      'In surgery',
  post_op:         'Post-op',
  recovering:      'Recovering',
  discharge_initiated: 'Discharge initiated',
  discharged:      'Discharged',
}

function hoursOfStay(admittedAt: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(admittedAt).getTime()) / 3600000))
}

function fmtLoS(h: number): string {
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  const rh = h % 24
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`
}

interface Props {
  bed: Bed
  /** Side of the trigger to anchor against. */
  side?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Hover card with the patient details for an occupied / reserved bed.
 * Pulls from useInpatientStore by patientId; falls back to bed.occupantName.
 *
 * Designed to be placed as an absolute sibling inside a `group` parent — it
 * appears on group-hover/focus, doesn't intercept pointer events so the
 * underlying bed actions remain clickable.
 */
export function BedHoverCard({ bed, side = 'right' }: Props) {
  const inpatient = useInpatientStore(s =>
    bed.occupantId ? s.inpatients.find(i => i.patientId === bed.occupantId) : undefined
  )

  const data = useMemo(() => extract(bed, inpatient), [bed, inpatient])
  if (!data) return null

  const posClass =
    side === 'right'  ? 'left-full top-1/2 -translate-y-1/2 ml-2' :
    side === 'left'   ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
    side === 'top'    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
                        'top-full left-1/2 -translate-x-1/2 mt-2'

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 w-72 rounded-xl bg-white shadow-2xl border border-slate-200 p-3.5 opacity-0 invisible scale-95 transition-all duration-150",
        "group-hover:opacity-100 group-hover:visible group-hover:scale-100",
        "group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100",
        posClass,
      )}
      role="tooltip"
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
          {data.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">{data.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{data.patientId} · {data.ageGender} · {data.wardBed}</p>
        </div>
        {data.condition && (
          <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border whitespace-nowrap", CONDITION_TINT[data.condition] ?? CONDITION_TINT.Stable)}>
            {data.condition}
          </span>
        )}
      </div>

      {data.diagnosis && (
        <div className="mb-2 px-2 py-1.5 rounded-lg bg-slate-50">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-0.5">Diagnosis</p>
          <p className="text-xs font-semibold text-slate-800 line-clamp-2">{data.diagnosis}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {data.doctor && (
          <div className="flex items-center gap-1 text-[11px] text-slate-700">
            <Stethoscope className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{data.doctor}</span>
          </div>
        )}
        {data.los && (
          <div className="flex items-center gap-1 text-[11px] text-slate-700">
            <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span><b>LoS</b> {data.los}</span>
          </div>
        )}
        {data.stage && (
          <div className="flex items-center gap-1 text-[11px] text-slate-700">
            <Activity className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{data.stage}</span>
          </div>
        )}
        {data.expectedDischarge && (
          <div className="flex items-center gap-1 text-[11px] text-slate-700">
            <Calendar className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{data.expectedDischarge}</span>
          </div>
        )}
      </div>

      {data.vitals && (
        <div className="mb-2 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-[10px] font-bold uppercase text-emerald-700 mb-0.5">Latest vitals</p>
          <p className="text-[11px] text-emerald-900 font-medium">{data.vitals}</p>
        </div>
      )}

      {data.allergies && (
        <div className="mb-1.5 px-2 py-1 rounded-md bg-red-50 border border-red-200 flex items-start gap-1.5">
          <ShieldAlert className="h-3 w-3 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-red-800"><b>Allergies:</b> {data.allergies}</p>
        </div>
      )}

      {data.codeStatus && data.codeStatus !== 'Full code' && (
        <div className="mb-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 flex items-start gap-1.5">
          <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-amber-800"><b>Code:</b> {data.codeStatus}</p>
        </div>
      )}

      {bed.expectedFreeAt && (
        <div className="flex items-center gap-1 text-[10.5px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100">
          <BedDouble className="h-2.5 w-2.5" />Expected free: {new Date(bed.expectedFreeAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      {!inpatient && bed.status === 'Occupied' && (
        <p className="text-[10.5px] text-slate-400 mt-1 italic">No detailed inpatient record on file for this bed.</p>
      )}
    </div>
  )
}

// Build the display data — works even when the inpatient store doesn't have
// the patient (some beds are occupied by ER/OT placeholders).
function extract(bed: Bed, ip?: Inpatient) {
  if (bed.status !== 'Occupied' && bed.status !== 'Reserved' && bed.status !== 'Cleaning' && bed.status !== 'Maintenance') {
    return null
  }
  if (bed.status === 'Cleaning' || bed.status === 'Maintenance') {
    return {
      initials: bed.bedNumber.slice(0, 2),
      name: `Bed ${bed.bedNumber}`,
      patientId: '—',
      ageGender: bed.ward,
      wardBed: `${bed.ward} · ${bed.floor} floor`,
      diagnosis: bed.status === 'Cleaning' ? 'Bed under cleaning' : 'Maintenance',
      doctor: bed.cleaningAssignedTo,
      los: undefined,
      stage: bed.status === 'Cleaning' ? 'Turning over' : 'Maintenance',
      expectedDischarge: bed.expectedFreeAt
        ? `Ready by ${new Date(bed.expectedFreeAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
        : undefined,
      vitals: undefined,
      allergies: undefined,
      codeStatus: undefined,
      condition: undefined,
    }
  }

  // Occupied/Reserved — prefer full inpatient record, fall back to bed.
  const name = ip?.name ?? bed.occupantName ?? 'Unknown'
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const v = ip ? latestVitalsRecord(ip) : undefined
  const vitalsStr = v
    ? [
        v.hr != null ? `HR ${v.hr}` : null,
        v.systolicBP != null && v.diastolicBP != null ? `BP ${v.systolicBP}/${v.diastolicBP}` : null,
        v.spo2 != null ? `SpO₂ ${v.spo2}%` : null,
        v.temp != null ? `T ${v.temp}°F` : null,
      ].filter(Boolean).join(' · ')
    : undefined
  return {
    initials,
    name,
    patientId: ip?.patientId ?? bed.occupantId ?? '—',
    ageGender: ip ? `${ip.age}${ip.gender === 'Male' ? 'M' : ip.gender === 'Female' ? 'F' : ''}` : (bed.gender ?? ''),
    wardBed: `${bed.ward} · Bed ${bed.bedNumber}`,
    diagnosis: ip?.diagnosis,
    doctor: ip?.admittingDoctor,
    los: ip ? fmtLoS(hoursOfStay(ip.admittedAt)) : undefined,
    stage: ip ? STAGE_LABEL[ip.stage] : undefined,
    expectedDischarge: ip?.expectedDischarge,
    vitals: vitalsStr,
    allergies: ip?.allergies?.join(', '),
    codeStatus: ip?.codeStatus,
    condition: ip?.condition,
  }
}
