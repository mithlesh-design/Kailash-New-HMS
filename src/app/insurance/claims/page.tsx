"use client"

import { useState } from "react"
import { useInsuranceStore, type InsuranceClaim } from "@/store/useInsuranceStore"
import { FileText, CheckCircle, XCircle, Clock, AlertCircle, X } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

const STATUS_COLOR: Record<InsuranceClaim['status'], string> = {
  'Pending Pre-Auth': 'warning',
  'Approved':         'success',
  'Rejected':         'danger',
  'In Process':       'blue',
}

function ReviewModal({ claim, onClose }: { claim: InsuranceClaim; onClose: (action?: 'approve' | 'reject') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="review-title"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="review-title" className="text-lg font-bold text-slate-900">Review Claim</h2>
          <button onClick={() => onClose()} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Claim Details</p>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="font-medium text-slate-500">Claim ID</span>   <span className="font-bold text-slate-900">{claim.id}</span>
              <span className="font-medium text-slate-500">Patient</span>    <span className="font-bold text-slate-900">{claim.patientName}</span>
              <span className="font-medium text-slate-500">Provider</span>   <span className="font-bold text-slate-900">{claim.provider}</span>
              <span className="font-medium text-slate-500">Amount</span>     <span className="font-bold text-slate-900">₹{claim.amount.toLocaleString('en-IN')}</span>
              <span className="font-medium text-slate-500">Status</span>     <span className="font-bold text-slate-900">{claim.status}</span>
            </div>
          </div>
          {claim.aiProbability !== undefined && (
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${claim.aiProbability >= 80 ? 'bg-green-50 border-green-200' : claim.aiProbability >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 ${claim.aiProbability >= 80 ? 'text-green-600' : claim.aiProbability >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs font-bold text-slate-700">AI Approval Probability</p>
                <p className={`text-lg font-black ${claim.aiProbability >= 80 ? 'text-green-700' : claim.aiProbability >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                  {claim.aiProbability}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={() => onClose('reject')} className="flex-1 h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm transition-colors cursor-pointer border border-red-200 flex items-center justify-center gap-2">
            <XCircle className="h-4 w-4" /> Reject
          </button>
          <button onClick={() => onClose('approve')} className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" /> Approve
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function InsuranceClaimsPage() {
  const { claims } = useInsuranceStore()
  const [localClaims, setLocalClaims] = useState<InsuranceClaim[]>(claims)
  const [reviewing, setReviewing]     = useState<InsuranceClaim | null>(null)
  const [filter, setFilter]           = useState<'All' | InsuranceClaim['status']>('All')

  const handleReviewClose = (action?: 'approve' | 'reject') => {
    if (action && reviewing) {
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected'
      setLocalClaims(prev => prev.map(c => c.id === reviewing.id ? { ...c, status: newStatus as InsuranceClaim['status'] } : c))
      toast.success(`Claim ${reviewing.id} ${newStatus}`)
    }
    setReviewing(null)
  }

  const filtered = localClaims.filter(c => filter === 'All' || c.status === filter)
  const totalValue = localClaims.reduce((sum, c) => sum + c.amount, 0)
  const pending = localClaims.filter(c => c.status === 'Pending Pre-Auth' || c.status === 'In Process').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Active Claims</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage insurance claims and pre-authorisations</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-blue-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800/60 mb-1">Total Claims Value</p>
          <p className="text-xl font-black text-[#0F172A]">₹{(totalValue / 100000).toFixed(1)}L</p>
        </div>
        <div className="rounded-xl bg-amber-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/60 mb-1">Pending Review</p>
          <p className="text-xl font-black text-[#0F172A]">{pending}</p>
        </div>
        <div className="rounded-xl bg-green-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-800/60 mb-1">Approved</p>
          <p className="text-xl font-black text-[#0F172A]">{localClaims.filter(c => c.status === 'Approved').length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['All', 'Pending Pre-Auth', 'In Process', 'Approved', 'Rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === f ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Claims */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FileText className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-semibold">No claims in this status</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(claim => (
            <Card key={claim.id} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50/80 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#0F172A] text-sm">{claim.id}</p>
                      <NeonBadge variant={STATUS_COLOR[claim.status] as any}>{claim.status}</NeonBadge>
                    </div>
                    <p className="text-sm text-[#64748B] mt-0.5">{claim.patientName} · {claim.provider}</p>
                    <p className="text-xs font-bold text-[#0F172A] mt-0.5">₹{claim.amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {claim.aiProbability !== undefined && (
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Score</p>
                      <p className={`text-base font-black ${claim.aiProbability >= 80 ? 'text-green-600' : claim.aiProbability >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {claim.aiProbability}%
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {claim.aiProbability >= 80 ? 'High' : claim.aiProbability >= 50 ? 'Medium' : 'Low'} approval
                      </p>
                    </div>
                  )}
                  {(claim.status === 'Pending Pre-Auth' || claim.status === 'In Process') && (
                    <button
                      onClick={() => setReviewing(claim)}
                      className="px-4 py-2 rounded-xl bg-teal-50/80 hover:bg-teal-100 text-teal-700 text-sm font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Review
                    </button>
                  )}
                  {claim.status === 'Approved' && (
                    <div className="flex items-center gap-1 text-sm font-bold text-green-600">
                      <CheckCircle className="h-4 w-4" /> Approved
                    </div>
                  )}
                  {claim.status === 'Rejected' && (
                    <div className="flex items-center gap-1 text-sm font-bold text-red-600">
                      <XCircle className="h-4 w-4" /> Rejected
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {reviewing && <ReviewModal claim={reviewing} onClose={handleReviewClose} />}
      </AnimatePresence>
    </div>
  )
}
