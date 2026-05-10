import { create } from 'zustand'

export type ChargeType = 'consultation' | 'lab' | 'radiology' | 'pharmacy' | 'ward' | 'procedure' | 'consumable' | 'nursing' | 'ot'

export type ChargeLineItem = {
  id: string
  patientId: string
  type: ChargeType
  description: string
  amount: number
  quantity: number
  date: string
  source: string
  isNonPayable?: boolean
}

export type BillStatus = 'draft' | 'frozen' | 'settled' | 'dispute'

export type Bill = {
  id: string
  patientId: string
  patientName: string
  visitType: 'OPD' | 'IPD' | 'Emergency' | 'Day Care'
  admissionDate?: string
  dischargeDate?: string
  subtotal: number
  discounts: number
  nonPayables: number
  insuranceCovered: number
  patientDue: number
  status: BillStatus
  payerType: string
  paymentMode?: 'Cash' | 'UPI' | 'Card' | 'Insurance'
  paidAmount: number
  receiptNumber?: string
}

interface BillingState {
  bills: Bill[]
  lineItems: ChargeLineItem[]
  addCharge: (charge: Omit<ChargeLineItem, 'id'>) => void
  freezeBill: (billId: string) => void
  applyInsuranceCoverage: (billId: string, amount: number) => void
  recordPayment: (billId: string, amount: number, mode: Bill['paymentMode']) => void
  getBillForPatient: (patientId: string) => Bill | undefined
  getItemsForPatient: (patientId: string) => ChargeLineItem[]
}

const MOCK_BILLS: Bill[] = [
  {
    id: 'BILL-2024-001',
    patientId: 'PT-10203',
    patientName: 'Mohan Lal',
    visitType: 'IPD',
    admissionDate: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    subtotal: 42500,
    discounts: 0,
    nonPayables: 1200,
    insuranceCovered: 38000,
    patientDue: 4500,
    status: 'draft',
    payerType: 'Cashless (Star Health)',
    paidAmount: 0,
  },
  {
    id: 'BILL-2024-002',
    patientId: 'PT-10202',
    patientName: 'Priya Sharma',
    visitType: 'IPD',
    admissionDate: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    subtotal: 28000,
    discounts: 2000,
    nonPayables: 500,
    insuranceCovered: 0,
    patientDue: 25500,
    status: 'draft',
    payerType: 'General (Cash)',
    paidAmount: 10000,
  },
  {
    id: 'BILL-2024-003',
    patientId: 'PT-10234',
    patientName: 'Aarav Sharma',
    visitType: 'OPD',
    subtotal: 1800,
    discounts: 0,
    nonPayables: 0,
    insuranceCovered: 0,
    patientDue: 1800,
    status: 'draft',
    payerType: 'General',
    paidAmount: 0,
  },
]

const MOCK_LINE_ITEMS: ChargeLineItem[] = [
  { id: 'CI-001', patientId: 'PT-10203', type: 'ward', description: 'Semi-Private Room (4 days)', amount: 12000, quantity: 4, date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), source: 'Ward' },
  { id: 'CI-002', patientId: 'PT-10203', type: 'nursing', description: 'Nursing Charges (4 days)', amount: 4000, quantity: 4, date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), source: 'Nursing' },
  { id: 'CI-003', patientId: 'PT-10203', type: 'consultation', description: 'Physician Consultation', amount: 1500, quantity: 1, date: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), source: 'OPD' },
  { id: 'CI-004', patientId: 'PT-10203', type: 'lab', description: 'HbA1c', amount: 800, quantity: 1, date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), source: 'Lab' },
  { id: 'CI-005', patientId: 'PT-10203', type: 'lab', description: 'Renal Function Test (RFT)', amount: 600, quantity: 1, date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), source: 'Lab' },
  { id: 'CI-006', patientId: 'PT-10203', type: 'pharmacy', description: 'Insulin (Lantus 10mL)', amount: 2200, quantity: 2, date: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), source: 'Pharmacy' },
  { id: 'CI-007', patientId: 'PT-10203', type: 'pharmacy', description: 'IV Fluids & Consumables', amount: 1800, quantity: 1, date: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), source: 'Pharmacy', isNonPayable: false },
  { id: 'CI-008', patientId: 'PT-10203', type: 'consumable', description: 'Gloves, syringes (non-payable)', amount: 1200, quantity: 1, date: new Date(Date.now() - 1 * 24 * 3600000).toISOString(), source: 'Nursing', isNonPayable: true },

  { id: 'CI-010', patientId: 'PT-10202', type: 'ward', description: 'General Ward (3 days)', amount: 6000, quantity: 3, date: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), source: 'Ward' },
  { id: 'CI-011', patientId: 'PT-10202', type: 'procedure', description: 'Laparoscopic Appendectomy', amount: 18000, quantity: 1, date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), source: 'OT' },
  { id: 'CI-012', patientId: 'PT-10202', type: 'lab', description: 'Pre-op CBC & LFT Panel', amount: 1400, quantity: 1, date: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), source: 'Lab' },
  { id: 'CI-013', patientId: 'PT-10202', type: 'pharmacy', description: 'Antibiotics (3 days)', amount: 900, quantity: 3, date: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), source: 'Pharmacy' },

  { id: 'CI-020', patientId: 'PT-10234', type: 'consultation', description: 'OPD Consultation', amount: 500, quantity: 1, date: new Date().toISOString(), source: 'OPD' },
  { id: 'CI-021', patientId: 'PT-10234', type: 'lab', description: 'Complete Blood Count (CBC)', amount: 400, quantity: 1, date: new Date().toISOString(), source: 'Lab' },
  { id: 'CI-022', patientId: 'PT-10234', type: 'pharmacy', description: 'Prescription Medicines', amount: 900, quantity: 1, date: new Date().toISOString(), source: 'Pharmacy' },
]

export const useBillingStore = create<BillingState>((set, get) => ({
  bills: MOCK_BILLS,
  lineItems: MOCK_LINE_ITEMS,

  addCharge: (charge) =>
    set((s) => ({
      lineItems: [...s.lineItems, { ...charge, id: `CI-${Date.now()}` }],
      bills: s.bills.map(b => {
        if (b.patientId !== charge.patientId) return b
        const addedAmt = charge.amount * charge.quantity
        return { ...b, subtotal: b.subtotal + addedAmt, patientDue: b.patientDue + addedAmt - (charge.isNonPayable ? addedAmt : 0) }
      }),
    })),

  freezeBill: (billId) =>
    set((s) => ({
      bills: s.bills.map(b => b.id === billId ? { ...b, status: 'frozen' } : b),
    })),

  applyInsuranceCoverage: (billId, amount) =>
    set((s) => ({
      bills: s.bills.map(b =>
        b.id === billId ? { ...b, insuranceCovered: amount, patientDue: Math.max(0, b.subtotal - b.discounts - b.nonPayables - amount) } : b
      ),
    })),

  recordPayment: (billId, amount, mode) =>
    set((s) => ({
      bills: s.bills.map(b => {
        if (b.id !== billId) return b
        const newPaid = b.paidAmount + amount
        return { ...b, paidAmount: newPaid, paymentMode: mode, status: newPaid >= b.patientDue ? 'settled' : b.status, receiptNumber: `RCT-${Date.now()}` }
      }),
    })),

  getBillForPatient: (patientId) => get().bills.find(b => b.patientId === patientId),
  getItemsForPatient: (patientId) => get().lineItems.filter(i => i.patientId === patientId),
}))
