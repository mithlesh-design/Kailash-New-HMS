"use client"

import { useState } from "react"
import { predictPharmacySupply } from "@/ai-services/supply-predict"
import { HitlReviewCard } from "@/components/features/HitlReviewCard"
import type { SupplyForecast } from "@/ai-services/supply-predict"
import type { AiEnvelope } from "@/types/ai"
import { Bot, Loader2, Package, AlertTriangle } from "lucide-react"

const STOCK = [
  { id: 'D-001', name: 'Amoxicillin 500mg', category: 'Antibiotic', qty: 240, unit: 'Caps', reorderAt: 200, maxStock: 1000 },
  { id: 'D-002', name: 'Metformin 500mg', category: 'Antidiabetic', qty: 850, unit: 'Tabs', reorderAt: 300, maxStock: 2000 },
  { id: 'D-003', name: 'Paracetamol 500mg', category: 'Analgesic', qty: 3200, unit: 'Tabs', reorderAt: 500, maxStock: 5000 },
  { id: 'D-004', name: 'Morphine 10mg/mL', category: 'Opioid', qty: 12, unit: 'Vials', reorderAt: 20, maxStock: 100 },
]

export default function PharmacyInventory() {
  const [forecast, setForecast] = useState<AiEnvelope<SupplyForecast> | null>(null)
  const [loading, setLoading] = useState(false)

  const runForecast = async () => {
    setLoading(true)
    const result = await predictPharmacySupply('D-001')
    setForecast(result)
    setLoading(false)
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pharmacy Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Stock levels, reorder alerts, and AI supply prediction</p>
        </div>
        <button onClick={runForecast} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />} AI Supply Forecast
        </button>
      </div>

      {forecast && (
        <HitlReviewCard
          envelope={forecast}
          title="AI Supply Prediction"
          featureId="pharmacy-supply-predict"
          renderContent={(data) => (
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">{data.itemName}</span> — Current: {data.currentStock} {data.unit}</p>
              <p>7-day forecast demand: <span className="font-semibold text-amber-600">{data.forecastedDemand7d} {data.unit}</span></p>
              <p>Days to stockout: <span className={`font-bold ${data.daysToStockout < 7 ? 'text-red-600' : 'text-green-600'}`}>{data.daysToStockout} days</span></p>
              <p>Suggested order: <span className="font-semibold">{data.suggestedOrderQty} {data.unit}</span></p>
            </div>
          )}
          onAccept={() => {}}
          onReject={() => setForecast(null)}
        />
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Drug', 'Category', 'Quantity', 'Unit', 'Reorder At', 'Stock Level', 'Alert'].map((h) => (
              <th key={h} scope="col" className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {STOCK.map((item) => {
              const pct = Math.round((item.qty / item.maxStock) * 100)
              const isLow = item.qty <= item.reorderAt
              return (
                <tr key={item.id} className={`hover:bg-slate-50 ${isLow ? 'bg-amber-50' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.category}</td>
                  <td className={`px-4 py-3 font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>{item.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{item.reorderAt}</td>
                  <td className="px-4 py-3 min-w-24">
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className={`h-2 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pct}%</p>
                  </td>
                  <td className="px-4 py-3">
                    {isLow && <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><AlertTriangle className="h-3.5 w-3.5" />Reorder</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
