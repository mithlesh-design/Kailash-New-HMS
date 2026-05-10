"use client"

import { useState } from "react"
import { useInventoryStore, type Asset } from "@/store/useInventoryStore"
import { Package, AlertTriangle, Search, Settings, CheckCircle, X, Wrench } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

function RepairModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const [date, setDate] = useState('')
  const [tech, setTech] = useState('')

  const handleSubmit = () => {
    if (!date) return
    toast.success(`Repair scheduled for ${asset.name} on ${date}`)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="repair-title"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="repair-title" className="text-base font-bold text-slate-900">Schedule Repair</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
          <p className="text-sm font-bold text-amber-900">{asset.name}</p>
          {asset.aiMaintenanceAlert && <p className="text-xs text-amber-700 mt-0.5">{asset.aiMaintenanceAlert}</p>}
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="repair-date" className="block text-sm font-semibold text-slate-700 mb-1.5">Repair Date *</label>
            <input type="date" id="repair-date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label htmlFor="repair-tech" className="block text-sm font-semibold text-slate-700 mb-1.5">Technician (optional)</label>
            <input id="repair-tech" value={tech} onChange={e => setTech(e.target.value)} placeholder="Name or team" className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={!date} className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50">
            Schedule
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function InventoryStockPage() {
  const { assets, lowStockItems } = useInventoryStore()
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState<'All' | Asset['status']>('All')
  const [repairing, setRepairing] = useState<Asset | null>(null)

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || a.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Stock Levels</h1>
        <p className="text-sm text-[#64748B] mt-1">Asset and consumable inventory tracking</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-amber-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/60 mb-1">Total Assets</p>
          <p className="text-xl font-black text-[#0F172A]">{assets.length}</p>
        </div>
        <div className="rounded-xl bg-red-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-800/60 mb-1">Low Stock / Maintenance</p>
          <p className="text-xl font-black text-[#0F172A]">{assets.filter(a => a.status !== 'Active').length}</p>
        </div>
        <div className="rounded-xl bg-green-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-800/60 mb-1">Active</p>
          <p className="text-xl font-black text-[#0F172A]">{assets.filter(a => a.status === 'Active').length}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search assets..."
            aria-label="Search assets"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Active', 'Low Stock', 'Maintenance Required'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filter === f ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="h-10 w-10 mb-3 opacity-40" />
          <p className="font-semibold">No assets match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(asset => (
            <Card key={asset.id} className={`p-5 ${asset.status === 'Maintenance Required' ? 'border-amber-200 bg-amber-50/20' : asset.status === 'Low Stock' ? 'border-red-200 bg-red-50/20' : ''}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${asset.category === 'Equipment' ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-200'}`}>
                    {asset.category === 'Equipment' ? <Settings className="h-5 w-5 text-blue-600" /> : <Package className="h-5 w-5 text-slate-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#0F172A] text-sm">{asset.name}</p>
                      <NeonBadge variant={asset.status === 'Active' ? 'success' : asset.status === 'Low Stock' ? 'danger' : 'warning'}>
                        {asset.status}
                      </NeonBadge>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{asset.id} · {asset.category}</p>
                    {asset.quantity !== undefined && (
                      <p className={`text-xs font-bold mt-0.5 ${asset.quantity === 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        Qty: {asset.quantity === 0 ? 'Out of stock' : asset.quantity}
                      </p>
                    )}
                    {asset.aiMaintenanceAlert && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-amber-700" role="alert">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        {asset.aiMaintenanceAlert}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {asset.status === 'Maintenance Required' && (
                    <button
                      onClick={() => setRepairing(asset)}
                      aria-label={`Schedule repair for ${asset.name}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors cursor-pointer border border-amber-200"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Schedule Repair
                    </button>
                  )}
                  {asset.status === 'Low Stock' && (
                    <button
                      onClick={() => toast.success(`Reorder requested for ${asset.name}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer border border-red-200"
                    >
                      Reorder
                    </button>
                  )}
                  {asset.status === 'Active' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle className="h-4 w-4" /> Active
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {repairing && <RepairModal asset={repairing} onClose={() => setRepairing(null)} />}
      </AnimatePresence>
    </div>
  )
}
