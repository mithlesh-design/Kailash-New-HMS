"use client"

import { useMemo, useState } from "react"
import {
  Ambulance, AlertTriangle, ChevronDown, ChevronRight, UserPlus, Send,
  Activity, ShieldAlert, Heart, Thermometer, Wind, Clock,
} from "lucide-react"
import {
  useERStore, latestVitals,
  ER_TRIAGE_NURSE,
  type ERPatient, type Arrival,
} from "@/store/useERStore"
import {
  news2, qsofa, esiSuggest, suggestArea, ESI_STYLE, TREATMENT_AREAS,
  type Vitals, type ESIBand,
} from "@/lib/erClinical"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const ARRIVAL_LABEL: Record<Arrival, string> = {
  walk_in: 'Walk-in', ambulance: 'Ambulance', transfer: 'Transfer',
}
const ARRIVAL_STYLE: Record<Arrival, string> = {
  walk_in: 'bg-blue-50 text-blue-700',
  ambulance: 'bg-red-50 text-red-700',
  transfer: 'bg-violet-50 text-violet-700',
}

const minsSince = (iso: string) => Math.round((Date.now() - new Date(iso).getTime()) / 60000)

export default function TriagePage() {
  const patients = useERStore(s => s.patients)
  const mci = useERStore(s => s.mciActive)
  const registerArrival = useERStore(s => s.registerArrival)
  const recordVitals = useERStore(s => s.recordVitals)
  const setESI = useERStore(s => s.setESI)
  const routeToArea = useERStore(s => s.routeToArea)

  const [tab, setTab] = useState<'awaiting' | 'triaged'>('awaiting')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [vitalsDraft, setVitalsDraft] = useState<Record<string, Vitals>>({})
  const [showRegister, setShowRegister] = useState(false)
  const [reg, setReg] = useState({ name: '', age: '', gender: 'M' as 'M' | 'F' | 'X', arrival: 'walk_in' as Arrival, chiefComplaint: '', trauma: false })

  const { awaiting, triaged } = useMemo(() => ({
    awaiting: patients.filter(p => p.phase === 'awaiting_triage'),
    triaged: patients.filter(p => p.phase === 'triaged'),
  }), [patients])

  const getDraft = (id: string): Vitals => vitalsDraft[id] ?? {}
  const setDraft = (id: string, patch: Partial<Vitals>) =>
    setVitalsDraft(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), ...patch } }))

  const saveVitals = (p: ERPatient) => {
    const v = getDraft(p.id)
    if (Object.keys(v).length === 0) { toast.error('Record at least one vital'); return }
    recordVitals(p.id, v, ER_TRIAGE_NURSE.name)
    setVitalsDraft(prev => { const c = { ...prev }; delete c[p.id]; return c })
    toast.success(`Vitals recorded for ${p.name}`)
  }

  const applyESI = (p: ERPatient, level: ESIBand, reason: string) => {
    setESI(p.id, level, reason)
    const area = suggestArea(level, p.trauma)
    routeToArea(p.id, area)
    toast.success(`${p.name} triaged ESI ${level} → ${TREATMENT_AREAS.find(a => a.code === area)?.label}`)
  }

  const submitRegister = () => {
    if (!reg.name || !reg.chiefComplaint) { toast.error('Name and chief complaint required'); return }
    const age = parseInt(reg.age, 10) || 0
    registerArrival({
      patientId: `PT-${Date.now().toString().slice(-5)}`,
      name: reg.name, age, gender: reg.gender,
      arrival: reg.arrival, chiefComplaint: reg.chiefComplaint, trauma: reg.trauma,
    })
    toast.success(`${reg.name} registered · awaiting triage`)
    setReg({ name: '', age: '', gender: 'M', arrival: 'walk_in', chiefComplaint: '', trauma: false })
    setShowRegister(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <Ambulance className="h-6 w-6 text-red-600" /> Triage
          </h1>
          <p className="text-sm text-[#64748B] mt-1">Record vitals · AI-suggested ESI level · route to the treatment area</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {mci && (
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-700 ring-1 ring-red-300 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />MCI MODE
            </span>
          )}
          <button onClick={() => setShowRegister(s => !s)}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)', boxShadow: '0 2px 8px rgba(239,68,68,0.25)' }}>
            <UserPlus className="h-3.5 w-3.5" />Register arrival
          </button>
        </div>
      </div>

      {showRegister && (
        <div className="rounded-xl bg-white ring-1 ring-slate-200 p-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
            <input value={reg.name} onChange={e => setReg(r => ({ ...r, name: e.target.value }))} placeholder="Name *"
              className="sm:col-span-2 h-8 px-2 rounded-md border border-slate-200" />
            <input value={reg.age} onChange={e => setReg(r => ({ ...r, age: e.target.value }))} placeholder="Age" type="number"
              className="h-8 px-2 rounded-md border border-slate-200" />
            <select value={reg.gender} onChange={e => setReg(r => ({ ...r, gender: e.target.value as 'M' | 'F' | 'X' }))}
              className="h-8 px-2 rounded-md border border-slate-200">
              <option value="M">M</option><option value="F">F</option><option value="X">X</option>
            </select>
            <select value={reg.arrival} onChange={e => setReg(r => ({ ...r, arrival: e.target.value as Arrival }))}
              className="h-8 px-2 rounded-md border border-slate-200">
              <option value="walk_in">Walk-in</option><option value="ambulance">Ambulance</option><option value="transfer">Transfer</option>
            </select>
            <label className="flex items-center gap-1 text-[11px] font-semibold">
              <input type="checkbox" checked={reg.trauma} onChange={e => setReg(r => ({ ...r, trauma: e.target.checked }))} /> Trauma
            </label>
          </div>
          <input value={reg.chiefComplaint} onChange={e => setReg(r => ({ ...r, chiefComplaint: e.target.value }))} placeholder="Chief complaint *"
            className="w-full h-8 px-2 text-xs rounded-md border border-slate-200" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRegister(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
            <button onClick={submitRegister}
              className="text-xs font-bold text-white px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)' }}>Add to triage queue</button>
          </div>
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 w-fit">
        {([['awaiting', `Awaiting triage (${awaiting.length})`], ['triaged', `Triaged (${triaged.length})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={cn('px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition',
              tab === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>{label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {(tab === 'awaiting' ? awaiting : triaged).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Activity className="h-9 w-9 mb-2 opacity-40" />
            <p className="text-sm font-semibold">{tab === 'awaiting' ? 'Triage queue is clear' : 'No patients waiting for assignment'}</p>
          </div>
        )}
        {(tab === 'awaiting' ? awaiting : triaged).map(p => (
          <TriageRow key={p.id} p={p}
            expanded={expandedId === p.id}
            draft={getDraft(p.id)}
            onToggle={() => setExpandedId(id => id === p.id ? null : p.id)}
            onDraft={(patch) => setDraft(p.id, patch)}
            onSaveVitals={() => saveVitals(p)}
            onApplyESI={(level, reason) => applyESI(p, level, reason)}
          />
        ))}
      </div>
    </div>
  )
}

function TriageRow(props: {
  p: ERPatient
  expanded: boolean
  draft: Vitals
  onToggle: () => void
  onDraft: (patch: Partial<Vitals>) => void
  onSaveVitals: () => void
  onApplyESI: (level: ESIBand, reason: string) => void
}) {
  const { p, expanded, draft } = props
  const mins = minsSince(p.arrivedAt)
  const vitals = latestVitals(p)
  const news = vitals ? news2(vitals) : null
  const qs = vitals ? qsofa(vitals) : null
  const suggestion = vitals ? esiSuggest({ vitals, chiefComplaint: p.chiefComplaint, age: p.age, trauma: p.trauma }) : null
  const draftSuggestion = Object.keys(draft).length > 0
    ? esiSuggest({ vitals: draft, chiefComplaint: p.chiefComplaint, age: p.age, trauma: p.trauma }) : null

  return (
    <div className={cn('rounded-xl bg-white ring-1 overflow-hidden',
      news?.band === 'high' ? 'ring-red-200' : qs?.positive ? 'ring-orange-200' : 'ring-slate-200/70')}>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <span className={cn('flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg', ARRIVAL_STYLE[p.arrival])}>{ARRIVAL_LABEL[p.arrival]}</span>

        <button onClick={props.onToggle} className="flex-1 min-w-0 text-left cursor-pointer">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 truncate">{p.name}</span>
            <span className="text-[11px] font-bold text-slate-400">{p.age}{p.gender}</span>
            {p.trauma && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-0.5"><ShieldAlert className="h-3 w-3" />TRAUMA</span>}
            {p.esi && <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded', ESI_STYLE[p.esi].bg, ESI_STYLE[p.esi].fg)}>{ESI_STYLE[p.esi].label}</span>}
            {news && news.band !== 'low' && <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded',
              news.band === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>NEWS2 {news.score}</span>}
            {qs?.positive && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">qSOFA+ sepsis?</span>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1 flex-wrap">
            <span>{p.chiefComplaint}</span>
            <span className="text-slate-400 mx-1">·</span>
            <Clock className="h-3 w-3" />{mins}m in dept
          </p>
        </button>

        <button onClick={props.onToggle} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Record vitals</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <VitalInput label="RR" unit="/min" icon={Wind} value={draft.rr} onChange={v => props.onDraft({ rr: v })} />
              <VitalInput label="SpO2" unit="%" value={draft.spo2} onChange={v => props.onDraft({ spo2: v })} />
              <label className="flex items-center gap-1 text-[11px] font-semibold rounded-lg bg-white ring-1 ring-slate-200 px-2.5 py-2 cursor-pointer">
                <input type="checkbox" checked={!!draft.onOxygen} onChange={e => props.onDraft({ onOxygen: e.target.checked })} />
                On O2
              </label>
              <VitalInput label="SBP" unit="mmHg" icon={Heart} value={draft.sbp} onChange={v => props.onDraft({ sbp: v })} />
              <VitalInput label="HR" unit="bpm" icon={Heart} value={draft.hr} onChange={v => props.onDraft({ hr: v })} />
              <VitalInput label="Temp" unit="°C" step="0.1" icon={Thermometer} value={draft.temp} onChange={v => props.onDraft({ temp: v })} />
              <VitalInput label="GCS" unit="/15" value={draft.gcs} onChange={v => props.onDraft({ gcs: v })} />
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={props.onSaveVitals}
                className="text-[11px] font-bold text-white px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#EF4444,#F97316)' }}>
                Save vitals
              </button>
            </div>
          </div>

          {(news || qs || draftSuggestion) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {news && (
                <div className={cn('rounded-lg p-2.5 ring-1',
                  news.band === 'high' ? 'ring-red-200 bg-red-50' : news.band === 'medium' ? 'ring-amber-200 bg-amber-50' : 'ring-slate-200 bg-white')}>
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><Activity className="h-3 w-3" />NEWS2</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{news.score}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-3">{news.trigger}</p>
                </div>
              )}
              {qs && (
                <div className={cn('rounded-lg p-2.5 ring-1',
                  qs.positive ? 'ring-orange-200 bg-orange-50' : 'ring-slate-200 bg-white')}>
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><ShieldAlert className="h-3 w-3" />qSOFA</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{qs.score} {qs.positive && <span className="text-[10px] text-orange-700 font-bold">SEPSIS RISK</span>}</p>
                  <p className="text-[10px] text-slate-500">{qs.criteria.length ? qs.criteria.join(' · ') : 'No criteria met'}</p>
                </div>
              )}
              {(draftSuggestion ?? suggestion) && (
                <div className={cn('rounded-lg p-2.5 ring-1', 'ring-violet-200 bg-violet-50')}>
                  <p className="text-[11px] font-bold text-violet-700 flex items-center gap-1">AI ESI suggestion</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">ESI {(draftSuggestion ?? suggestion)!.level}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{(draftSuggestion ?? suggestion)!.reason}</p>
                </div>
              )}
            </div>
          )}

          {(suggestion || draftSuggestion) && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Apply ESI:</span>
              {([1, 2, 3, 4, 5] as ESIBand[]).map(lvl => {
                const sug = draftSuggestion ?? suggestion
                const isSuggested = sug && sug.level === lvl
                return (
                  <button key={lvl} onClick={() => props.onApplyESI(lvl, isSuggested ? sug!.reason : 'Manual triage')}
                    className={cn('text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer ring-1',
                      isSuggested ? `${ESI_STYLE[lvl].bg} ${ESI_STYLE[lvl].fg} ring-current` : 'bg-white ring-slate-200 text-slate-600 hover:bg-slate-50')}>
                    {ESI_STYLE[lvl].label}{isSuggested ? ' ★' : ''}
                  </button>
                )
              })}
              <Send className="h-3 w-3 text-slate-400 ml-auto" />
              <span className="text-[10px] text-slate-400">routes to {TREATMENT_AREAS.find(a => a.code === suggestArea(((draftSuggestion ?? suggestion)?.level ?? 5), p.trauma))?.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VitalInput({ label, unit, value, onChange, step = '1', icon: Icon }: {
  label: string; unit: string; value?: number; step?: string
  onChange: (v: number | undefined) => void
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-lg bg-white ring-1 ring-slate-200 px-2 py-1.5">
      <label className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </label>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="number" step={step}
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className="w-full text-sm font-bold text-slate-900 bg-transparent focus:outline-none"
        />
        <span className="text-[10px] text-slate-400">{unit}</span>
      </div>
    </div>
  )
}
