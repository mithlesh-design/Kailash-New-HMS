"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, AlertCircle, Clock, FileText, Sparkles, X,
  Stethoscope, Pill, Receipt, ShieldCheck, Bed, Plus, User
} from "lucide-react"
import { useDischargeStore, type ClearancePillar, type DischargePatient } from "@/store/useDischargeStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const PILLAR_CONFIG: Record<ClearancePillar, { label: string; icon: React.ElementType; color: string }> = {
  doctor:    { label: 'Doctor',    icon: Stethoscope, color: 'text-blue-500' },
  nursing:   { label: 'Nursing',   icon: User,        color: 'text-green-500' },
  pharmacy:  { label: 'Pharmacy',  icon: Pill,        color: 'text-pink-500' },
  billing:   { label: 'Billing',   icon: Receipt,     color: 'text-orange-500' },
  insurance: { label: 'Insurance', icon: ShieldCheck, color: 'text-purple-500' },
}

const PILLARS: ClearancePillar[] = ['doctor', 'nursing', 'pharmacy', 'billing', 'insurance']

const AI_SUMMARY_TEMPLATE = (p: DischargePatient) =>
  `Patient ${p.patientName} admitted on ${new Date(p.admittedOn).toLocaleDateString('en-IN')} for ${p.diagnosis}. Managed under ${p.attendingDoctor}. Treatment course completed. Patient is clinically stable and fit for discharge. Follow-up advised in 2 weeks. All investigations reviewed. Medications reconciled and discharge prescription prepared. Patient and attendant counselled on red-flag symptoms and medication compliance.`

function ClearancePillarBadge({ pillar, status, onClick }: { pillar: ClearancePillar; status: 'pending' | 'cleared'; onClick: () => void }) {
  const cfg = PILLAR_CONFIG[pillar]
  const Icon = cfg.icon
  return (
    <button
      onClick={onClick}
      title={`Toggle ${cfg.label} clearance`}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-pointer min-w-[64px]",
        status === 'cleared'
          ? "bg-green-50 border-green-300 shadow-sm"
          : "bg-slate-50 border-slate-200 hover:border-slate-300"
      )}
    >
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", status === 'cleared' ? "bg-green-100" : "bg-white border border-slate-200")}>
        {status === 'cleared'
          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
          : <Icon className={cn("h-4 w-4", cfg.color)} />
        }
      </div>
      <span className={cn("text-[10px] font-bold leading-tight text-center", status === 'cleared' ? "text-green-700" : "text-slate-500")}>
        {cfg.label}
      </span>
    </button>
  )
}

function PatientCard({ patient }: { patient: DischargePatient }) {
  const { setClearance, addBlocker, resolveBlocker, draftSummary, approveSummary, issueExitClearance, setFollowUp } = useDischargeStore()
  const [expanded, setExpanded] = useState(false)
  const [newBlocker, setNewBlocker] = useState({ type: 'Other', description: '', owner: '' })
  const [showBlockerForm, setShowBlockerForm] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(patient.followUpDate?.split('T')[0] ?? '')

  const allCleared = PILLARS.every(p => patient.clearances[p] === 'cleared')
  const unresolvedBlockers = patient.blockers.filter(b => !b.resolvedAt)
  const canExit = allCleared && patient.summaryApproved && unresolvedBlockers.length === 0

  const handleDraftSummary = () => {
    const summary = patient.dischargeSummary || AI_SUMMARY_TEMPLATE(patient)
    draftSummary(patient.patientId, summary)
    toast.success("AI discharge summary drafted — awaiting doctor approval")
  }

  const handleIssueExit = () => {
    if (!canExit) { toast.error("All clearances must be done and summary approved first"); return }
    issueExitClearance(patient.patientId)
    toast.success(`Exit clearance issued for ${patient.patientName}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white border shadow-sm rounded-xl overflow-hidden", patient.exitClearanceIssued && "opacity-60")}
    >
      {/* Header */}
      <div
        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{patient.patientName}</h3>
            {patient.exitClearanceIssued
              ? <NeonBadge variant="success" dot>Exit Issued</NeonBadge>
              : canExit
                ? <NeonBadge variant="success" dot pulse>Ready to Discharge</NeonBadge>
                : <NeonBadge variant="warning" dot pulse>In Progress</NeonBadge>
            }
            <span className="text-sm text-slate-500">{patient.payerType}</span>
          </div>
          <p className="text-sm text-slate-600 font-medium">{patient.diagnosis}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{patient.wardBed}</span>
            <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{patient.attendingDoctor}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Admitted {new Date(patient.admittedOn).toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Clearance pillars summary */}
        <div className="flex gap-1.5">
          {PILLARS.map(pillar => {
            const status = patient.clearances[pillar]
            const Icon = PILLAR_CONFIG[pillar].icon
            return (
              <div key={pillar} title={`${PILLAR_CONFIG[pillar].label}: ${status}`}
                className={cn("h-8 w-8 rounded-lg flex items-center justify-center", status === 'cleared' ? "bg-green-100" : "bg-slate-100")}
              >
                {status === 'cleared'
                  ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                  : <Icon className={cn("h-4 w-4", PILLAR_CONFIG[pillar].color, "opacity-50")} />
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 space-y-5">

              {/* Clearance pillars interactive */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Clearance Status — click to toggle</p>
                <div className="flex gap-2 flex-wrap">
                  {PILLARS.map(pillar => (
                    <ClearancePillarBadge
                      key={pillar}
                      pillar={pillar}
                      status={patient.clearances[pillar]}
                      onClick={() => {
                        const newStatus = patient.clearances[pillar] === 'cleared' ? 'pending' : 'cleared'
                        setClearance(patient.patientId, pillar, newStatus)
                        if (newStatus === 'cleared') toast.success(`${PILLAR_CONFIG[pillar].label} clearance given`)
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Blockers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blockers ({unresolvedBlockers.length} active)</p>
                  <button onClick={() => setShowBlockerForm(!showBlockerForm)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Blocker
                  </button>
                </div>

                {showBlockerForm && (
                  <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <Input value={newBlocker.description} onChange={e => setNewBlocker(b => ({ ...b, description: e.target.value }))} placeholder="Blocker description..." className="text-sm h-8" />
                    <div className="flex gap-2">
                      <Input value={newBlocker.owner} onChange={e => setNewBlocker(b => ({ ...b, owner: e.target.value }))} placeholder="Owner / responsible team" className="text-sm h-8 flex-1" />
                      <Button size="sm" onClick={() => {
                        if (!newBlocker.description || !newBlocker.owner) return
                        addBlocker(patient.patientId, { type: newBlocker.type, description: newBlocker.description, owner: newBlocker.owner })
                        setNewBlocker({ type: 'Other', description: '', owner: '' })
                        setShowBlockerForm(false)
                        toast.success(`Blocker added · ${newBlocker.owner}`)
                      }}>Add</Button>
                    </div>
                  </div>
                )}

                {patient.blockers.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No blockers</p>
                )}
                {patient.blockers.map(blocker => (
                  <div key={blocker.id} className={cn("flex items-start justify-between p-3 rounded-lg mb-2 border", blocker.resolvedAt ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                    <div>
                      <p className={cn("text-sm font-semibold", blocker.resolvedAt ? "text-green-800 line-through" : "text-red-900")}>{blocker.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Owner: {blocker.owner}</p>
                    </div>
                    {!blocker.resolvedAt && (
                      <button onClick={() => { resolveBlocker(patient.patientId, blocker.id); toast.success("Blocker resolved") }} className="ml-2 text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 border border-green-200 px-2 py-1 rounded cursor-pointer">
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Discharge Summary */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Discharge Summary</p>
                  {!patient.summaryDrafted && (
                    <button onClick={handleDraftSummary} className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer">
                      <Sparkles className="h-3 w-3" /> AI Draft
                    </button>
                  )}
                  {patient.summaryDrafted && (
                    <button onClick={() => setShowSummary(!showSummary)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                      {showSummary ? "Hide" : "View"} Summary
                    </button>
                  )}
                </div>
                {patient.summaryDrafted ? (
                  <>
                    <AnimatePresence>
                      {showSummary && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <p className="text-sm text-slate-700 bg-slate-50 border rounded-xl p-3 mb-3 leading-relaxed">{patient.dischargeSummary}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex items-center gap-3">
                      {!patient.summaryApproved
                        ? <Button size="sm" onClick={() => { approveSummary(patient.patientId); toast.success("Summary approved by doctor") }}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve Summary
                          </Button>
                        : <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700"><CheckCircle2 className="h-4 w-4 text-green-500" />Summary Approved</span>
                      }
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 italic">No summary drafted yet</p>
                )}
              </div>

              {/* Follow-up date */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" variant="secondary" onClick={() => { setFollowUp(patient.patientId, followUpDate); toast.success("Follow-up scheduled") }}>
                  Set
                </Button>
              </div>

              {/* Exit Clearance */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  onClick={handleIssueExit}
                  disabled={!canExit || patient.exitClearanceIssued}
                  className="w-full h-11 font-bold"
                  variant={patient.exitClearanceIssued ? "success" : canExit ? "primary" : "secondary"}
                >
                  {patient.exitClearanceIssued
                    ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Exit Clearance Issued</>
                    : canExit
                      ? "Issue Exit Clearance"
                      : `${PILLARS.filter(p => patient.clearances[p] === 'pending').length} clearance(s) remaining`
                  }
                </Button>
                {!patient.summaryApproved && !patient.exitClearanceIssued && (
                  <p className="text-xs text-center text-orange-600 font-medium mt-2">Discharge summary must be approved before exit</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Inline Input component to avoid import issues
function Input({ value, onChange, placeholder, className }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; className?: string }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow", className)}
    />
  )
}

export default function DischargeDashboard() {
  const { dischargeQueue } = useDischargeStore()

  const today = dischargeQueue.filter(p => !p.exitClearanceIssued)
  const cleared = dischargeQueue.filter(p => p.exitClearanceIssued)
  const blockerCount = today.reduce((acc, p) => acc + p.blockers.filter(b => !b.resolvedAt).length, 0)
  const clearancesDone = today.reduce((acc, p) =>
    acc + Object.values(p.clearances).filter(v => v === 'cleared').length, 0
  )
  const clearancesTotal = today.length * 5

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Discharging Today", value: today.length, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Active Blockers", value: blockerCount, color: blockerCount > 0 ? "text-red-600" : "text-green-600", bg: blockerCount > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200" },
          { label: "Clearances Obtained", value: `${clearancesDone}/${clearancesTotal}`, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Exits Issued Today", value: cleared.length, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("rounded-xl border p-5", bg)}>
            <p className={cn("text-3xl font-bold", color)}>{value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Blocker alert */}
      {blockerCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-900">{blockerCount} active discharge blocker(s)</p>
            <p className="text-xs text-red-700 mt-0.5">Resolve all blockers and obtain all clearances before issuing exit.</p>
          </div>
        </div>
      )}

      {/* Discharge queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Today's Discharge Queue</h2>
        {today.length === 0 && (
          <div className="bg-white border rounded-xl p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
            <p className="text-lg font-bold text-slate-700">No pending discharges</p>
            <p className="text-sm text-slate-500 mt-1">All today's discharges have been processed.</p>
          </div>
        )}
        {today.map(patient => <PatientCard key={patient.id} patient={patient} />)}
      </div>

      {/* Cleared today */}
      {cleared.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Discharged Today ({cleared.length})
          </h2>
          <div className="space-y-2">
            {cleared.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">{p.patientName}</p>
                  <p className="text-sm text-slate-600">{p.diagnosis} • {p.wardBed}</p>
                </div>
                <NeonBadge variant="success" dot>Exit Issued</NeonBadge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
