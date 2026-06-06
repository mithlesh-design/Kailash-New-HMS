"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type StatColor = "blue" | "green" | "amber" | "red" | "purple" | "slate" | "teal"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: { value: string; up: boolean }
  icon: React.ElementType
  color?: StatColor
  delay?: number
  onClick?: () => void
}

// Values render in neutral ink (enterprise-minimal); the icon chip carries the
// accent. Brand tones (blue/purple/teal/slate) collapse to the deep-blue system;
// status tones (green/amber/red) stay semantic.
const COLOR_MAP: Record<StatColor, { icon: string; value: string }> = {
  blue:   { icon: "bg-[#1E3A8A] text-white", value: "text-slate-900" },
  green:  { icon: "bg-green-600 text-white", value: "text-slate-900" },
  amber:  { icon: "bg-amber-500 text-white", value: "text-slate-900" },
  red:    { icon: "bg-red-600 text-white",   value: "text-slate-900" },
  purple: { icon: "bg-[#1E3A8A] text-white", value: "text-slate-900" },
  slate:  { icon: "bg-slate-700 text-white", value: "text-slate-900" },
  teal:   { icon: "bg-[#2563EB] text-white", value: "text-slate-900" },
}

export function StatCard({ label, value, sub, trend, icon: Icon, color = "blue", delay = 0, onClick }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-[#EAECF2] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[#D0D5DD]",
        onClick && "cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
          <p className={cn("text-2xl font-bold", c.value)}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold mt-2 px-1.5 py-0.5 rounded-md",
              trend.up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0", c.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}
