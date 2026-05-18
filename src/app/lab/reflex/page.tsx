"use client"

import { useState } from "react"
import { suggestReflexTests } from "@/ai-services/reflex-test"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import type { ReflexSuggestion } from "@/ai-services/reflex-test"
import type { AiEnvelope } from "@/types/ai"
import { Bot, Loader2, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function LabReflex() {
  const [suggestions, setSuggestions] = useState<AiEnvelope<ReflexSuggestion[]> | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    const result = await suggestReflexTests({ WBC: 18200, Temp: 38.9, Lactate: 2.1 })
    setSuggestions(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reflex Testing</h2>
          <p className="text-slate-500 text-sm mt-1">AI-suggested follow-up tests based on lab result patterns</p>
        </div>
        <button onClick={run} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          Run Reflex Analysis
        </button>
      </div>

      {suggestions && (
        <HitlReviewCard
          envelope={suggestions}
          title="AI Reflex Test Suggestions"
          featureId="lab-reflex-suggest"
          renderContent={(data) => (
            <div className="space-y-2">
              {data.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Zap className={`h-5 w-5 flex-shrink-0 mt-0.5 ${s.urgency === 'STAT' ? 'text-red-500' : 'text-slate-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{s.testName}</p>
                      <Badge variant={s.urgency === 'STAT' ? 'danger' : 'muted'} size="sm">{s.urgency}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5"><span className="font-semibold">Trigger:</span> {s.triggerCondition}</p>
                    <p className="text-xs text-slate-500">{s.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          onAccept={() => toast.success('Reflex tests ordered')}
          onReject={() => setSuggestions(null)}
        />
      )}

      {!suggestions && !loading && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
          <Bot className="h-8 w-8 mx-auto mb-3" />
          <p className="font-medium">Click &quot;Run Reflex Analysis&quot; to get AI-suggested follow-up tests</p>
          <p className="text-xs mt-1">Analysis based on current lab results and clinical context</p>
        </div>
      )}
    </div>
  )
}
