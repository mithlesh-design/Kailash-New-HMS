"use client"

import { useState } from "react"
import { useDietaryStore } from "@/store/useDietaryStore"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import { suggestDietPlan } from "@/ai-services/diet-plan"
import type { AiEnvelope } from "@/types/ai"
import type { DietPlan } from "@/store/useDietaryStore"
import { Bot, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type DietPlanEnvelope = AiEnvelope<Omit<DietPlan, 'id' | 'ward' | 'bedNumber' | 'startDate'>>

export default function DietaryPlans() {
  const { dietPlans, addPlan } = useDietaryStore()
  const [aiResult, setAiResult] = useState<DietPlanEnvelope | null>(null)
  const [loading, setLoading] = useState(false)

  const runAi = async () => {
    setLoading(true)
    const result = await suggestDietPlan('PT-20394')
    setAiResult(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Diet Plans</h2>
          <p className="text-slate-500 text-sm mt-1">AI-assisted diet planning with HITL review</p>
        </div>
        <button
          onClick={runAi}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          Generate AI Diet Plan
        </button>
      </div>

      {aiResult && (
        <HitlReviewCard
          envelope={aiResult}
          title="AI-Suggested Diet Plan"
          featureId="diet-plan-suggest"
          renderContent={(data) => (
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Patient:</span> {data.patientName}</p>
              <p><span className="font-semibold">Diet Type:</span> {data.dietType}</p>
              <p><span className="font-semibold">Target Calories:</span> {data.calorieTarget} kcal/day</p>
              {data.notes && <p className="text-slate-600 italic">{data.notes}</p>}
            </div>
          )}
          onAccept={(data) => addPlan({ ...data, ward: 'General Ward', bedNumber: 'G-12', startDate: new Date().toISOString().split('T')[0]! })}
          onReject={() => setAiResult(null)}
        />
      )}

      <div className="space-y-3">
        {dietPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{plan.patientName}</p>
                  {plan.aiGenerated && <Badge variant="primary" size="sm">AI</Badge>}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{plan.dietType} · {plan.calorieTarget} kcal · {plan.ward} · {plan.bedNumber}</p>
                {plan.notes && <p className="text-xs text-slate-500 mt-1 italic">{plan.notes}</p>}
              </div>
              <p className="text-xs text-slate-400">Since {plan.startDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
