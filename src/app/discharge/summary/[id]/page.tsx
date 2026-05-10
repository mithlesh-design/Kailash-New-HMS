"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { generateDischargeSummary } from "@/ai-services/discharge-summary"
import type { DischargeSummary } from "@/ai-services/discharge-summary"
import type { AiEnvelope } from "@/types/ai"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import { Loader2, Pill, CalendarCheck, AlertTriangle, Utensils, Activity } from "lucide-react"
import { toast } from "sonner"

export default function DischargeSummaryPage() {
  const params = useParams()
  const admissionId = (params?.id as string) ?? 'ADM-001'
  const [envelope, setEnvelope] = useState<AiEnvelope<DischargeSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    generateDischargeSummary(admissionId).then((res) => {
      setEnvelope(res)
      setLoading(false)
    })
  }, [admissionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 pt-6">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400 mr-2" />
        <p className="text-slate-500">Generating discharge summary…</p>
      </div>
    )
  }

  if (!envelope) return null

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Discharge Summary</h2>
        <p className="text-slate-500 text-sm mt-1">{admissionId} · AI draft — attending physician approval required</p>
      </div>

      {accepted ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CalendarCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Summary finalised — ready for patient handout</p>
            <p className="text-xs text-green-600 mt-0.5">Follow-up: {envelope.data.followUpDate}</p>
          </div>
        </div>
      ) : (
        <HitlReviewCard
          envelope={envelope}
          title="AI Discharge Summary Draft"
          featureId="discharge-summary"
          renderContent={(d) => (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">Admission</p>
                  <p className="text-slate-700">{d.admissionDate}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-500 uppercase tracking-wide mb-1">Discharge</p>
                  <p className="text-slate-700">{d.dischargeDate}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Discharge Diagnosis</p>
                <p className="font-semibold text-slate-900">{d.dischargeDiagnosis}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Treatment Summary</p>
                <p className="text-slate-700 leading-relaxed">{d.treatmentSummary}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Procedures Done</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.proceduresDone.map((p, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">{p}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Condition at Discharge</p>
                <p className="text-slate-700">{d.conditionAtDischarge}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Pill className="h-3.5 w-3.5 text-slate-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Discharge Medications</p>
                </div>
                <div className="space-y-1.5">
                  {d.dischargeMedications.map((med, i) => (
                    <div key={i} className="flex items-start justify-between p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs">
                      <span className="font-semibold text-slate-800">{med.name}</span>
                      <span className="text-slate-600 text-right ml-2">{med.dose} · {med.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CalendarCheck className="h-3.5 w-3.5 text-slate-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Follow-Up Instructions</p>
                </div>
                <ul className="space-y-1">
                  {d.followUpInstructions.map((f, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />{f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-semibold text-blue-700 mt-1.5">Next visit: {d.followUpDate}</p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700 mb-1">Warning — Return Immediately If:</p>
                  <ul className="space-y-0.5">
                    {d.warningSymptoms.map((w, i) => (
                      <li key={i} className="text-xs text-red-600">• {w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Utensils className="h-3.5 w-3.5 text-slate-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Diet</p>
                  </div>
                  <p className="text-xs text-slate-700">{d.dietAdvice}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity className="h-3.5 w-3.5 text-slate-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Activity</p>
                  </div>
                  <p className="text-xs text-slate-700">{d.activityRestrictions}</p>
                </div>
              </div>
            </div>
          )}
          onAccept={() => {
            setAccepted(true)
            toast.success('Discharge summary finalised — ready for print')
          }}
          onReject={() => {
            setEnvelope(null)
            setLoading(true)
            generateDischargeSummary(admissionId).then((res) => {
              setEnvelope(res)
              setLoading(false)
            })
            toast.info('Regenerating summary…')
          }}
        />
      )}
    </div>
  )
}
