"use client"

import { useState } from "react"
import { generateHandoverBrief } from "@/ai-services/handover-brief"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import type { HandoverBrief } from "@/ai-services/handover-brief"
import type { AiEnvelope } from "@/types/ai"
import { Bot, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function NurseHandover() {
  const [brief, setBrief] = useState<AiEnvelope<HandoverBrief> | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const result = await generateHandoverBrief('GENERAL-WARD')
    setBrief(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Handover Brief</h2>
          <p className="text-slate-500 text-sm mt-1">AI-generated SBAR handover brief with HITL review</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          Generate Handover Brief
        </button>
      </div>

      {brief && (
        <HitlReviewCard
          envelope={brief}
          title="AI Handover Brief — SBAR Format"
          featureId="nurse-handover-brief"
          renderContent={(data) => (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Outgoing: <span className="font-semibold text-slate-700">{data.outgoingNurse}</span></span>
                <span>→</span>
                <span>Incoming: <span className="font-semibold text-slate-700">{data.incomingNurse}</span></span>
              </div>
              {data.patients.map((p) => (
                <div key={p.patientId} className={`p-3 rounded-xl border ${p.urgencyFlag ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-900">{p.name} — {p.bed}</p>
                    {p.urgencyFlag && <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{p.urgencyFlag}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-bold text-slate-600">S:</span> {p.situation}</div>
                    <div><span className="font-bold text-slate-600">B:</span> {p.background}</div>
                    <div><span className="font-bold text-slate-600">A:</span> {p.assessment}</div>
                    <div><span className="font-bold text-slate-600">R:</span> {p.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          onAccept={() => toast.success('Handover brief accepted and documented')}
          onReject={() => setBrief(null)}
        />
      )}

      {!brief && !loading && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
          <Bot className="h-8 w-8 mx-auto mb-3" />
          <p className="font-medium">Click &quot;Generate Handover Brief&quot; to create an AI SBAR summary</p>
          <p className="text-xs mt-1">Compiled from nursing documentation and active care plans</p>
        </div>
      )}
    </div>
  )
}
