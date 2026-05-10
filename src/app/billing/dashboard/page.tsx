"use client"
import { motion } from "framer-motion"
import { Receipt, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { useBillingStore } from "@/store/useBillingStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const DAILY_REVENUE = [
  { day: 'Mon', collected: 82000, outstanding: 34000 },
  { day: 'Tue', collected: 91000, outstanding: 28000 },
  { day: 'Wed', collected: 78000, outstanding: 42000 },
  { day: 'Thu', collected: 115000, outstanding: 19000 },
  { day: 'Fri', collected: 98000, outstanding: 31000 },
  { day: 'Sat', collected: 64000, outstanding: 22000 },
  { day: 'Sun', collected: 43000, outstanding: 15000 },
]

const STATUS_STYLE: Record<string, { bg: string; border: string; badge: "success" | "warning" | "blue" | "muted" | "danger" }> = {
  draft:    { bg: "bg-yellow-50", border: "border-yellow-200", badge: "warning" },
  frozen:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "blue" },
  settled:  { bg: "bg-green-50",  border: "border-green-200",  badge: "success" },
  dispute:  { bg: "bg-red-50",    border: "border-red-200",    badge: "danger" },
}

export default function BillingDashboard() {
  const { bills } = useBillingStore()

  const totalOutstanding = bills.filter(b => b.status !== 'settled').reduce((a, b) => a + (b.patientDue - b.paidAmount), 0)
  const totalCollected = bills.reduce((a, b) => a + b.paidAmount, 0)
  const pendingFreeze = bills.filter(b => b.status === 'draft').length
  const settled = bills.filter(b => b.status === 'settled').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Outstanding Balance", value: `₹${totalOutstanding.toLocaleString('en-IN')}`, color: "text-red-600", bg: "bg-red-50 border-red-200" },
          { label: "Collected Today", value: `₹${totalCollected.toLocaleString('en-IN')}`, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Bills Pending Freeze", value: pendingFreeze, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
          { label: "Bills Settled", value: settled, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("rounded-xl border p-5", bg)}>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recharts Revenue Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-bold text-slate-900 mb-4">Daily Revenue — This Week</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={DAILY_REVENUE} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outstanding" name="Outstanding" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bills list */}
      <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">All Bills</h2>
          {pendingFreeze > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-semibold">
              <AlertCircle className="h-4 w-4" />
              {pendingFreeze} bill(s) pending freeze
            </div>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {bills.map((bill, i) => {
            const style = STATUS_STYLE[bill.status]
            const outstanding = bill.patientDue - bill.paidAmount
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={cn("p-4 hover:bg-slate-50 transition-colors")}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", style.bg, style.border, "border")}>
                    <Receipt className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-slate-900">{bill.patientName}</p>
                      <NeonBadge variant={style.badge} className="text-[10px]">{bill.status}</NeonBadge>
                      <span className="text-xs text-slate-500">{bill.visitType}</span>
                      <span className="text-xs text-slate-500">{bill.payerType}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-slate-500">Total: <span className="font-bold text-slate-900">₹{bill.subtotal.toLocaleString('en-IN')}</span></span>
                      {bill.insuranceCovered > 0 && <span className="text-purple-600 font-medium">Insurance: ₹{bill.insuranceCovered.toLocaleString('en-IN')}</span>}
                      <span className="text-slate-500">Paid: <span className="font-bold text-green-700">₹{bill.paidAmount.toLocaleString('en-IN')}</span></span>
                      {outstanding > 0 && <span className="text-red-600 font-bold">Due: ₹{outstanding.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                  <Link href={`/billing/patient/${bill.patientId}`}>
                    <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer">
                      View Bill
                    </button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
