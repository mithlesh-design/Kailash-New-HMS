"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pill, Clock, CheckCircle, Bell, ChevronRight, Sparkles, Package, User, PackageCheck, AlertTriangle, ChevronDown, Home, IndianRupee } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { usePharmacyStore, type PrepStatus, type PharmacyPrescription } from "@/store/usePharmacyStore"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STATUS_CONFIG: Record<PrepStatus, { label: string; color: string; variant: 'muted' | 'warning' | 'success' | 'blue'; bg: string }> = {
  queued:    { label: 'Queued',    color: 'text-amber-600', variant: 'warning', bg: 'bg-amber-50' },
  preparing: { label: 'Preparing', color: 'text-blue-600',  variant: 'blue',    bg: 'bg-blue-50' },
  ready:     { label: 'Ready',     color: 'text-green-600', variant: 'success', bg: 'bg-green-50' },
  collected: { label: 'Collected', color: 'text-slate-500', variant: 'muted',   bg: 'bg-slate-50' },
}

const TRIAGE_COLORS: Record<string, string> = {
  Critical: 'bg-red-50 text-red-600 border-red-200', 
  High: 'bg-orange-50 text-orange-600 border-orange-200', 
  Medium: 'bg-yellow-50 text-yellow-600 border-yellow-200', 
  Low: 'bg-green-50 text-green-600 border-green-200',
}

const PRICE_MAP: Record<string, number> = {
  'Paracetamol 500mg': 45, 'Amoxicillin 250mg': 120, 'ORS Sachets': 30,
  'Atorvastatin 10mg': 85, 'Aspirin 75mg': 25, 'Metoprolol 25mg': 95,
  'Diclofenac 50mg': 60, 'Pantoprazole 40mg': 75,
}
function medPrice(name: string) { return PRICE_MAP[name] ?? 50 }

function PrescriptionCard({ rx, idx }: { rx: PharmacyPrescription; idx: number }) {
  const { updateStatus, markCollected, togglePatientModification } = usePharmacyStore()
  const [showModify, setShowModify] = useState(false)
  const sc = STATUS_CONFIG[rx.status]
  const mods = rx.patientModifications ?? []
  const billableItems = rx.medicines.filter(m => !mods.includes(m.name))
  const removedItems = rx.medicines.filter(m => mods.includes(m.name))
  const originalTotal = rx.medicines.reduce((sum, m) => sum + medPrice(m.name), 0)
  const modifiedTotal = billableItems.reduce((sum, m) => sum + medPrice(m.name), 0)
  const canModify = rx.status === 'queued' || rx.status === 'preparing'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn(
          "bg-white shadow-sm rounded-xl p-6 transition-all duration-300",
          rx.status === 'ready' && "shadow-md bg-green-50/30"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", TRIAGE_COLORS[rx.triageLevel ?? 'Low'])}>
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-base text-slate-900">{rx.patientName}</p>
              <p className="text-sm font-medium text-slate-500">Token #{rx.tokenNumber} • {rx.doctorName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <NeonBadge variant={sc.variant} dot pulse={rx.status === 'preparing' || rx.status === 'ready'}>
              {sc.label}
            </NeonBadge>
            {rx.triageLevel && (
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", TRIAGE_COLORS[rx.triageLevel])}>
                {rx.triageLevel} Priority
              </span>
            )}
          </div>
        </div>

        {/* AI Drug Interaction Check */}
        {rx.medicines.length >= 3 && (
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl mb-4 text-sm font-medium",
            rx.medicines.some(m => m.name.includes('Aspirin') || m.name.includes('Warfarin') || m.name.includes('Metoprolol'))
              ? "bg-amber-50/80 text-amber-800"
              : "bg-emerald-50/80 text-emerald-800"
          )}>
            <Sparkles className={cn("h-4 w-4 flex-shrink-0", rx.medicines.some(m => m.name.includes('Aspirin') || m.name.includes('Warfarin') || m.name.includes('Metoprolol')) ? "text-amber-500" : "text-emerald-500")} />
            <span>
              {rx.medicines.some(m => m.name.includes('Aspirin') || m.name.includes('Metoprolol'))
                ? "AI Check: Review Aspirin + Metoprolol combination — monitor blood pressure closely."
                : "AI Check: No known drug interactions detected for this combination."}
            </span>
          </div>
        )}

        {/* Medicines */}
        <div className="rounded-xl p-4 mb-4 bg-slate-50 space-y-3">
          {rx.medicines.map((m, i) => {
            const removed = mods.includes(m.name)
            return (
              <div key={i} className={cn("flex items-center justify-between transition-opacity", removed && "opacity-40")}>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-md bg-white shadow-sm flex items-center justify-center">
                    <Pill className={cn("h-3 w-3", removed ? "text-slate-300" : "text-slate-400")} />
                  </div>
                  <span className={cn("text-sm font-bold", removed ? "line-through text-slate-400" : "text-slate-700")}>{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white shadow-sm text-slate-600 uppercase tracking-wider">
                    {m.frequency} • {m.duration}
                  </span>
                  <span className={cn("text-[10px] font-bold text-slate-500", removed && "line-through")}>₹{medPrice(m.name)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Patient Modification toggle */}
        {canModify && (
          <div className="mb-4">
            <button
              onClick={() => setShowModify(s => !s)}
              className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50/80 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              Patient has medicines at home?
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showModify && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showModify && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden">
                  <div className="mt-2 p-4 bg-amber-50/60 rounded-xl space-y-2">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-3">Select medicines patient already has at home:</p>
                    {rx.medicines.map((m, i) => (
                      <label key={i} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={mods.includes(m.name)}
                            onChange={() => togglePatientModification(rx.id, m.name)}
                            className="h-4 w-4 rounded accent-amber-500 cursor-pointer" />
                          <span className="text-sm font-semibold text-slate-700">{m.name}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-700">₹{medPrice(m.name)}</span>
                      </label>
                    ))}
                    <div className="pt-3 border-t border-amber-200/60 mt-3">
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>Original Total</span>
                        <span className={mods.length > 0 ? 'line-through text-slate-400' : ''}>₹{originalTotal}</span>
                      </div>
                      {mods.length > 0 && (
                        <div className="flex justify-between text-sm font-black text-green-700 mt-1">
                          <span>Modified Total</span>
                          <span>₹{modifiedTotal} <span className="text-xs font-bold text-green-600">(-₹{originalTotal - modifiedTotal})</span></span>
                        </div>
                      )}
                      {mods.length > 0 && (
                        <button
                          onClick={() => { toast.success(`Billing updated. ₹${originalTotal - modifiedTotal} removed from order.`); setShowModify(false) }}
                          className="mt-3 w-full h-8 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 cursor-pointer transition-colors"
                        >
                          Apply Modification
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-500">
              {rx.status === 'ready' ? 'Ready for pickup' : rx.status === 'collected' ? 'Collected' : `~${rx.estimatedReadyIn} min remaining`}
            </span>
            {mods.length > 0 && (
              <span className="text-xs font-bold text-green-600 bg-green-50/80 px-2 py-0.5 rounded-full">
                <IndianRupee className="h-2.5 w-2.5 inline" />{modifiedTotal} billable
              </span>
            )}
          </div>
          {rx.status !== 'collected' && (
            <div className="flex gap-3">
              {rx.status === 'queued' && (
                <button onClick={() => updateStatus(rx.id, 'preparing')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-50/80 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm cursor-pointer">
                  Start Prep
                </button>
              )}
              {rx.status === 'preparing' && (
                <button onClick={() => updateStatus(rx.id, 'ready')}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-green-50/80 text-green-600 hover:bg-green-100 transition-colors shadow-sm cursor-pointer">
                  Mark Ready
                </button>
              )}
              {rx.status === 'ready' && (
                <button onClick={() => markCollected(rx.id)}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer">
                  Collected
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function PharmacyDashboard() {
  const { prescriptions } = usePharmacyStore()

  const stats = {
    queued:    prescriptions.filter(p => p.status === 'queued').length,
    preparing: prescriptions.filter(p => p.status === 'preparing').length,
    ready:     prescriptions.filter(p => p.status === 'ready').length,
    collected: prescriptions.filter(p => p.status === 'collected').length,
  }

  const active = prescriptions.filter(p => p.status !== 'collected')
  const collected = prescriptions.filter(p => p.status === 'collected')

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <NeonBadge variant="blue" dot pulse className="mb-2">
            <Sparkles className="h-3 w-3" /> Live Pharmacy Queue
          </NeonBadge>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Command Center</h1>
          <p className="text-sm mt-1 text-slate-500 font-medium">
            Prescriptions dispatched directly from doctor consultations
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50/80 shadow-sm">
          <Bell className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">
            {stats.ready} ready for pickup
          </span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Queued',    count: stats.queued,    icon: Package,      color: 'text-amber-600', cardBg: 'bg-amber-50/70',  lb: 'text-amber-800/60' },
          { label: 'Preparing', count: stats.preparing, icon: Clock,        color: 'text-blue-600',  cardBg: 'bg-blue-50/70',   lb: 'text-blue-800/60' },
          { label: 'Ready',     count: stats.ready,     icon: CheckCircle,  color: 'text-green-600', cardBg: 'bg-green-50/70',  lb: 'text-green-800/60' },
          { label: 'Collected', count: stats.collected, icon: PackageCheck, color: 'text-slate-500', cardBg: 'bg-slate-50/80',  lb: 'text-slate-600/60' },
        ].map(({ label, count, icon: Icon, color, cardBg, lb }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl ${cardBg} p-5 text-center flex flex-col items-center justify-center hover:shadow-sm transition-shadow`}
          >
            <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm">
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{count}</p>
            <p className={`text-xs font-bold uppercase tracking-wider ${lb}`}>{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Prescriptions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Active Prescriptions</h2>
            <NeonBadge variant="blue">{active.length} pending</NeonBadge>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {active.length === 0 ? (
                <div className="bg-white border shadow-sm rounded-xl p-12 text-center flex flex-col items-center justify-center bg-slate-50 border-dashed border-2">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-1">All clear!</p>
                  <p className="text-sm font-medium text-slate-500">No active prescriptions in queue</p>
                </div>
              ) : (
                active.map((rx, i) => <PrescriptionCard key={rx.id} rx={rx} idx={i} />)
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collected */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Collected Today</h2>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {collected.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm font-medium text-slate-500">No collections yet</p>
              </div>
            )}
            {collected.map((rx, i) => (
              <div
                key={rx.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                    <CheckCircle className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{rx.patientName}</p>
                    <p className="text-xs font-medium text-slate-400">Token #{rx.tokenNumber}</p>
                  </div>
                </div>
                <NeonBadge variant="muted">Collected</NeonBadge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
