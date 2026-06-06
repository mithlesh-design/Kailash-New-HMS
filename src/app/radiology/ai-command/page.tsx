"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Sparkles, Siren, Activity, TrendingUp, Send, Bot, ArrowRight,
  AlertTriangle, Brain, Gauge, Clock,
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts"
import { useRadiologyStudiesStore, type RadiologyStudy, type AiFinding } from "@/store/useRadiologyStudiesStore"
import { PRIORITY_META, priorityRank } from "@/lib/radiologyCatalog"
import {
  detectFindings, forecastWorkload, opsAssistantAnswer, type OpsAnswer,
  isTatBreached, isCriticalText,
} from "@/lib/radiologyAI"
import { getConfidenceTier } from "@/lib/ai-helpers"
import { StatCard } from "@/components/ui/stat-card"
import { AiConfidenceBadge } from "@/components/ui/AiConfidenceBadge"
import { AiDisclaimer } from "@/components/ui/AiDisclaimer"
import { ClientOnly } from "@/components/ClientOnly"
import { cn } from "@/lib/utils"

// Studies that have been acquired have images → eligible for AI detection.
const POST_ACQUISITION = new Set(["acquired", "reading", "reported", "released"])

type QueueItem = { study: RadiologyStudy; findings: AiFinding[]; top: AiFinding; score: number }

const CAT_STYLE: Record<AiFinding["category"], { chip: string; label: string }> = {
  critical:   { chip: "bg-red-50 text-red-700 border-red-200", label: "Critical" },
  actionable: { chip: "bg-amber-50 text-amber-700 border-amber-200", label: "Actionable" },
  normal:     { chip: "bg-slate-50 text-slate-600 border-slate-200", label: "Normal" },
}

export default function AiCommandCenter() {
  const studies = useRadiologyStudiesStore(s => s.studies)
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState<OpsAnswer | null>(null)

  // AI Queue — derive findings deterministically for post-acquisition studies.
  const queue = useMemo<QueueItem[]>(() => {
    return studies
      .filter(s => POST_ACQUISITION.has(s.status))
      .map(study => {
        const findings = detectFindings(study).data
        const top = findings.find(f => f.category === "critical")
          ?? findings.find(f => f.category === "actionable")
          ?? findings[0]
        const critWeight = top?.category === "critical" ? 2 : top?.category === "actionable" ? 1 : 0
        const score = critWeight * 100 + (top?.confidence ?? 0) * 50 + priorityRank(study.priority) * 10
        return { study, findings, top, score }
      })
      .filter(q => q.top && q.top.category !== "normal")
      .sort((a, b) => b.score - a.score)
  }, [studies])

  const forecast = useMemo(() => forecastWorkload(studies), [studies])

  const criticalCount = queue.filter(q => q.top.category === "critical").length
  const avgConf = queue.length ? Math.round((queue.reduce((n, q) => n + q.top.confidence, 0) / queue.length) * 100) : 0

  const suggestions = [
    "Show CT studies delayed over 2 hours",
    "Which modality is causing most TAT breaches?",
    "List high no-show risk patients",
    "How many studies today?",
  ]
  const ask = (q: string) => { setQuery(q); setAnswer(opsAssistantAnswer(q, studies)) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#1E3A8A]/[0.08] text-[#1E3A8A]"><Sparkles className="h-5 w-5" /></span>
            <h1 className="text-2xl font-bold text-[#101828]">AI Command Center</h1>
          </div>
          <p className="text-sm text-[#667085] mt-1">High-risk AI queue · workload forecast · natural-language operations assistant</p>
        </div>
        <Link href="/radiology/critical" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] transition-colors">
          <Siren className="h-4 w-4" /> Critical Results
        </Link>
      </div>

      <AiDisclaimer />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="AI queue" value={queue.length} sub="studies flagged for review" icon={Brain} color="blue" />
        <StatCard label="Critical detections" value={criticalCount} sub="urgent AI findings" icon={Siren} color="red" />
        <StatCard label="Mean confidence" value={`${avgConf}%`} sub="across flagged studies" icon={Gauge} color="green" />
        <StatCard label="24h TAT risk" value={`${forecast.tatRiskPct}%`} sub="predicted breach pressure" icon={Clock} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* AI Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-[#EAECF2] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#EAECF2]">
            <Brain className="h-4 w-4 text-[#1E3A8A]" />
            <h3 className="text-sm font-bold text-slate-900">AI Queue — high-risk studies</h3>
            <span className="ml-auto text-[11px] font-semibold text-slate-400">sorted by urgency</span>
          </div>
          {queue.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No high-risk studies in the pipeline.</div>
          ) : (
            <div className="divide-y divide-[#F2F4F8]">
              {queue.map(({ study, top, findings }) => (
                <Link key={study.id} href="/radiology/reading"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                  <span className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border", CAT_STYLE[top.category].chip)}>
                    {top.category === "critical" ? <AlertTriangle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13.5px] font-bold text-slate-900 truncate">{top.label}</p>
                      <span className={cn("text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded border", PRIORITY_META[study.priority].badge)}>{study.priority}</span>
                      {findings.length > 1 && <span className="text-[10px] text-slate-400">+{findings.length - 1} more</span>}
                    </div>
                    <p className="text-[11.5px] text-slate-500 truncate">{study.patientName} · {study.name} · {study.status}</p>
                  </div>
                  <AiConfidenceBadge confidence={Math.round(top.confidence * 100)} tier={getConfidenceTier(top.confidence)} />
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right rail: forecast + assistant */}
        <div className="space-y-5">
          {/* Workload forecast */}
          <div className="rounded-2xl border border-[#EAECF2] bg-white shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[#0E9F6E]" />
              <h3 className="text-sm font-bold text-slate-900">AI Workload Forecast</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl bg-[#FBFCFE] border border-[#EAECF2] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Next 24h volume</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{forecast.next24hVolume}</p>
              </div>
              <div className="rounded-xl bg-[#FBFCFE] border border-[#EAECF2] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Staffing need</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{forecast.staffingNeed} <span className="text-xs font-medium text-slate-400">radiologists</span></p>
              </div>
            </div>
            <ClientOnly fallback={<div className="h-[120px]" />}>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={forecast.series} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={26} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11 }} />
                  <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
                    {forecast.series.map((_, i) => <Cell key={i} fill={i >= 3 && i <= 5 ? "#1E3A8A" : "#93B4FF"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
            <div className="mt-2 space-y-1">
              {forecast.byModality.map(m => (
                <div key={m.modality} className="flex items-center justify-between text-[11.5px]">
                  <span className="font-semibold text-slate-600">{m.modality}</span>
                  <span className="tabular-nums text-slate-500">{m.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ops assistant */}
          <div className="rounded-2xl border border-[#EAECF2] bg-white shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-[#1E3A8A]" />
              <h3 className="text-sm font-bold text-slate-900">AI Operations Assistant</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); if (query.trim()) ask(query) }} className="relative">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about TAT, modalities, no-shows…"
                aria-label="Ask the operations assistant"
                className="w-full h-10 pl-3.5 pr-10 rounded-xl text-[13px] bg-[#F8FAFC] border border-[#EAECF2] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
              <button type="submit" aria-label="Ask" className="absolute right-1.5 top-1.5 h-7 w-7 rounded-lg bg-[#1E3A8A] text-white flex items-center justify-center hover:bg-[#172E6E] cursor-pointer">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {suggestions.map(s => (
                <button key={s} onClick={() => ask(s)}
                  className="text-[10.5px] font-medium text-[#475467] bg-white border border-[#EAECF2] rounded-full px-2.5 py-1 hover:border-[#2563EB] hover:text-[#1E3A8A] transition-colors cursor-pointer">
                  {s}
                </button>
              ))}
            </div>
            {answer && (
              <div className="mt-3 rounded-xl bg-[#F5F8FF] border border-[#2563EB]/15 p-3">
                <p className="text-[12.5px] font-semibold text-slate-800">{answer.text}</p>
                {answer.rows && answer.rows.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {answer.rows.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-[11.5px] border-t border-blue-100/60 pt-1 first:border-0 first:pt-0">
                        <span className="text-slate-600 truncate pr-2">{r.label}</span>
                        <span className="font-bold text-[#1E3A8A] tabular-nums flex-shrink-0">{r.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Simulated analytics over live study data · verify before acting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
