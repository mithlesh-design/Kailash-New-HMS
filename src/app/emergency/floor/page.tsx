"use client"

import { useMemo, useState } from "react"
import {
  Activity, Bed, ChevronDown, ChevronRight, Hand, Heart, Thermometer, Wind,
  ShieldAlert, AlertTriangle, Send, Clock,
} from "lucide-react"
import {
  useERStore, latestVitals,
  ER_VIKRAM,
  type ERPatient, type Disposition,
} from "@/store/useERStore"
import {
  news2, qsofa, TREATMENT_AREAS, ESI_STYLE,
  type Vitals, type TreatmentArea,
} from "@/lib/erClinical"
import { useAuthStore } from "@/store/useAuthStore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const DISPOSITIONS: { value: Disposition; label: string; tone: string }[] = [
  { value: 'admit_ward', label: 'Admit ward', tone: 'bg-blue-50 text-blue-700 ring-blue-200' },
  { value: 'admit_icu',  label: 'Admit ICU',  tone: 'bg-red-50 text-red-700 ring-red-200' },
  { value: 'admit_hdu',  label: 'Admit HDU',  tone: 'bg-orange-50 text-orange-700 ring-orange-200' },
  { value: 'discharge',  label: 'Discharge',  tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { value: 'transfer',   label: 'Transfer',   tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
  { value: 'against_medical_advice', label: 'AMA', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 'deceased',   label: 'Deceased',   tone: 'bg-slate-100 text-slate-700 ring-slate-200' },
]

const minsSince = (iso: string) => Math.round((Date.now() - new Date(iso).getTime()) / 60000)

export default function ERFloor() {
  const patients = useERStore(s => s.patients)
  const mci = useERStore(s => s.mciActive)
  const toggleMCI = useERStore(s => s.toggleMCI)
  const recordVitals = useERStore(s => s.recordVitals)
  const claim = useERStore(s => s.claim)
  const setDisposition = useERStore(s => s.setDisposition)
  const dispose = useERStore(s => s.dispose)

  const currentUser = useAuthStore(s => s.currentUser)
  const me = { id: currentUser?.id ?? ER_VIKRAM.id, name: currentUser?.name ?? ER_VIKRAM.name }

  const [area, setArea] = useState<TreatmentArea>('CRITICAL')
  const [scope, setScope] = useState<'all' | 'mine'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Record<string, Vitals>>({})
  const [dispoNote, setDispoNote] = useState<Record<string, string>>({})

  const inArea = (p: ERPatient) => (p.phase === 'in_treatment' || p.phase === 'awaiting_disposition') && p.area === area
  const rows = useMemo(
    () => patients
      .filter(inArea)
      .filter(p => scope === 'all' || p.assignedTo?.id === me.id)
      .sort((a, b) => (a.esi ?? 5) - (b.esi ?? 5)),
    [patients, area, scope, me.id],
  )

  const areaCounts = useMemo(() => {
    const c: Record<TreatmentArea, number> = { RESUS: 0, TRAUMA: 0, CRITICAL: 0, ACUTE: 0, SUBACUTE: 0, FAST_TRACK: 0, OBS: 0 }
    for (const p of patients) {
      if ((p.phase === 'in_treatment' || p.phase === 'awaiting_disposition') && p.area) c[p.area]++
    }
    return c
  }, [patients])

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <Activity className="h-6 w-6 text-red-600" /> ER Floor
          </h1>
          <p className="text-sm text-[#64748B] mt-1">Treatment areas · NEWS2 / qSOFA at the bedside · disposition closes the visit</p>
        </div>
        <button onClick={() => { toggleMCI(); toast(mci ? 'MCI mode cleared' : 'MCI MODE activated — all teams on standby') }}
          className={cn('flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer',
            mci ? 'bg-red-100 text-red-700 ring-1 ring-red-300 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
          <AlertTriangle className="h-3.5 w-3.5" />{mci ? 'MCI ACTIVE — click to clear' : 'Declare MCI'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {TREATMENT_AREAS.map(a => (
            <button key={a.code} onClick={() => setArea(a.code)}
              className={cn('px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition',
                area === a.code ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {a.label} <span className="text-slate-400 font-bold">{areaCounts[a.code]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {([['all', 'All'], ['mine', 'My patients']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setScope(k)}
              className={cn('px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition',
                scope === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Activity className="h-9 w-9 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No patients in {TREATMENT_AREAS.find(a => a.code === area)?.label}</p>
          </div>
        )}
        {rows.map(p => (
          <FloorRow key={p.id} p={p} meId={me.id}
            expanded={expandedId === p.id}
            draft={draft[p.id] ?? {}}
            dispoNote={dispoNote[p.id] ?? ''}
            onToggle={() => setExpandedId(id => id === p.id ? null : p.id)}
            onClaim={() => { claim(p.id, me); toast.success(`${p.name} on your counter`) }}
            onDraft={(patch) => setDraft(prev => ({ ...prev, [p.id]: { ...(prev[p.id] ?? {}), ...patch } }))}
            onSaveVitals={() => {
              const v = draft[p.id]
              if (!v || Object.keys(v).length === 0) { toast.error('Record at least one vital'); return }
              recordVitals(p.id, v, me.name)
              setDraft(prev => { const c = { ...prev }; delete c[p.id]; return c })
              toast.success('Vitals updated')
            }}
            onDispoNote={(v) => setDispoNote(prev => ({ ...prev, [p.id]: v }))}
            onDispose={(d) => {
              setDisposition(p.id, d, dispoNote[p.id])
              toast.success(`Disposition: ${DISPOSITIONS.find(x => x.value === d)?.label}`)
            }}
            onComplete={() => {
              dispose(p.id)
              toast.success(`${p.name} discharged from ER`)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function FloorRow(props: {
  p: ERPatient; meId: string
  expanded: boolean
  draft: Vitals
  dispoNote: string
  onToggle: () => void
  onClaim: () => void
  onDraft: (patch: Partial<Vitals>) => void
  onSaveVitals: () => void
  onDispoNote: (v: string) => void
  onDispose: (d: Disposition) => void
  onComplete: () => void
}) {
  const { p, meId, expanded, draft, dispoNote } = props
  const v = latestVitals(p)
  const n = v ? news2(v) : null
  const q = v ? qsofa(v) : null
  const mine = p.assignedTo?.id === meId
  const mins = minsSince(p.arrivedAt)

  return (
    <div className={cn('rounded-xl bg-white ring-1 overflow-hidden',
      n?.band === 'high' ? 'ring-red-300' : q?.positive ? 'ring-orange-200' : 'ring-slate-200/70')}>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {p.esi && (
          <span className={cn('flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded', ESI_STYLE[p.esi].bg, ESI_STYLE[p.esi].fg)}>ESI {p.esi}</span>
        )}

        <button onClick={props.onToggle} className="flex-1 min-w-0 text-left cursor-pointer">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 truncate">{p.name}</span>
            <span className="text-[11px] font-bold text-slate-400">{p.age}{p.gender}</span>
            {p.bedNumber && <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5"><Bed className="h-3 w-3" />{p.bedNumber}</span>}
            {p.trauma && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">TRAUMA</span>}
            {n && n.band !== 'low' && (
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded',
                n.band === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>NEWS2 {n.score}</span>
            )}
            {q?.positive && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">qSOFA+</span>}
            {p.assignedTo && <span className="text-[11px] font-semibold text-slate-400">· {mine ? 'your counter' : `on ${p.assignedTo.name}`}</span>}
            {p.disposition && (
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded ring-1',
                DISPOSITIONS.find(d => d.value === p.disposition)?.tone)}>{DISPOSITIONS.find(d => d.value === p.disposition)?.label}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1 flex-wrap">
            <span>{p.chiefComplaint}</span>
            <span className="text-slate-400 mx-1">·</span>
            <Clock className="h-3 w-3" />{mins}m
          </p>
        </button>

        <div className="flex-shrink-0 flex items-center gap-2">
          {!p.assignedTo && (
            <button onClick={props.onClaim}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)', boxShadow: '0 2px 8px rgba(239,68,68,0.25)' }}>
              <Hand className="h-3.5 w-3.5" />Accept
            </button>
          )}
          {p.phase === 'awaiting_disposition' && mine && (
            <button onClick={props.onComplete}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#16A34A,#0D9488)' }}>
              <Send className="h-3.5 w-3.5" />Complete ER visit
            </button>
          )}
          <button onClick={props.onToggle} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
          {/* Vitals trend */}
          {p.vitalsHistory.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Vitals trend</p>
              <div className="space-y-1">
                {p.vitalsHistory.slice().reverse().slice(0, 3).map((vh, i) => (
                  <div key={i} className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                    <Clock className="h-3 w-3 text-slate-400" />{new Date(vh.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {vh.rr !== undefined && <span><b>RR</b> {vh.rr}</span>}
                    {vh.spo2 !== undefined && <span><b>SpO2</b> {vh.spo2}{vh.onOxygen ? ' (O2)' : ''}</span>}
                    {vh.sbp !== undefined && <span><b>SBP</b> {vh.sbp}</span>}
                    {vh.hr !== undefined && <span><b>HR</b> {vh.hr}</span>}
                    {vh.temp !== undefined && <span><b>T</b> {vh.temp}°</span>}
                    {vh.gcs !== undefined && <span><b>GCS</b> {vh.gcs}</span>}
                    <span className="text-slate-400">by {vh.by}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEWS2 + qSOFA panels */}
          {n && (
            <div className={cn('rounded-lg p-3 ring-1',
              n.band === 'high' ? 'ring-red-200 bg-red-50' : n.band === 'medium' ? 'ring-amber-200 bg-amber-50' : 'ring-slate-200 bg-white')}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><Activity className="h-3 w-3" />NEWS2</p>
                <p className="text-lg font-bold text-slate-900">{n.score}</p>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">{n.trigger}</p>
            </div>
          )}

          {q && q.positive && (
            <div className="rounded-lg p-3 ring-1 ring-orange-200 bg-orange-50">
              <p className="text-[11px] font-bold text-orange-700 flex items-center gap-1"><ShieldAlert className="h-3 w-3" />qSOFA positive · sepsis suspected</p>
              <p className="text-[11px] text-orange-700 mt-1">Criteria: {q.criteria.join(' · ')}. Consider sepsis bundle: blood cultures + lactate + broad-spectrum antibiotic within 1h.</p>
            </div>
          )}

          {/* Quick vitals update — only when claimed by me */}
          {mine && p.phase !== 'awaiting_disposition' && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Update vitals</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                <VitalInput label="RR" icon={Wind} value={draft.rr} onChange={v => props.onDraft({ rr: v })} />
                <VitalInput label="SpO2" value={draft.spo2} onChange={v => props.onDraft({ spo2: v })} />
                <label className="flex items-center gap-1 text-[11px] font-semibold rounded-lg bg-white ring-1 ring-slate-200 px-2.5 py-2 cursor-pointer">
                  <input type="checkbox" checked={!!draft.onOxygen} onChange={e => props.onDraft({ onOxygen: e.target.checked })} />O2
                </label>
                <VitalInput label="SBP" icon={Heart} value={draft.sbp} onChange={v => props.onDraft({ sbp: v })} />
                <VitalInput label="HR" icon={Heart} value={draft.hr} onChange={v => props.onDraft({ hr: v })} />
                <VitalInput label="Temp" icon={Thermometer} value={draft.temp} step="0.1" onChange={v => props.onDraft({ temp: v })} />
                <VitalInput label="GCS" value={draft.gcs} onChange={v => props.onDraft({ gcs: v })} />
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={props.onSaveVitals}
                  className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)' }}>Save vitals</button>
              </div>
            </div>
          )}

          {/* Disposition */}
          {mine && p.phase !== 'awaiting_disposition' && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Disposition</p>
              <textarea value={dispoNote} onChange={e => props.onDispoNote(e.target.value)} rows={2}
                placeholder="Disposition note (handover summary)"
                className="w-full text-[12px] rounded-md border border-slate-200 p-1.5 focus:outline-none focus:ring-2 focus:ring-red-200" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {DISPOSITIONS.map(d => (
                  <button key={d.value} onClick={() => props.onDispose(d.value)}
                    className={cn('text-[11px] font-bold px-2.5 py-1 rounded-lg ring-1 cursor-pointer', d.tone)}>{d.label}</button>
                ))}
              </div>
            </div>
          )}

          {p.dispositionNote && (
            <p className="text-[11px] text-slate-600 bg-white ring-1 ring-slate-200 rounded-md p-2"><b>Handover:</b> {p.dispositionNote}</p>
          )}
        </div>
      )}
    </div>
  )
}

function VitalInput({ label, value, onChange, step = '1', icon: Icon }: {
  label: string; value?: number; step?: string
  onChange: (v: number | undefined) => void
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg bg-white ring-1 ring-slate-200 px-2 py-1.5">
      <label className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </label>
      <input type="number" step={step}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-none mt-0.5"
      />
    </div>
  )
}
