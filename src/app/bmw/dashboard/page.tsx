"use client"

import { motion } from "framer-motion"
import { useBMWStore } from "@/store/useBMWStore"
import { AlertTriangle, CheckCircle2, Scale, Trash2 } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/PageHeader"

const CATEGORY_COLORS: Record<string, string> = {
  Yellow:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  Red:      'bg-red-100    text-red-800    border-red-200',
  Blue:     'bg-blue-100   text-blue-800   border-blue-200',
  Black:    'bg-slate-200  text-slate-800  border-slate-300',
  White:    'bg-slate-50   text-slate-700  border-slate-200',
  Cytotoxic:'bg-purple-100 text-purple-800 border-purple-200',
}

const STATUS_BADGE: Record<string, { variant: "success" | "warning" | "danger" }> = {
  disposed:      { variant: "success" },
  pending:       { variant: "warning" },
  non_compliant: { variant: "danger" },
}

export default function BMWDashboard() {
  const { wasteLogs, todaySummary } = useBMWStore()
  const summary       = todaySummary()
  const totalKg       = Object.values(summary).reduce((a, b) => a + b, 0)
  const pending       = wasteLogs.filter((l) => l.status === 'pending').length
  const nonCompliant  = wasteLogs.filter((l) => l.status === 'non_compliant').length
  const disposed      = wasteLogs.filter((l) => l.status === 'disposed').length

  return (
    <div className="space-y-6 pt-6">
      <PageHeader
        title="Bio-Medical Waste Dashboard"
        subtitle="Daily waste management and compliance tracking"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Today (kg)"    value={totalKg.toFixed(1)}  icon={Scale}        color="slate"  delay={0} />
        <StatCard label="Pending Collection"  value={pending}             icon={AlertTriangle} color="amber"  delay={0.05} />
        <StatCard label="Non-Compliant"       value={nonCompliant}        icon={AlertTriangle} color="red"    delay={0.1} />
        <StatCard label="Disposed Today"      value={disposed}            icon={CheckCircle2}  color="green"  delay={0.15} />
      </div>

      {/* Waste by Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-4">Today&apos;s Waste by Category</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(summary).map(([cat, kg], i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-xl border text-center ${CATEGORY_COLORS[cat] ?? 'bg-slate-50 border-slate-200'}`}
            >
              <p className="text-xs font-bold">{cat}</p>
              <p className="text-xl font-black mt-1">{kg.toFixed(1)}</p>
              <p className="text-[10px] mt-0.5">kg</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Waste Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-slate-500" /> Waste Log (Today)
        </h3>
        <div className="space-y-2">
          {wasteLogs.slice(0, 6).map((log, i) => {
            const sb = STATUS_BADGE[log.status] ?? { variant: "muted" as const }
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {log.status === 'disposed'      && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                  {log.status === 'non_compliant' && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                  {log.status === 'pending'       && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{log.ward} — {log.category}</p>
                    <p className="text-xs text-slate-500">
                      {log.weightKg}kg · {log.bagCount} bags · {new Date(log.collectedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge variant={sb.variant}>{log.status.replace('_', ' ').toUpperCase()}</Badge>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
