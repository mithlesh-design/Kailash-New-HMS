"use client"

import { CheckCircle, AlertTriangle, Clock, Package, ShoppingCart, Bed } from "lucide-react"
import { useState } from "react"
import { usePharmacyStore } from "@/store/usePharmacyStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MAR_ENTRIES = [
  { id: 'MAR-001', patientName: 'Kiran Patil', bed: 'G-12', drug: 'Metformin 500mg', route: 'Oral', time: '08:00', status: 'given', givenBy: 'Anjali Desai', givenAt: '08:05' },
  { id: 'MAR-002', patientName: 'Kiran Patil', bed: 'G-12', drug: 'Amlodipine 5mg', route: 'Oral', time: '08:00', status: 'given', givenBy: 'Anjali Desai', givenAt: '08:05' },
  { id: 'MAR-003', patientName: 'Kiran Patil', bed: 'G-12', drug: 'Amoxiclav 625mg', route: 'Oral', time: '14:00', status: 'due', givenBy: '', givenAt: '' },
  { id: 'MAR-004', patientName: 'Mohan Lal', bed: 'ICU-3', drug: 'Noradrenaline infusion', route: 'IV', time: 'Continuous', status: 'running', givenBy: 'Kavitha Nair', givenAt: 'Ongoing' },
]

type MARStatus = 'given' | 'due' | 'running' | 'withheld'

const STATUS_CONFIG: Record<MARStatus, { color: string; icon: React.ElementType; label: string }> = {
  given:    { color: 'text-green-600 bg-green-50',  icon: CheckCircle,    label: 'Given' },
  due:      { color: 'text-amber-600 bg-amber-50',  icon: Clock,          label: 'Due' },
  running:  { color: 'text-blue-600 bg-blue-50',    icon: Clock,          label: 'Running' },
  withheld: { color: 'text-red-600 bg-red-50',      icon: AlertTriangle,  label: 'Withheld' },
}

export default function MedicationMAR() {
  const { prescriptions, requestProcurement } = usePharmacyStore()
  const [entries, setEntries] = useState(MAR_ENTRIES)
  const [activeTab, setActiveTab] = useState<'mar' | 'ipd'>('mar')

  const ipdPending = prescriptions.filter(p => p.procurementStatus === 'deferred_ipd')
  const ipdRequested = prescriptions.filter(p => p.procurementStatus === 'procurement_requested')

  const markGiven = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'given', givenBy: 'Anjali Desai', givenAt: new Date().toLocaleTimeString() } : e))
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Medication Administration</h2>
        <p className="text-slate-500 text-sm mt-1">MAR + IPD procurement management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: '#F1F5F9' }}>
        {[
          { key: 'mar', label: 'MAR', count: entries.filter(e => e.status === 'due').length },
          { key: 'ipd', label: 'IPD Procurement', count: ipdPending.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'mar' | 'ipd')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer",
              activeTab === tab.key ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", activeTab === tab.key ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'mar' && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Always verify patient identity (name + MRN wristband) before administration
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{['Patient', 'Bed', 'Drug', 'Route', 'Time', 'Status', 'Given By', 'Action'].map(h => (
                  <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(e => {
                  const status = e.status as MARStatus
                  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.due
                  const Icon = cfg.icon
                  return (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{e.patientName}</td>
                      <td className="px-4 py-3 text-slate-600">{e.bed}</td>
                      <td className="px-4 py-3 font-medium">{e.drug}</td>
                      <td className="px-4 py-3 text-slate-500">{e.route}</td>
                      <td className="px-4 py-3 text-slate-500">{e.time}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${cfg.color}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{e.givenBy || '—'} {e.givenAt ? `@ ${e.givenAt}` : ''}</td>
                      <td className="px-4 py-3">
                        {e.status === 'due' && (
                          <button onClick={() => markGiven(e.id)} className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                            Administer
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'ipd' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 flex-shrink-0" />
            IPD prescriptions are held until the ward nursing staff confirms the patient has arrived and procurement is required
          </div>

          {/* Already requested */}
          {ipdRequested.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" /> Requested — Pharmacy Preparing ({ipdRequested.length})
              </h3>
              <div className="space-y-3">
                {ipdRequested.map(rx => (
                  <div key={rx.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900">{rx.patientName}</p>
                          {rx.wardBed && <span className="flex items-center gap-1 text-xs text-slate-500"><Bed className="h-3 w-3" />{rx.wardBed}</span>}
                          <NeonBadge variant="warning">Requested</NeonBadge>
                        </div>
                        <div className="space-y-1 mt-2">
                          {rx.medicines.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                              <Package className="h-3 w-3 text-orange-500 flex-shrink-0" />
                              {m.name} — {m.dosage}
                            </div>
                          ))}
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-orange-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending ward trigger */}
          {ipdPending.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" /> Pending Your Request ({ipdPending.length})
              </h3>
              <div className="space-y-3">
                {ipdPending.map(rx => (
                  <div key={rx.id} className="bg-white border border-blue-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-900">{rx.patientName}</p>
                          {rx.wardBed && <span className="flex items-center gap-1 text-xs text-slate-500"><Bed className="h-3 w-3" />{rx.wardBed}</span>}
                          {rx.triageLevel && <NeonBadge variant={rx.triageLevel === 'Critical' ? 'danger' : rx.triageLevel === 'High' ? 'warning' : 'muted'}>{rx.triageLevel}</NeonBadge>}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{rx.doctorName} · {rx.department}</p>
                        <div className="space-y-1">
                          {rx.medicines.map((m, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                              <Package className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              {m.name} — {m.dosage} · {m.frequency}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          requestProcurement(rx.id)
                          toast.success(`Procurement requested for ${rx.patientName} — pharmacy notified`)
                        }}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl cursor-pointer transition-all"
                        style={{ background: 'linear-gradient(135deg,#2563EB,#0891B2)', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
                      >
                        <ShoppingCart className="h-4 w-4" /> Request Procurement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ipdPending.length === 0 && ipdRequested.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-500">No IPD procurement items</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
