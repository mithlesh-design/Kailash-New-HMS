"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Users, AlertTriangle, Sparkles, RefreshCw, Send, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import { suggestRecallCohorts, type RecallCohortReport } from "@/ai-services/suggest-recall-cohorts"
import type { AiEnvelope } from "@/types/ai"

const HBA1C_DATA = [
  { range: '<7%', count: 34, color: '#22c55e' },
  { range: '7–8%', count: 52, color: '#f59e0b' },
  { range: '8–9%', count: 31, color: '#f97316' },
  { range: '>9%', count: 25, color: '#ef4444' },
]

const BP_DATA = [
  { range: '<130/80', count: 41, color: '#22c55e' },
  { range: '130–140', count: 28, color: '#f59e0b' },
  { range: '140–160', count: 15, color: '#f97316' },
  { range: '>160', count: 5, color: '#ef4444' },
]

const RISK_COLOR = { low: 'bg-blue-50 border-blue-200 text-blue-700', medium: 'bg-amber-50 border-amber-200 text-amber-700', high: 'bg-red-50 border-red-200 text-red-700' }

export default function RegistriesPage() {
  const [recallEnvelope, setRecallEnvelope] = useState<AiEnvelope<RecallCohortReport> | null>(null)
  const [loading, setLoading] = useState(false)
  const [sentCampaigns, setSentCampaigns] = useState<Set<string>>(new Set())

  const runRecallAnalysis = async () => {
    setLoading(true)
    try {
      const result = await suggestRecallCohorts({})
      setRecallEnvelope(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <NeonBadge variant="blue" className="mb-2"><Users className="h-3 w-3" /> Disease Registries</NeonBadge>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Longitudinal Care Registries</h2>
          <p className="text-sm text-slate-500 mt-1">Cohort performance, recall management, and AI-driven follow-up campaigns</p>
        </div>
        <button
          onClick={runRecallAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analysing…' : 'Run AI Recall Analysis'}
        </button>
      </motion.div>

      {/* Registry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-bold text-slate-900 mb-1">HbA1c Control — Diabetes Registry (142 patients)</h3>
          <p className="text-xs text-slate-500 mb-4">Target: HbA1c &lt; 7%</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={HBA1C_DATA} barCategoryGap="30%">
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {HBA1C_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-green-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">34</p>
              <p className="text-xs text-green-600">Controlled (&lt;7%)</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-red-700">56</p>
              <p className="text-xs text-red-600">Above target (≥8%)</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-slate-900 mb-1">BP Control — Hypertension Registry (89 patients)</h3>
          <p className="text-xs text-slate-500 mb-4">Target: &lt;130/80 mmHg</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={BP_DATA} barCategoryGap="30%">
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {BP_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-green-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-green-700">41</p>
              <p className="text-xs text-green-600">Controlled</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-orange-700">20</p>
              <p className="text-xs text-orange-600">Above target</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recall cohorts */}
      {recallEnvelope && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Recall Cohorts — {recallEnvelope.data.totalPatientsAtRisk} patients overdue</h3>
          </div>

          {recallEnvelope.data.cohorts.map(cohort => (
            <Card key={cohort.cohortId} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{cohort.condition}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${RISK_COLOR[cohort.riskLevel]}`}>
                      {cohort.riskLevel} risk
                    </span>
                    {recallEnvelope.data.priorityCohort === cohort.cohortId && (
                      <NeonBadge variant="danger" dot>Priority</NeonBadge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{cohort.patientCount} total · <span className="text-red-600 font-semibold">{cohort.overdueForFollowup} overdue</span> · avg {cohort.avgDaysSinceLastVisit} days since visit</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Suggested message</p>
                <p className="text-sm text-slate-700 italic">&ldquo;{cohort.suggestedMessage}&rdquo;</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{cohort.recommendedAction}</p>
                <button
                  onClick={() => setSentCampaigns(s => new Set([...s, cohort.cohortId]))}
                  disabled={sentCampaigns.has(cohort.cohortId)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    sentCampaigns.has(cohort.cohortId)
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {sentCampaigns.has(cohort.cohortId)
                    ? <><RefreshCw className="h-3.5 w-3.5" /> Sent</>
                    : <><Send className="h-3.5 w-3.5" /> Send Campaign</>
                  }
                </button>
              </div>
            </Card>
          ))}

          <HitlReviewCard
            title="AI Recall Cohort Analysis"
            envelope={recallEnvelope}
            featureId="recall_cohorts"
            renderContent={() => null}
            onAccept={() => {}}
            onReject={() => {}}
          />
        </div>
      )}

      {!recallEnvelope && !loading && (
        <Card className="p-10 text-center">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Run AI analysis to identify cohorts overdue for recall and generate campaign messages.</p>
          <button
            onClick={runRecallAnalysis}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg mx-auto hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" /> Analyse Cohorts <ChevronRight className="h-4 w-4" />
          </button>
        </Card>
      )}
    </div>
  )
}
