"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BrainCircuit, Activity, AlertCircle } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import type { Patient } from "@/store/usePatientStore"
import { useState, useEffect } from "react"

export function AiPreBrief({ patient }: { patient: Patient }) {
  const [analyzing, setAnalyzing] = useState(true)

  useEffect(() => {
    setAnalyzing(true)
    const t = setTimeout(() => setAnalyzing(false), 1200)
    return () => clearTimeout(t)
  }, [patient.id])

  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200 shadow-sm">
            <BrainCircuit className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 tracking-tight">AI Pre-Consultation Brief</h3>
            <p className="text-[11px] font-semibold text-purple-600/70 uppercase tracking-wider mt-0.5">Auto-generated summary</p>
          </div>
        </div>
        <NeonBadge variant="purple" dot pulse={analyzing}>
          {analyzing ? "Analyzing Data..." : "Ready"}
        </NeonBadge>
      </div>

      <div className="p-5 relative min-h-[120px]">
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px]"
            >
              <Sparkles className="h-6 w-6 text-purple-400 animate-pulse mb-3" />
              <div className="space-y-2 w-3/4 max-w-sm">
                <div className="h-2 w-full rounded-full bg-purple-100 shimmer" />
                <div className="h-2 w-5/6 rounded-full bg-purple-100 shimmer" />
                <div className="h-2 w-4/6 rounded-full bg-purple-100 shimmer" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                <span className="font-bold text-slate-900">Summary:</span> Patient presents with{" "}
                <span className="text-purple-700 font-bold bg-purple-100/50 px-1 rounded">{patient.symptoms.join(', ')}</span>.
                Vitals indicate elevated temperature and pulse rate. No significant past medical history.
              </p>
              
              <div className="flex gap-3 mt-4">
                <div className="flex-1 rounded-lg border border-orange-100 bg-orange-50/50 p-3 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-900 mb-1">Key Flags</p>
                    <p className="text-xs font-medium text-orange-700/80">Sustained fever &gt; 101°F for 3 days.</p>
                  </div>
                </div>
                <div className="flex-1 rounded-lg border border-blue-100 bg-blue-50/50 p-3 flex items-start gap-3">
                  <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900 mb-1">Recommended</p>
                    <p className="text-xs font-medium text-blue-700/80">Check CBC & Dengue Serology.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
