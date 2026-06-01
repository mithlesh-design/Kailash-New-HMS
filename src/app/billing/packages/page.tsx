"use client"

const PACKAGES = [
  { id: 'PKG-001', name: 'Maternity Package — Normal Delivery', category: 'Obstetrics', price: 35000, includes: ['Delivery room', 'Paediatrician visit', 'Nursing care 3 days', 'Basic labs', 'Meals'] },
  { id: 'PKG-002', name: 'Maternity Package — C-Section', category: 'Obstetrics', price: 65000, includes: ['OT charges', 'Anaesthesia', 'Surgeon fee', 'Nursing care 5 days', 'Basic labs', 'Meals'] },
  { id: 'PKG-003', name: 'Cardiac Care Package — CABG', category: 'Cardiology', price: 320000, includes: ['Surgery', 'ICU 2 days', 'Ward 5 days', 'Implants', 'Cardiac monitoring', 'Physio'] },
  { id: 'PKG-004', name: 'Knee Replacement Package', category: 'Orthopaedics', price: 185000, includes: ['Surgery', 'Implant (cemented TKR)', 'Anaesthesia', 'Ward 4 days', 'Physio 5 sessions'] },
  { id: 'PKG-005', name: 'Laparoscopic Cholecystectomy', category: 'General Surgery', price: 55000, includes: ['OT charges', 'Anaesthesia', 'Ward 2 days', 'Basic labs', 'Meals'] },
]

export default function BillingPackages() {
  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Package Pricing</h2>
          <p className="text-slate-500 text-sm mt-1">{PACKAGES.length} bundled packages — all-inclusive pricing</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">
          + New Package
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">{pkg.category}</span>
            </div>
            <p className="font-bold text-slate-900 leading-tight mb-2">{pkg.name}</p>
            <p className="text-2xl font-black text-blue-700 mb-3">₹{pkg.price.toLocaleString('en-IN')}</p>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Includes</p>
              <ul className="space-y-1">
                {pkg.includes.map((item, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-4 w-full py-2 text-sm font-semibold border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors">
              Apply to Bill
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
