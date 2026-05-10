"use client"

import { useState } from "react"
import { useDrugMasterStore } from "@/store/useDrugMasterStore"
import { Search, Package } from "lucide-react"

export default function DrugMaster() {
  const { drugs, search } = useDrugMasterStore()
  const [query, setQuery] = useState('')
  const results = query ? search(query) : drugs

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Drug Master</h2>
        <p className="text-slate-500 text-sm mt-1">Coded drug catalog with interactions and allergy classes</p>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search generic or brand name..." className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((drug) => (
          <div key={drug.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{drug.genericName}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${drug.schedule === 'X' ? 'bg-red-100 text-red-700' : drug.schedule === 'H1' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>Sch. {drug.schedule}</span>
                  {drug.requiresDualSignature && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">DUAL-SIG</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{drug.brandNames.join(', ')}</p>
                <p className="text-xs text-slate-600 mt-1">{drug.form} · {drug.strength}</p>
              </div>
              <Package className="h-5 w-5 text-slate-300 flex-shrink-0" />
            </div>
            {drug.interactions.length > 0 && (
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                <span className="font-bold">Interactions:</span> {drug.interactions.join(', ')}
              </div>
            )}
            {drug.allergyClasses.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <span className="font-bold">Allergy class:</span> {drug.allergyClasses.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
