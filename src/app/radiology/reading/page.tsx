"use client"

import { useMemo, useState } from "react"
import {
  FileText, Bed, Stethoscope, ChevronDown, ChevronRight, Hand, Send, Sparkles,
  Image as ImageIcon, Clock, ShieldAlert,
} from "lucide-react"
import {
  useRadiologyStudiesStore,
  type RadiologyStudy, type RadTech,
} from "@/store/useRadiologyStudiesStore"
import { RADIOLOGY_CATALOG, TEMPLATE_SECTIONS, type Priority } from "@/lib/radiologyCatalog"
import { useAuthStore } from "@/store/useAuthStore"
import { notifyAndAudit } from "@/lib/notifyAndAudit"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const PRIORITY_STYLE: Record<Priority, string> = {
  STAT: "bg-red-100 text-red-700", Urgent: "bg-amber-100 text-amber-700", Routine: "bg-slate-100 text-slate-600",
}

const timeAgo = (iso?: string) => {
  if (!iso) return ""
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.round(mins / 60)}h ago`
}

export default function ReadingRoom() {
  const studies = useRadiologyStudiesStore(s => s.studies)
  const claimReading = useRadiologyStudiesStore(s => s.claimReading)
  const setAIPrelim = useRadiologyStudiesStore(s => s.setAIPrelim)
  const updateReportSection = useRadiologyStudiesStore(s => s.updateReportSection)
  const submitReport = useRadiologyStudiesStore(s => s.submitReport)
  const currentUser = useAuthStore(s => s.currentUser)
  const me: RadTech = { id: currentUser?.id ?? "RAD-304", name: currentUser?.name ?? "Radiologist" }

  const [scope, setScope] = useState<"all" | "mine">("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = useMemo(() => {
    return studies
      .filter(s => s.status === "acquired" || s.status === "reading")
      .filter(s => scope === "all" || s.readingBy?.id === me.id)
      .sort((a, b) => {
        const pri = { STAT: 0, Urgent: 1, Routine: 2 } as const
        return pri[a.priority] - pri[b.priority]
      })
  }, [studies, scope, me.id])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <FileText className="h-6 w-6 text-violet-600" /> Reading Room
        </h1>
        <p className="text-sm text-[#64748B] mt-1">Radiologist queue · AI prelim · structured report · submit for verification</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {([["all", "All"], ["mine", "My queue"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setScope(k)}
              className={cn("px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition",
                scope === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>{label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="h-9 w-9 mb-2 opacity-40" />
            <p className="text-sm font-semibold">No studies waiting to be read</p>
          </div>
        )}
        {rows.map(s => (
          <ReadingRow key={s.id} s={s} me={me}
            expanded={expandedId === s.id}
            onToggle={() => setExpandedId(id => id === s.id ? null : s.id)}
            onClaim={() => { claimReading(s.id, me); setExpandedId(s.id); toast.success(`${s.name} on your queue`) }}
            onAI={() => { setAIPrelim(s.id); toast.success("AI prelim generated") }}
            onUpdate={(key, value) => updateReportSection(s.id, key, value)}
            onSubmit={() => {
              const cat = RADIOLOGY_CATALOG[s.code]
              const tmpl = cat ? TEMPLATE_SECTIONS[cat.template] : []
              const missing = tmpl.filter(sec => sec.required && !((s.reportSections[sec.key] ?? "").trim()))
              if (missing.length > 0) {
                toast.error(`Required: ${missing.map(m => m.label).join(", ")}`)
                return
              }
              submitReport(s.id, me)
              notifyAndAudit({
                to: 'radiology', type: 'system', priority: s.priority === 'STAT' ? 'high' : 'medium',
                title: `Verification queue · ${s.name}`,
                body: `${s.modality} ${s.name} for ${s.patientName} (${s.patientId}) awaiting second-read sign-off. Read by ${me.name}.`,
                patientName: s.patientName,
                audit: { action: 'radiology_report_verified', resource: 'radiology_study', resourceId: s.id, detail: `Report submitted for verification`, userName: me.name },
              })
              toast.success(`${s.name} submitted for verification`)
            }} />
        ))}
      </div>
    </div>
  )
}

function ReadingRow(props: {
  s: RadiologyStudy; me: RadTech
  expanded: boolean
  onToggle: () => void
  onClaim: () => void
  onAI: () => void
  onUpdate: (key: string, value: string) => void
  onSubmit: () => void
}) {
  const { s, me, expanded } = props
  const cat = RADIOLOGY_CATALOG[s.code]
  const tmpl = cat ? TEMPLATE_SECTIONS[cat.template] : []
  const mine = s.readingBy?.id === me.id
  const minsElapsed = Math.round((Date.now() - new Date(s.orderedAt).getTime()) / 60000)
  const overdue = minsElapsed > s.expectedTATmin

  return (
    <div className={cn("rounded-xl bg-white ring-1 overflow-hidden", overdue ? "ring-red-200" : "ring-slate-200/70")}>
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <span className={cn("flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg", PRIORITY_STYLE[s.priority])}>{s.priority}</span>

        <button onClick={props.onToggle} className="flex-1 min-w-0 text-left cursor-pointer">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 truncate">{s.patientName}</span>
            <span className="text-[11px] font-bold text-slate-400">{s.patientId}</span>
            {s.wardBed && <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5"><Bed className="h-3 w-3" />{s.wardBed}</span>}
            <span className="text-[12px] font-bold text-violet-700">{s.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-700">{s.modality}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{cat?.template ?? "general"}</span>
            {s.readingBy && <span className="text-[11px] font-semibold text-slate-400">· {mine ? "your queue" : `on ${s.readingBy.name}`}</span>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1 flex-wrap">
            <Stethoscope className="h-3 w-3" />ordered by {s.doctorName}
            <span className="text-slate-400 mx-1">·</span>
            <Clock className="h-3 w-3" />{minsElapsed}m elapsed / {s.expectedTATmin}m TAT
            {overdue && <span className="text-red-600 font-bold ml-1">overdue</span>}
            {s.attachments.length > 0 && (
              <>
                <span className="text-slate-400 mx-1">·</span>
                <ImageIcon className="h-3 w-3" />{s.attachments.length}
              </>
            )}
          </p>
        </button>

        <div className="flex-shrink-0 flex items-center gap-2">
          {s.status === "acquired" && (
            <button onClick={props.onClaim}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl cursor-pointer"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#EC4899)", boxShadow: "0 2px 8px rgba(139,92,246,0.25)" }}>
              <Hand className="h-3.5 w-3.5" />Read
            </button>
          )}
          {s.status === "reading" && mine && (
            <button onClick={props.onSubmit}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#16A34A,#0D9488)", boxShadow: "0 2px 8px rgba(22,163,74,0.25)" }}>
              <Send className="h-3.5 w-3.5" />Submit for verification
            </button>
          )}
          <button onClick={props.onToggle} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-3">
          {s.clinicalQuestion && (
            <p className="text-xs text-slate-600"><b className="text-slate-700">Clinical question:</b> {s.clinicalQuestion}</p>
          )}

          {/* Attached images thumbnail */}
          {s.attachments.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {s.attachments.map(a => (
                  <div key={a.id} className="rounded-lg bg-white ring-1 ring-slate-200/70 p-1.5">
                    <div className="h-14 rounded bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-700 mt-1 truncate" title={a.filename}>{a.filename}</p>
                    {a.caption && <p className="text-[10px] text-slate-500 truncate">{a.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI prelim */}
          <div className="rounded-lg ring-1 ring-violet-200 bg-violet-50/60 p-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[11px] font-bold text-violet-700 flex items-center gap-1"><Sparkles className="h-3 w-3" />AI prelim</p>
              {s.status === "reading" && mine && (
                <button onClick={props.onAI}
                  className="text-[10px] font-bold text-violet-700 bg-white hover:bg-violet-100 ring-1 ring-violet-200 px-2 py-0.5 rounded cursor-pointer">
                  {s.aiPrelim ? "Regenerate" : "Generate"}
                </button>
              )}
            </div>
            <p className="text-[12px] text-violet-800 mt-1 italic">{s.aiPrelim ?? "AI prelim not yet generated."}</p>
          </div>

          {/* Structured report editor */}
          {tmpl.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Structured report</p>
              <div className="space-y-2">
                {tmpl.map(sec => {
                  const value = s.reportSections[sec.key] ?? ""
                  const editable = s.status === "reading" && mine
                  return (
                    <div key={sec.key} className="bg-white rounded-lg ring-1 ring-slate-200/70 p-2.5">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mb-1">
                        {sec.label}
                        {sec.required && <span className="text-[10px] text-red-600">required</span>}
                      </label>
                      {editable ? (
                        <textarea
                          data-section={sec.key} data-study={s.id}
                          defaultValue={value}
                          onBlur={(e) => props.onUpdate(sec.key, e.target.value)}
                          placeholder={sec.placeholder ?? ""}
                          rows={sec.key === "findings" || sec.key === "impression" ? 3 : 2}
                          className="w-full text-[12px] rounded-md border border-slate-200 p-1.5 focus:outline-none focus:ring-2 focus:ring-violet-200" />
                      ) : (
                        <p className="text-[12px] text-slate-700 whitespace-pre-wrap">{value || <span className="italic text-slate-400">—</span>}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Critical-finding warning if flagged keywords appear in impression */}
          {checkCriticalImpression(s) && (
            <div className="rounded-lg bg-red-50 ring-1 ring-red-200 p-2.5 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700">Impression contains a critical finding. On release, the ordering doctor will receive a HIGH-priority notification and the case will appear on the incharge's <b>critical-pending callback</b> list.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const CRITICAL_RE = /\b(haemorrhage|hemorrhage|bleed|pneumothorax|tamponade|stroke|infarct|free air|pe\b|pulmonary embolism|bi-?rads (4|5|6)|lung-?rads (4|4a|4b|4x)|pi-?rads (4|5))\b/i

function checkCriticalImpression(s: RadiologyStudy): boolean {
  return CRITICAL_RE.test(s.reportSections.impression ?? "")
    || CRITICAL_RE.test(s.reportSections.findings ?? "")
    || CRITICAL_RE.test(s.reportSections.lungrads ?? "")
    || CRITICAL_RE.test(s.reportSections.birads ?? "")
    || CRITICAL_RE.test(s.reportSections.pirads ?? "")
}
