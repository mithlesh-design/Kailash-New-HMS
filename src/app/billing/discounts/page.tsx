"use client"

import { useState } from "react"
import { CheckCircle, Clock } from "lucide-react"

type DiscountStatus = 'pending' | 'approved' | 'rejected'

const DISCOUNT_REQUESTS: Array<{ id: string; patient: string; billId: string; billAmount: number; discountPct: number; reason: string; requestedBy: string; status: DiscountStatus }> = [
  { id: 'DISC-001', patient: 'Ramu Prasad', billId: 'BILL-2026-0044', billAmount: 28000, discountPct: 20, reason: 'BPL card holder', requestedBy: 'Dr. Priya Menon', status: 'pending' },
  { id: 'DISC-002', patient: 'Lata Bai', billId: 'BILL-2026-0042', billAmount: 12000, discountPct: 10, reason: 'Senior citizen — 10% hospital policy', requestedBy: 'Reception', status: 'approved' },
]

export default function BillingDiscounts() {
  const [requests, setRequests] = useState(DISCOUNT_REQUESTS)

  const update = (id: string, status: DiscountStatus) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Discount Authorizations</h2>
      <div className="space-y-3">
        {requests.map((r) => {
          const discountAmount = Math.round(r.billAmount * r.discountPct / 100)
          const netAmount = r.billAmount - discountAmount
          return (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{r.patient} <span className="text-slate-400 font-normal text-sm">({r.billId})</span></p>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="text-slate-500">Bill: <span className="font-semibold text-slate-800">₹{r.billAmount.toLocaleString('en-IN')}</span></span>
                    <span className="text-amber-600 font-bold">−{r.discountPct}% (₹{discountAmount.toLocaleString('en-IN')})</span>
                    <span className="text-green-700 font-bold">Net: ₹{netAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Reason: {r.reason}</p>
                  <p className="text-xs text-slate-400">Requested by: {r.requestedBy}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status === 'approved' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {r.status.toUpperCase()}
                  </span>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => update(r.id, 'approved')} className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg">Approve</button>
                      <button onClick={() => update(r.id, 'rejected')} className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
