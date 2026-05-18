"use client"

import { useState } from "react"
import { useOTStore } from "@/store/useOTStore"
import { generateSurgicalRequisition, type SurgicalRequisition } from "@/ai-services/ot-surgical-requisition"
import { CheckCircle, Circle, AlertTriangle, Clock, Sparkles, Package, Pill, Droplets, Wrench, Send, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  medicine: Pill, iv_fluid: Droplets, consumable: Package, instrument: Wrench, implant: Package,
}
const DEST_COLORS: Record<string, string> = {
  pharmacy: 'bg-blue-50 text-blue-700 border-blue-200',
  cssd: 'bg-purple-50 text-purple-700 border-purple-200',
  inventory: 'bg-slate-50 text-slate-600 border-slate-200',
}

const STATUS_COLOR: Record<string, string> = {
  Scheduled:     'bg-slate-100 text-slate-700 border-slate-200',
  'Pre-Op':      'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Recovery:      'bg-purple-50 text-purple-700 border-purple-200',
  Completed:     'bg-green-50 text-green-700 border-green-200',
}

export default function OTChecklistPage() {
  const { procedures, checkItem } = useOTStore()
  const [selected, setSelected] = useState<string>(procedures[0]?.id ?? '')
  const [requisition, setRequisition] = useState<SurgicalRequisition | null>(null)
  const [loadingRequisition, setLoadingRequisition] = useState(false)
  const [requisitionDispatched, setRequisitionDispatched] = useState(false)
  const [editedRequisition, setEditedRequisition] = useState<SurgicalRequisition | null>(null)

  const activeProcedures = procedures.filter(p => p.status !== 'Completed')
  const proc = procedures.find(p => p.id === selected)

  const criticalPending = proc ? proc.checklist.filter(c => c.critical && !c.checked).length : 0
  const totalChecked = proc ? proc.checklist.filter(c => c.checked).length : 0
  const totalItems = proc ? proc.checklist.length : 0

  const handleCheck = (itemId: string, label: string, wasCritical: boolean) => {
    if (!proc) return
    checkItem(proc.id, itemId)
    const item = proc.checklist.find(c => c.id === itemId)
    if (!item?.checked) {
      toast.success(`✓ ${label}`)
    }
  }

  const handleGenerateRequisition = async () => {
    if (!proc) return
    setLoadingRequisition(true)
    setRequisitionDispatched(false)
    try {
      const result = await generateSurgicalRequisition(proc.id, proc.procedureName, proc.surgeon, proc.scheduledTime)
      setRequisition(result.data)
      setEditedRequisition(result.data)
      toast.success('AI surgical requisition generated')
    } catch {
      toast.error('Failed to generate requisition')
    } finally {
      setLoadingRequisition(false)
    }
  }

  const handleDispatchRequisition = () => {
    if (!editedRequisition) return
    setRequisitionDispatched(true)
    const pharmacyCount = editedRequisition.totalPharmacyItems
    const cssdCount = editedRequisition.totalCssdItems
    const invCount = editedRequisition.totalInventoryItems
    toast.success(`Requisition dispatched: ${pharmacyCount} items → Pharmacy, ${cssdCount} → CSSD, ${invCount} → Inventory`)
  }

  return (
    <div className="space-y-6">
      {/* Procedure selector */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Pre-Op Checklist</h1>
        <div className="flex gap-2 flex-wrap">
          {activeProcedures.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={cn("px-3 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                selected === p.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              <div className="text-left">
                <p>{p.patientName}</p>
                <p className={cn("text-[10px] font-normal mt-0.5", selected === p.id ? "text-slate-300" : "text-slate-400")}>{p.id} · {p.scheduledTime}</p>
              </div>
            </button>
          ))}
          {activeProcedures.length === 0 && (
            <p className="text-sm text-slate-500">No active procedures to review</p>
          )}
        </div>
      </div>

      {proc && (
        <div className="grid grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="col-span-2 space-y-4">
            {/* Progress */}
            <Card className={cn("p-4", criticalPending > 0 ? "border-amber-200 bg-amber-50/30" : "border-green-200 bg-green-50/20")}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {criticalPending > 0
                    ? <AlertTriangle className="h-5 w-5 text-amber-600" />
                    : <CheckCircle className="h-5 w-5 text-green-600" />
                  }
                  <span className={cn("font-bold text-sm", criticalPending > 0 ? "text-amber-800" : "text-green-800")}>
                    {criticalPending > 0
                      ? `${criticalPending} critical item(s) still pending`
                      : 'All critical items cleared — safe to proceed'
                    }
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-500">{totalChecked} / {totalItems} done</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", totalChecked === totalItems ? "bg-green-500" : criticalPending > 0 ? "bg-amber-500" : "bg-blue-500")}
                  style={{ width: `${totalItems > 0 ? (totalChecked / totalItems) * 100 : 0}%` }}
                />
              </div>
            </Card>

            {/* Checklist items */}
            <div className="space-y-2">
              {proc.checklist.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                >
                  <button
                    onClick={() => handleCheck(item.id, item.label, item.critical)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer text-left",
                      item.checked
                        ? "bg-green-50 border-green-200"
                        : item.critical
                        ? "bg-amber-50/40 border-amber-200 hover:bg-amber-50"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {item.checked
                      ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      : <Circle className={cn("h-5 w-5 flex-shrink-0", item.critical ? "text-amber-500" : "text-slate-300")} />
                    }
                    <div className="flex-1">
                      <p className={cn("text-sm font-semibold", item.checked ? "text-green-800 line-through" : "text-slate-900")}>
                        {item.label}
                      </p>
                    </div>
                    {item.critical && !item.checked && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        Critical
                      </span>
                    )}
                    {item.critical && item.checked && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        ✓ Critical
                      </span>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Procedure details panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Procedure Details</h3>
              <div className="space-y-2.5 text-sm">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Patient</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{proc.patientName}</p>
                  <p className="text-slate-500 text-xs">{proc.patientAge} yrs · {proc.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Procedure</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{proc.procedureName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Surgeon</p>
                  <p className="font-medium text-slate-800 mt-0.5">{proc.surgeon}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Anaesthetist</p>
                  <p className="font-medium text-slate-800 mt-0.5">{proc.anaesthetist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{proc.scheduledTime} · {proc.durationMinutes}m · {proc.otRoom}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border", STATUS_COLOR[proc.status])}>
                  {proc.status}
                </span>
              </div>
            </Card>

            {/* Flags */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Flags</h3>
              <div className="space-y-2">
                {proc.bloodRequired
                  ? <div className="flex items-center gap-2 text-xs font-semibold text-red-700"><AlertTriangle className="h-4 w-4" /> Blood required — confirm availability</div>
                  : <div className="flex items-center gap-2 text-xs font-semibold text-green-700"><CheckCircle className="h-4 w-4" /> No blood required</div>
                }
                {proc.implants.length > 0
                  ? <div className="flex items-start gap-2 text-xs font-semibold text-blue-700">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Implants: {proc.implants.join(', ')}</span>
                    </div>
                  : <div className="flex items-center gap-2 text-xs font-semibold text-green-700"><CheckCircle className="h-4 w-4" /> No implants needed</div>
                }
              </div>
            </Card>

            {proc.notes && (
              <Card className="p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Notes</h3>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{proc.notes}</p>
              </Card>
            )}

            {/* AI Surgical Requisition */}
            <Card className="p-4 overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.15)', background: 'linear-gradient(135deg,#FAFAFE,#F5F3FF)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#6366F1)', boxShadow: '0 3px 8px rgba(124,58,237,0.25)' }}>
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A]">AI Surgical Requisition</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">Generate complete list of medicines, IV fluids, instruments and consumables for this procedure</p>
              {!requisition && (
                <button
                  onClick={handleGenerateRequisition}
                  disabled={loadingRequisition}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#6366F1)', boxShadow: '0 3px 8px rgba(124,58,237,0.20)' }}
                >
                  {loadingRequisition ? (
                    <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Generate Requisition</>
                  )}
                </button>
              )}
              <AnimatePresence>
                {requisition && editedRequisition && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {requisitionDispatched ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-xs font-bold text-green-900">Requisition Dispatched</p>
                          <p className="text-[10px] text-green-700">{editedRequisition.totalPharmacyItems} to Pharmacy · {editedRequisition.totalCssdItems} to CSSD · {editedRequisition.totalInventoryItems} to Inventory</p>
                          <p className="text-[10px] text-green-600 mt-0.5">Required by: {new Date(editedRequisition.requiredBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {[
                          { key: 'medicines', label: 'Medicines', items: editedRequisition.medicines },
                          { key: 'ivFluids', label: 'IV Fluids', items: editedRequisition.ivFluids },
                          { key: 'consumables', label: 'Consumables', items: editedRequisition.consumables },
                          { key: 'instruments', label: 'Instruments / CSSD', items: editedRequisition.instruments },
                        ].filter(g => g.items.length > 0).map(group => (
                          <div key={group.key}>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-1.5">{group.label}</p>
                            <div className="space-y-1.5">
                              {group.items.map((item, i) => {
                                const Icon = CATEGORY_ICONS[item.category] ?? Package
                                return (
                                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white border border-slate-100">
                                    <Icon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                    <span className="flex-1 text-xs text-slate-700 font-medium">{item.name}</span>
                                    <span className="text-[10px] text-slate-500">{item.quantity} {item.unit}</span>
                                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0", DEST_COLORS[item.destination])}>
                                      {item.destination}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => { setRequisition(null); setEditedRequisition(null) }}
                            className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Re-generate
                          </button>
                          <button
                            onClick={handleDispatchRequisition}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white rounded-xl cursor-pointer transition-all"
                            style={{ background: 'linear-gradient(135deg,#16A34A,#0D9488)', boxShadow: '0 2px 8px rgba(22,163,74,0.20)' }}
                          >
                            <Send className="h-3.5 w-3.5" /> Dispatch All
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
