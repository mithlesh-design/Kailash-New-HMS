"use client"
import { useState } from "react"
import { use } from "react"
import { motion } from "framer-motion"
import { Receipt, CreditCard, CheckCircle2, AlertCircle, Smartphone, Banknote, ShieldCheck } from "lucide-react"
import { useBillingStore, type ChargeType } from "@/store/useBillingStore"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TYPE_CONFIG: Record<ChargeType, { label: string; color: string }> = {
  consultation: { label: 'Consultation',  color: 'text-blue-600 bg-blue-50' },
  lab:          { label: 'Laboratory',    color: 'text-purple-600 bg-purple-50' },
  radiology:    { label: 'Radiology',     color: 'text-indigo-600 bg-indigo-50' },
  pharmacy:     { label: 'Pharmacy',      color: 'text-pink-600 bg-pink-50' },
  ward:         { label: 'Ward / Room',   color: 'text-teal-600 bg-teal-50' },
  procedure:    { label: 'Procedure',     color: 'text-orange-600 bg-orange-50' },
  consumable:   { label: 'Consumables',   color: 'text-slate-600 bg-slate-50' },
  nursing:      { label: 'Nursing',       color: 'text-green-600 bg-green-50' },
  ot:           { label: 'OT Charges',    color: 'text-red-600 bg-red-50' },
}

const CHARGE_TYPES: ChargeType[] = ['consultation', 'lab', 'radiology', 'pharmacy', 'ward', 'procedure', 'consumable', 'nursing', 'ot']

export default function PatientBillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { bills, lineItems, getBillForPatient, getItemsForPatient, freezeBill, applyInsuranceCoverage, recordPayment } = useBillingStore()

  const bill = getBillForPatient(id)
  const items = getItemsForPatient(id)

  const [payAmount, setPayAmount] = useState("")
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Card' | 'Insurance'>('Cash')
  const [showPayment, setShowPayment] = useState(false)

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-slate-400" />
        <p className="text-lg font-bold text-slate-600">No bill found for this patient</p>
      </div>
    )
  }

  const outstanding = bill.patientDue - bill.paidAmount
  const grouped = CHARGE_TYPES.reduce((acc, type) => {
    const typeItems = items.filter(i => i.type === type)
    if (typeItems.length > 0) acc[type] = typeItems
    return acc
  }, {} as Record<ChargeType, typeof items>)

  const handlePayment = () => {
    const amt = parseFloat(payAmount)
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return }
    if (amt > outstanding) { toast.error(`Amount exceeds outstanding balance of ₹${outstanding.toLocaleString('en-IN')}`); return }
    recordPayment(bill.id, amt, payMode)
    toast.success(`₹${amt.toLocaleString('en-IN')} collected via ${payMode}. Receipt generated.`)
    setPayAmount("")
    setShowPayment(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Bill Header */}
      <div className="bg-white border shadow-sm rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{bill.patientName}</h2>
            <p className="text-sm text-slate-500 mt-1">{bill.id} • {bill.visitType} • {bill.payerType}</p>
            {bill.admissionDate && <p className="text-xs text-slate-400 mt-0.5">Admitted: {new Date(bill.admissionDate).toLocaleDateString('en-IN')}</p>}
          </div>
          <div className="text-right">
            <NeonBadge variant={bill.status === 'settled' ? 'success' : bill.status === 'frozen' ? 'blue' : 'warning'} className="text-sm px-3 py-1">
              {bill.status.toUpperCase()}
            </NeonBadge>
          </div>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Gross Total", value: bill.subtotal, color: "text-slate-900" },
            { label: "Discounts", value: -bill.discounts, color: "text-green-600" },
            { label: "Non-Payables", value: -bill.nonPayables, color: "text-orange-600" },
            { label: "Insurance", value: -bill.insuranceCovered, color: "text-purple-600" },
            { label: "Patient Due", value: bill.patientDue, color: "text-red-600 text-xl" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className={cn("font-bold", color)}>
                {value < 0 ? `- ₹${Math.abs(value).toLocaleString('en-IN')}` : `₹${value.toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {bill.paidAmount > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
            <span className="text-sm font-semibold text-green-800">Amount Paid: ₹{bill.paidAmount.toLocaleString('en-IN')}</span>
            <span className={cn("text-sm font-bold", outstanding > 0 ? "text-red-700" : "text-green-700")}>
              {outstanding > 0 ? `Balance Due: ₹${outstanding.toLocaleString('en-IN')}` : "Fully Settled ✓"}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
          {bill.status === 'draft' && (
            <Button variant="secondary" onClick={() => { freezeBill(bill.id); toast.success("Bill frozen — ready for final settlement") }}>
              Freeze Bill
            </Button>
          )}
          {bill.insuranceCovered === 0 && bill.payerType.toLowerCase().includes('cashless') && (
            <Button variant="secondary" onClick={() => { applyInsuranceCoverage(bill.id, Math.floor(bill.subtotal * 0.8)); toast.success("Insurance coverage applied") }}>
              <ShieldCheck className="h-4 w-4 mr-1.5" /> Apply Insurance Coverage
            </Button>
          )}
          {outstanding > 0 && (
            <Button onClick={() => setShowPayment(!showPayment)}>
              <CreditCard className="h-4 w-4 mr-1.5" /> Collect Payment
            </Button>
          )}
          {bill.status === 'settled' && bill.receiptNumber && (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Receipt: {bill.receiptNumber}
            </div>
          )}
        </div>

        {/* Payment panel */}
        {showPayment && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-sm font-bold text-slate-700">Collect Payment — Outstanding: ₹{outstanding.toLocaleString('en-IN')}</p>
            <div className="flex gap-2">
              {(['Cash', 'UPI', 'Card', 'Insurance'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPayMode(mode)}
                  className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer",
                    payMode === mode ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {mode === 'Cash' && <Banknote className="h-3.5 w-3.5" />}
                  {mode === 'UPI' && <Smartphone className="h-3.5 w-3.5" />}
                  {mode === 'Card' && <CreditCard className="h-3.5 w-3.5" />}
                  {mode === 'Insurance' && <ShieldCheck className="h-3.5 w-3.5" />}
                  {mode}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                placeholder={`Amount (max ₹${outstanding.toLocaleString('en-IN')})`}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handlePayment}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Itemized charges */}
      <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Itemized Charges</h3>
        </div>

        {Object.entries(grouped).map(([type, typeItems]) => {
          const cfg = TYPE_CONFIG[type as ChargeType]
          const subtotal = typeItems.reduce((a, i) => a + i.amount * i.quantity, 0)
          return (
            <div key={type} className="border-b border-slate-100 last:border-0">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50/50">
                <span className={cn("text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", cfg.color)}>{cfg.label}</span>
                <span className="text-sm font-bold text-slate-700">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {typeItems.map(item => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", item.isNonPayable ? "text-slate-400 line-through" : "text-slate-900")}>{item.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(item.date).toLocaleDateString('en-IN')} • {item.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{(item.amount * item.quantity).toLocaleString('en-IN')}</p>
                    {item.quantity > 1 && <p className="text-xs text-slate-400">₹{item.amount} × {item.quantity}</p>}
                    {item.isNonPayable && <p className="text-[10px] text-orange-600 font-semibold">Non-payable</p>}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">No charges recorded yet</div>
        )}
      </div>
    </div>
  )
}
