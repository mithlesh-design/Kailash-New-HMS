"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bed, Clock, AlertCircle, CheckCircle2, X, ChevronRight, Sparkles, FileText, FlaskConical, ScanLine, Pill, ShieldAlert, Info, UserCheck } from "lucide-react"
import { useAdmissionStore, type AdmissionRequest } from "@/store/useAdmissionStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import { OnShiftTeam } from "@/components/clinical/OnShiftTeam"

const TRIAGE_COLORS: Record<string, string> = {
  Critical: "bg-red-50 border-red-200 text-red-700",
  High: "bg-orange-50 border-orange-200 text-orange-700",
  Medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
  Low: "bg-green-50 border-green-200 text-green-700",
}

function BundlePanel({ req }: { req: AdmissionRequest }) {
  const b = req.bundle
  if (!b) return (
    <div className="p-4 text-center text-xs text-slate-400 font-medium">No documents attached to this request.</div>
  )
  const urgencyColor: Record<string, string> = { Emergency: 'bg-red-100 text-red-700 border-red-200', Urgent: 'bg-orange-100 text-orange-700 border-orange-200', Routine: 'bg-green-100 text-green-700 border-green-200' }
  return (
    <div className="p-4 space-y-4">
      {/* Urgency + header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Admission Bundle</p>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", urgencyColor[b.urgency] ?? urgencyColor.Routine)}>{b.urgency}</span>
      </div>

      {/* Allergies / Comorbidities */}
      {(b.allergies || b.comorbidities) && (
        <div className="rounded-xl p-3 space-y-1.5" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
          {b.allergies && (
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-semibold text-red-800"><span className="font-bold">Allergies:</span> {b.allergies}</p>
            </div>
          )}
          {b.comorbidities && (
            <div className="flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-semibold text-orange-800"><span className="font-bold">Co-morbidities:</span> {b.comorbidities}</p>
            </div>
          )}
        </div>
      )}

      {/* Special instructions */}
      {b.specialInstructions && (
        <div className="rounded-xl p-3" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">Special Instructions</p>
          <p className="text-xs text-blue-900 font-medium">{b.specialInstructions}</p>
        </div>
      )}

      {/* Prescriptions */}
      {b.prescriptions.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><Pill className="h-3 w-3" /> Prescriptions ({b.prescriptions.length})</p>
          <div className="space-y-1.5">
            {b.prescriptions.map((p, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-purple-900">{p.medicine}</span>
                <span className="text-[10px] text-purple-600 ml-auto">{p.dosage} · {p.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Orders */}
      {b.labOrders.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><FlaskConical className="h-3 w-3" /> Lab Orders ({b.labOrders.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {b.labOrders.map((o, i) => (
              <span key={i} className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border", o.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200')}>
                {o.testName} <span className="opacity-70">· {o.priority}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Radiology Orders */}
      {b.radiologyOrders.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1"><ScanLine className="h-3 w-3" /> Radiology ({b.radiologyOrders.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {b.radiologyOrders.map((o, i) => (
              <span key={i} className={cn("text-[10px] font-bold px-2 py-1 rounded-lg border", o.priority === 'Urgent' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200')}>
                {o.scanType} — {o.bodyPart} <span className="opacity-70">· {o.priority}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdmissionDashboard() {
  const { admissionRequests, beds, assignBed, markAdmitted, cancelRequest } = useAdmissionStore()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [bundleViewId, setBundleViewId] = useState<string | null>(null)

  const pending = admissionRequests.filter(r => r.status === 'Pending')
  const assigned = admissionRequests.filter(r => r.status === 'Assigned')
  const availableBeds = beds.filter(b => b.status === 'Available')
  const occupiedBeds = beds.filter(b => b.status === 'Occupied')
  const cleaningBeds = beds.filter(b => b.status === 'Cleaning')

  const selectedReq = admissionRequests.find(r => r.id === selectedRequest)
  const matchingBeds = selectedReq
    ? availableBeds.filter(b =>
        b.ward.toLowerCase().includes(selectedReq.admissionType.toLowerCase()) ||
        selectedReq.admissionType === 'General Ward' && b.ward === 'General Ward'
      )
    : []

  const handleAssign = (bedId: string) => {
    if (!selectedRequest) return
    assignBed(selectedRequest, bedId)
    toast.success("Bed assigned successfully. Nursing notified.")
    setSelectedRequest(null)
  }

  const elapsed = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pending Admissions", value: pending.length, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
          { label: "Available Beds", value: availableBeds.length, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
          { label: "Beds Being Cleaned", value: cleaningBeds.length, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
          { label: "Occupied Beds", value: occupiedBeds.length, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={cn("rounded-xl border p-5", bg, border)}>
            <p className={cn("text-3xl font-bold", color)}>{value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Admission Requests</h2>
            {pending.length > 0 && <NeonBadge variant="warning" dot pulse>{pending.length} pending</NeonBadge>}
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {pending.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-slate-50 transition-colors",
                    selectedRequest === req.id && "bg-blue-50 ring-inset ring-1 ring-blue-300"
                  )}
                  onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-900">{req.patientName}</p>
                        <span className="text-xs text-slate-400">{req.patientAge}y • {req.patientGender}</span>
                        {req.triageLevel && (
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", TRIAGE_COLORS[req.triageLevel] || TRIAGE_COLORS.Low)}>
                            {req.triageLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 font-medium mb-1">{req.diagnosis}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{req.admissionType}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{elapsed(req.requestedAt)}</span>
                        <span>{req.payerType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.bundle && (
                        <button
                          onClick={e => { e.stopPropagation(); setBundleViewId(bundleViewId === req.id ? null : req.id) }}
                          className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="View admission bundle"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      <Button size="sm" variant={selectedRequest === req.id ? "primary" : "secondary"}>
                        {selectedRequest === req.id ? "Selecting Bed" : "Assign Bed"}
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                      <button onClick={(e) => { e.stopPropagation(); cancelRequest(req.id); toast.info("Request cancelled") }} className="p-1.5 text-slate-400 hover:text-red-500 rounded cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* Admission bundle expandable panel */}
                  <AnimatePresence>
                    {bundleViewId === req.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-purple-100"
                        style={{ background: '#FAFAFE' }}
                      >
                        <BundlePanel req={req} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {pending.length === 0 && (
              <div className="py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-500">No pending admission requests</p>
              </div>
            )}
          </div>

          {assigned.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-green-50">
              <p className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Assigned — Awaiting Arrival ({assigned.length})</p>
              {assigned.map(req => (
                <div key={req.id} className="flex items-center justify-between py-1.5 border-b border-green-100 last:border-0">
                  <span className="text-xs text-green-800 font-medium">{req.patientName} → Bed {beds.find(b => b.id === req.assignedBedId)?.bedNumber ?? '—'}</span>
                  <button
                    onClick={() => { markAdmitted(req.id); toast.success(`${req.patientName} marked as Admitted`) }}
                    className="flex items-center gap-1 text-[10px] font-bold text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <UserCheck className="h-3 w-3" /> Mark Arrived
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bed Selection */}
        <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {selectedReq ? `Assign Bed — ${selectedReq.patientName}` : "Bed Board"}
            </h2>
            <Link href="/admission/beds">
              <Button size="sm" variant="secondary">Full Board</Button>
            </Link>
          </div>

          {selectedReq ? (
            <div className="p-4 space-y-3">
              {/* AI recommendation banner */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-purple-900">AI Bed Recommendation</p>
                  <p className="text-xs text-purple-700 mt-0.5">
                    {matchingBeds.length > 0
                      ? `Best match: Bed ${matchingBeds[0].bedNumber} (${matchingBeds[0].ward}, ${matchingBeds[0].floor} floor)`
                      : `No exact match for ${selectedReq.admissionType}. Check all available beds.`}
                  </p>
                </div>
              </div>

              {/* M4.3 — Live team for the target ward */}
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <OnShiftTeam
                  department={selectedReq.admissionType}
                  date={new Date().toISOString().split('T')[0]!}
                  shift={(() => {
                    const h = new Date().getHours()
                    if (h >= 6 && h < 14) return 'Morning'
                    if (h >= 14 && h < 22) return 'Evening'
                    return 'Night'
                  })()}
                  title={`Team currently on ${selectedReq.admissionType}`}
                  emptyMessage={`No clinical team rostered for ${selectedReq.admissionType} right now — consider an alternate ward.`}
                  roles={['doctor', 'nurse']}
                  compact
                />
              </div>

              {matchingBeds.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No matching beds available. Check other ward types.</p>
              )}

              {(matchingBeds.length > 0 ? matchingBeds : availableBeds).map(bed => (
                <motion.button
                  key={bed.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleAssign(bed.id)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-green-50 border border-green-200 hover:border-green-400 hover:bg-green-100 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                      {bed.bedNumber}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{bed.ward}</p>
                      <p className="text-xs text-slate-500">{bed.floor} floor • {bed.gender}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg border border-green-200">Assign →</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-slate-500 mb-4 text-center">Select a request to see bed options, or click Full Board for detailed view.</p>
              <div className="space-y-2">
                {['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'].map(status => {
                  const count = beds.filter(b => b.status === status).length
                  const colors: Record<string, string> = {
                    Available: 'bg-green-100 text-green-700 border-green-200',
                    Occupied: 'bg-blue-100 text-blue-700 border-blue-200',
                    Cleaning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    Reserved: 'bg-purple-100 text-purple-700 border-purple-200',
                    Maintenance: 'bg-red-100 text-red-700 border-red-200',
                  }
                  return (
                    <div key={status} className={cn("flex items-center justify-between p-3 rounded-xl border", colors[status])}>
                      <span className="text-sm font-semibold">{status}</span>
                      <span className="text-xl font-bold">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert: Beds awaiting admission for too long */}
      {pending.some(r => Date.now() - new Date(r.requestedAt).getTime() > 30 * 60000) && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-900">Admission delay alert</p>
            <p className="text-xs text-red-700 mt-0.5">One or more patients have been waiting for bed assignment for more than 30 minutes.</p>
          </div>
        </div>
      )}
    </div>
  )
}
