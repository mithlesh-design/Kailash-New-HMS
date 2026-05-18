"use client"

import { useState } from "react"
import { CheckCircle, Clock, XCircle } from "lucide-react"

type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed'

const REFUND_REQUESTS: Array<{ id: string; billId: string; patient: string; amount: number; reason: string; requestedAt: string; status: RefundStatus }> = [
  { id: 'REF-001', billId: 'BILL-2026-0041', patient: 'Kiran Patil', amount: 4500, reason: 'Service not rendered — cancelled procedure', requestedAt: '2026-05-09T10:00:00Z', status: 'pending' },
  { id: 'REF-002', billId: 'BILL-2026-0038', patient: 'Priya Sharma', amount: 1200, reason: 'Duplicate charge on lab tests', requestedAt: '2026-05-08T14:00:00Z', status: 'approved' },
  { id: 'REF-003', billId: 'BILL-2026-0031', patient: 'Rahul Mehta', amount: 800, reason: 'Insurance covered — excess payment', requestedAt: '2026-05-07T09:00:00Z', status: 'processed' },
]

const STATUS_CONFIG: Record<RefundStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700',  icon: Clock },
  approved:  { label: 'Approved',  color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700',      icon: XCircle },
  processed: { label: 'Processed', color: 'bg-green-100 text-green-700',  icon: CheckCircle },
}

export default function BillingRefunds() {
  const [requests, setRequests] = useState(REFUND_REQUESTS)

  const update = (id: string, status: RefundStatus) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Refund Requests</h2>
        <p className="text-slate-500 text-sm mt-1">{requests.filter((r) => r.status === 'pending').length} pending approval</p>
      </div>
      <div className="space-y-3">
        {requests.map((r) => {
          const cfg = STATUS_CONFIG[r.status]
          const Icon = cfg.icon
          return (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{r.patient}</p>
                    <span className="text-xs text-slate-400">{r.billId}</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700 mt-0.5">₹{r.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-600 mt-1">{r.reason}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.requestedAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" /> {cfg.label}
                  </span>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => update(r.id, 'approved')} className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                      <button onClick={() => update(r.id, 'rejected')} className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
                    </div>
                  )}
                  {r.status === 'approved' && (
                    <button onClick={() => update(r.id, 'processed')} className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Mark Processed</button>
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
