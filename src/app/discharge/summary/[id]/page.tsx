"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { generateDischargeSummary } from "@/ai-services/discharge-summary"
import type { DischargeSummary } from "@/ai-services/discharge-summary"
import type { AiEnvelope } from "@/types/ai"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import { Loader2, Pill, CalendarCheck, AlertTriangle, Utensils, Activity, Droplets, FlaskConical, ScanLine, TrendingUp, TrendingDown, Minus, User, Languages } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ViewMode = 'clinical' | 'patient' | 'hindi'

const TREND_CONFIG = {
  improving: { icon: TrendingUp, color: 'text-green-600' },
  stable: { icon: Minus, color: 'text-slate-500' },
  worsening: { icon: TrendingDown, color: 'text-red-600' },
}

function ClinicalView({ d }: { d: DischargeSummary }) {
  return (
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

      {d.otNotes && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">Surgical / OT Notes</p>
          <p className="text-xs text-slate-700">{d.otNotes}</p>
        </div>
      )}

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

      {/* Ward medications administered */}
      {d.wardMedicationsAdministered.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Pill className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ward Medications Administered</p>
          </div>
          <div className="space-y-1">
            {d.wardMedicationsAdministered.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                <span className="font-semibold text-slate-800">{m.name}</span>
                <span className="text-slate-500">{m.route} · {m.daysGiven}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IV Therapy log */}
      {d.ivTherapyLog.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Droplets className="h-3.5 w-3.5 text-blue-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">IV Therapy Log</p>
          </div>
          <div className="space-y-1">
            {d.ivTherapyLog.map((iv, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs">
                <span className="font-semibold text-slate-800">{iv.fluid}</span>
                <span className="text-slate-500">{iv.rate} · {iv.totalVolume}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab trends */}
      {d.labTrends.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-purple-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lab Result Trends</p>
          </div>
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  {['Test', 'On Admission', 'At Discharge', 'Trend'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wide text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {d.labTrends.map((lt, i) => {
                  const cfg = TREND_CONFIG[lt.trend]
                  const TrendIcon = cfg.icon
                  return (
                    <tr key={i} className="bg-white">
                      <td className="px-3 py-2 font-semibold text-slate-800">{lt.test}</td>
                      <td className="px-3 py-2 text-slate-600">{lt.onAdmission}</td>
                      <td className="px-3 py-2 text-slate-600">{lt.onDischarge}</td>
                      <td className="px-3 py-2">
                        <span className={cn("flex items-center gap-1 font-semibold", cfg.color)}>
                          <TrendIcon className="h-3 w-3" />
                          {lt.trend}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Imaging */}
      {d.imagingFindings && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ScanLine className="h-3.5 w-3.5 text-indigo-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Imaging Findings</p>
          </div>
          <p className="text-xs text-slate-700 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">{d.imagingFindings}</p>
        </div>
      )}

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
  )
}

function PatientView({ d, lang }: { d: DischargeSummary; lang: 'en' | 'hi' }) {
  const text = lang === 'hi' ? d.hindiSummary : d.patientFriendlySummary
  return (
    <div className="bg-white border border-green-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-200">
        <User className="h-4 w-4 text-green-600" />
        <span className="text-sm font-bold text-green-800">
          {lang === 'hi' ? 'रोगी सूचना पत्र (हिंदी)' : 'Patient Copy — Plain Language Summary'}
        </span>
      </div>
      <pre className="px-5 py-4 text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  )
}

export default function DischargeSummaryPage() {
  const params = useParams()
  const admissionId = (params?.id as string) ?? 'ADM-001'
  const [envelope, setEnvelope] = useState<AiEnvelope<DischargeSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('clinical')

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

  const VIEW_TABS: { key: ViewMode; label: string }[] = [
    { key: 'clinical', label: 'Clinical View' },
    { key: 'patient', label: 'Patient Copy' },
    { key: 'hindi', label: 'हिंदी' },
  ]

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Discharge Summary</h2>
        <p className="text-slate-500 text-sm mt-1">{admissionId} · AI draft — attending physician approval required</p>
      </div>

      {accepted ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CalendarCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 text-sm">Summary finalised — ready for patient handout</p>
              <p className="text-xs text-green-600 mt-0.5">Follow-up: {envelope.data.followUpDate}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Languages className="h-4 w-4" />
              <span className="text-xs font-semibold">Multi-language ready</span>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
            {VIEW_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer",
                  viewMode === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {viewMode === 'clinical' && (
            <div className="bg-white border shadow-sm rounded-xl p-5">
              <ClinicalView d={envelope.data} />
            </div>
          )}
          {viewMode === 'patient' && <PatientView d={envelope.data} lang="en" />}
          {viewMode === 'hindi' && <PatientView d={envelope.data} lang="hi" />}
        </div>
      ) : (
        <HitlReviewCard
          envelope={envelope}
          title="AI Discharge Summary Draft"
          featureId="discharge-summary"
          renderContent={(d) => <ClinicalView d={d} />}
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
