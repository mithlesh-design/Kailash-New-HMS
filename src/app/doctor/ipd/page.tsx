"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { HeartPulse, Stethoscope, AlarmClock } from "lucide-react"
import { useInpatientStore, nextRound, isRoundDue, type Inpatient, type Condition } from "@/store/useInpatientStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { ipdInsights } from "@/lib/earlyWarning"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { InpatientRow } from "@/components/doctor/ipd/InpatientRow"
import { QuickPeekDrawer } from "@/components/doctor/ipd/QuickPeekDrawer"
import { IpdActionModal, type IpdModalKind } from "@/components/doctor/ipd/ipdModals"
import { type IpdAction } from "@/components/doctor/ipd/ActionsMenu"
import { RoundModal } from "@/components/doctor/ipd/panels"
import { ClientOnly } from "@/components/ClientOnly"
import { CompactHeader } from "@/components/ui/CompactHeader"
import { CompactKPI, CompactKPIStrip } from "@/components/ui/CompactKPI"
import { EarlyWarningBanner } from "@/components/clinical/EarlyWarningBanner"

const CONDITION_TINT: Record<Condition, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200', Serious: 'bg-orange-50 text-orange-700 border-orange-200',
  Stable: 'bg-blue-50 text-blue-700 border-blue-200', Improving: 'bg-green-50 text-green-700 border-green-200',
  'Discharge-ready': 'bg-teal-50 text-teal-700 border-teal-200',
}
function dueLabel(ip: Inpatient): { text: string; due: boolean } {
  const n = nextRound(ip)
  if (!n) return { text: 'No round scheduled', due: false }
  const mins = Math.round((new Date(n.scheduledAt).getTime() - Date.now()) / 60000)
  if (mins <= 0) return { text: `Round due ${mins < -60 ? `${Math.round(-mins / 60)}h ago` : 'now'}`, due: true }
  return { text: mins >= 60 ? `Next round in ~${Math.floor(mins / 60)}h ${mins % 60}m` : `Next round in ~${mins}m`, due: false }
}

export default function DoctorIpd() {
  const router = useRouter()
  const inpatients = useInpatientStore(s => s.inpatients)
  const initiateDischarge = useInpatientStore(s => s.initiateDischarge)

  const [roundFor, setRoundFor] = useState<Inpatient | null>(null)
  const [peekId, setPeekId] = useState<string | null>(null)
  const [modal, setModal] = useState<{ kind: IpdModalKind; id: string } | null>(null)

  const byId = (id: string | null | undefined) => inpatients.find(i => i.patientId === id) ?? null
  const peek = byId(peekId)
  const modalPatient = byId(modal?.id)

  const active = inpatients.filter(i => i.stage !== 'discharged')
  const due = active.filter(isRoundDue)

  // Early-warning: push high-risk / overdue-round patients into the inbox (once,
  // after store rehydration; deduped by patient + title so reloads don't pile up).
  useEffect(() => {
    const t = setTimeout(() => {
      const store = useNotificationStore.getState()
      inpatients.filter(i => i.stage !== 'discharged').forEach(ip => {
        const ins = ipdInsights(ip)
        const overdue = isRoundDue(ip)
        if (ins.risk !== 'high' && !overdue) return
        const title = ins.risk === 'high' ? 'Deterioration risk' : 'Round overdue'
        if (store.notifications.some(n => n.patientName === ip.name && n.title === title)) return
        store.add({ type: 'system', priority: ins.risk === 'high' ? 'critical' : 'high', title, body: `${ip.name} (${ip.ward} · ${ip.bed}) — ${ins.flag}`, channels: ['in_app'], targetRole: 'doctor', patientName: ip.name })
      })
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAction = (id: string, a: IpdAction) => {
    setPeekId(null)
    if (a === 'round') { setRoundFor(byId(id)); return }
    if (a === 'chart') { router.push(`/doctor/ipd/${id}`); return }
    if (a === 'discharge') {
      const ip = byId(id)
      if (ip && !ip.discharge && ip.stage !== 'discharged') initiateDischarge(id)
      router.push(`/doctor/ipd/${id}`)
      toast.success('Discharge started — complete clearance in the chart')
      return
    }
    setModal({ kind: a as IpdModalKind, id })
  }

  // ── M2: compact KPI tallies (computed from `active`) ──
  const criticalCount = active.filter((ip) => ip.condition === 'Critical').length
  const dischargeReady = active.filter((ip) => ip.condition === 'Discharge-ready').length

  return (
    <div className="pb-6">
      {/* M2 — Compact header: title row, KPI strip, single primary action */}
      <CompactHeader
        title="IPD / Inpatients"
        subtitle={`${active.length} admitted · rounds auto-scheduled by acuity (Critical 4h · Stable 12h)`}
        side={
          <CompactKPIStrip>
            <CompactKPI label="Rounds due"      value={due.length}      tone={due.length > 0 ? 'warn' : 'neutral'} />
            <CompactKPI label="Critical"        value={criticalCount}    tone={criticalCount > 0 ? 'danger' : 'neutral'} />
            <CompactKPI label="Discharge ready" value={dischargeReady}   tone={dischargeReady > 0 ? 'ok' : 'neutral'} />
          </CompactKPIStrip>
        }
      />

      <ClientOnly fallback={<div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-12 flex items-center justify-center"><div className="h-7 w-7 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" role="status" aria-label="Loading inpatients" /></div>}>

      {/* M4-W1 — S2: NEWS2 ambient watcher. Renders a banner per inpatient
          whose most-recent vital crosses the NEWS2 threshold. Silent below. */}
      <div className="space-y-2 mb-4">
        {active.map((ip) => {
          const v = (ip.vitals ?? []).slice().sort((a, b) => b.at.localeCompare(a.at))[0]
          if (!v) return null
          return (
            <EarlyWarningBanner
              key={'ew-' + ip.patientId}
              patientId={ip.patientId}
              patientName={ip.name}
              vitals={{ hr: v.hr, rr: v.rr, sbp: v.systolicBP, dbp: v.diastolicBP, temp: v.temp, spo2: v.spo2 }}
              onEscalate={() => router.push(`/doctor/ipd/${ip.patientId}`)}
            />
          )
        })}
      </div>

      {/* Rounds due */}
      <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 mb-5">
        <h3 className="text-[14px] font-bold text-amber-900 mb-2.5 flex items-center gap-2"><AlarmClock className="h-4.5 w-4.5 text-amber-500" /> Rounds due {due.length > 0 && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800">{due.length}</span>}</h3>
        {due.length === 0 ? (
          <p className="text-[13px] text-slate-500 bg-white rounded-xl p-3">No rounds due right now — all caught up.</p>
        ) : (
          <div className="space-y-2">
            {due.map(ip => (
              <div key={ip.patientId} className="flex items-center gap-3 rounded-xl bg-white border border-amber-200 p-3">
                <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0", ip.condition === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600')}><HeartPulse className="h-4.5 w-4.5" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-slate-900 truncate">{ip.name} <span className={cn("ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border", CONDITION_TINT[ip.condition])}>{ip.condition}</span></p>
                  <p className="text-[11.5px] text-slate-500 truncate">{ip.ward} · Bed {ip.bed} · {dueLabel(ip).text}</p>
                </div>
                <button onClick={() => setRoundFor(ip)} className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-bold flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition">
                  <Stethoscope className="h-3.5 w-3.5" /> Start round
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inpatient list — one row per patient, actions in the kebab menu */}
      <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06),0_4px_16px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['Patient', 'Bed / Ward', 'Condition', 'Stage', 'Next round', 'AI flag', ''].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map(ip => {
                const ins = ipdInsights(ip)
                return <InpatientRow key={ip.patientId} ip={ip} aiFlag={{ text: ins.flag, tone: ins.risk }} onPeek={() => setPeekId(ip.patientId)} onAction={(a) => handleAction(ip.patientId, a)} />
              })}
            </tbody>
          </table>
        </div>
        {active.length === 0 && <p className="text-[13px] text-slate-400 p-8 text-center">No admitted patients.</p>}
      </div>
      </ClientOnly>

      {/* Quick-peek drawer (glance) */}
      <AnimatePresence>
        {peek && <QuickPeekDrawer ip={peek} aiInsight={`${ipdInsights(peek).flag}. ${ipdInsights(peek).actions[0]}`} onClose={() => setPeekId(null)} onRound={() => { setPeekId(null); setRoundFor(peek) }} onOpenChart={() => { setPeekId(null); router.push(`/doctor/ipd/${peek.patientId}`) }} />}
      </AnimatePresence>

      {/* Action modals (add/stop med, order test, refer, ICU, OT, diet) */}
      <AnimatePresence>
        {modal && modalPatient && <IpdActionModal kind={modal.kind} patient={modalPatient} onClose={() => setModal(null)} />}
      </AnimatePresence>

      {/* Round modal */}
      <AnimatePresence>{roundFor && <RoundModal ip={roundFor} onClose={() => setRoundFor(null)} />}</AnimatePresence>
    </div>
  )
}
