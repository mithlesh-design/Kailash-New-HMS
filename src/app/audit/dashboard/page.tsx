"use client"

import { motion } from "framer-motion"
import { useAuditStore } from "@/store/useAuditStore"
import { ShieldCheck, Activity, FileText, ThumbsUp, ClipboardList } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from "recharts"

export default function AuditDashboard() {
  const { entries } = useAuditStore()
  const recentEntries  = entries.slice(0, 10)
  const hitlDecisions  = entries.filter((e) => e.action.startsWith('hitl_')).length
  const feedbackVotes  = entries.filter((e) => e.action.startsWith('ai_feedback_')).length
  const clinicalOrders = entries.filter((e) => ['prescription_create', 'lab_order', 'radiology_order'].includes(e.action)).length

  const complianceScore = Math.min(100, 70 + Math.round((hitlDecisions + clinicalOrders) * 2))

  const chartData = [
    { name: 'Compliance', value: complianceScore, fill: complianceScore >= 85 ? '#16A34A' : complianceScore >= 70 ? '#D97706' : '#DC2626' },
  ]

  return (
    <div className="space-y-6 pt-6">
      <PageHeader
        title="Audit & Compliance Dashboard"
        subtitle="Audit trail, HITL decisions, and AI feedback overview"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="HITL Decisions"   value={hitlDecisions}   icon={ClipboardList} color="green"  delay={0} />
        <StatCard label="Total Events"      value={entries.length}  icon={Activity}      color="slate"  delay={0.05} />
        <StatCard label="AI Feedback Votes" value={feedbackVotes}   icon={ThumbsUp}      color="purple" delay={0.1} />
        <StatCard label="Clinical Orders"   value={clinicalOrders}  icon={FileText}      color="blue"   delay={0.15} />
      </div>

      {/* Compliance Score Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center">
          <h3 className="font-bold text-slate-800 mb-2 self-start">Compliance Score</h3>
          <div className="relative w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="90%"
                data={chartData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar dataKey="value" background={{ fill: '#F1F5F9' }} cornerRadius={8} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingTop: '40px' }}>
              <p className="text-4xl font-black text-slate-900">{complianceScore}%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {complianceScore >= 85 ? 'Excellent' : complianceScore >= 70 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" /> Recent Audit Events
          </h3>
          {recentEntries.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No audit events yet"
              description="Events are captured as users interact with clinical features"
            />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm capitalize">{entry.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">
                      {entry.userName} · {entry.resource}
                      {entry.resourceId ? ` (${entry.resourceId})` : ''}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
