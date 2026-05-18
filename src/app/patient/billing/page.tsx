"use client"

import { motion } from "framer-motion"
import { Receipt, CreditCard, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const BILLS = [
  { id: 'INV-2026-001', date: 'Today', items: [{ desc: 'OPD Consultation', amount: 500 }, { desc: 'Paracetamol 500mg x10', amount: 85 }, { desc: 'Cetirizine 10mg x5', amount: 60 }], status: 'pending' },
  { id: 'INV-2026-002', date: '20 Apr 2026', items: [{ desc: 'OPD Consultation', amount: 500 }, { desc: 'Amlodipine 5mg x30', amount: 180 }], status: 'paid' },
]

export default function PatientBilling() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <h2 className="text-lg font-bold">Billing & Payments</h2>
      {BILLS.map((bill, i) => {
        const total = bill.items.reduce((s, it) => s + it.amount, 0)
        return (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-white rounded-xl border p-5 ${bill.status === 'pending' ? 'border-amber-300' : 'border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold">{bill.id}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{bill.date}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${bill.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'}`}>
                {bill.status === 'paid' ? '✓ Paid' : 'Pending'}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {bill.items.map((item, j) => (
                <div key={j} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.desc}</span>
                  <span className="font-semibold">₹{item.amount}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-blue-600">₹{total}</span>
              </div>
            </div>
            {bill.status === 'pending' && (
              <div className="flex gap-2">
                <Button className="flex-1 gap-2"><CreditCard className="h-4 w-4" />Pay with UPI</Button>
                <Button variant="outline" className="flex-1">Pay at Counter</Button>
              </div>
            )}
            {bill.status === 'paid' && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Payment successful — Medicines dispensed at pharmacy
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
