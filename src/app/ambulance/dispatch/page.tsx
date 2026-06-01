"use client"

import { useState } from "react"
import { useAmbulanceStore } from "@/store/useAmbulanceStore"
import { Truck, Send } from "lucide-react"

export default function AmbulanceDispatch() {
  const { availableVehicles, dispatch } = useAmbulanceStore()
  const available = availableVehicles()
  const [form, setForm] = useState({ vehicleId: '', pickup: '', destination: '', complaint: '', caller: '', phone: '' })

  const handleDispatch = () => {
    if (!form.vehicleId || !form.pickup || !form.destination) return
    dispatch(form.vehicleId, { tripType: 'emergency', pickupLocation: form.pickup, destination: form.destination, chiefComplaint: form.complaint, callerName: form.caller, callerPhone: form.phone })
    setForm({ vehicleId: '', pickup: '', destination: '', complaint: '', caller: '', phone: '' })
  }

  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Dispatch Console</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Select Vehicle</label>
            <select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Choose available vehicle —</option>
              {available.map((v) => <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.type})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Pickup Location</label>
              <input type="text" value={form.pickup} onChange={(e) => setForm((f) => ({ ...f, pickup: e.target.value }))} placeholder="Street address" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Destination</label>
              <input type="text" value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} placeholder="Hospital / facility" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Chief Complaint</label>
            <input type="text" value={form.complaint} onChange={(e) => setForm((f) => ({ ...f, complaint: e.target.value }))} placeholder="e.g. Chest pain, RTA, Unconscious" className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Caller Name</label>
              <input type="text" value={form.caller} onChange={(e) => setForm((f) => ({ ...f, caller: e.target.value }))} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Caller Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button onClick={handleDispatch} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
            <Send className="h-4 w-4" /> Dispatch Now
          </button>
        </div>
      </div>
    </div>
  )
}
