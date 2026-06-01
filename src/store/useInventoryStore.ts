import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Asset = {
  id: string
  name: string
  category: 'Equipment' | 'Consumable'
  status: 'Active' | 'Low Stock' | 'Maintenance Required'
  quantity?: number
  aiMaintenanceAlert?: string
}

interface InventoryState {
  totalAssetsValue: number
  lowStockItems: number
  assets: Asset[]
}

export const useInventoryStore = create<InventoryState>()(persist((): InventoryState => ({
  totalAssetsValue: 55000000,
  lowStockItems: 12,
  assets: [
    { id: 'EQ-001', name: 'MRI Scanner (Siemens)', category: 'Equipment', status: 'Maintenance Required', aiMaintenanceAlert: 'Cooling system anomaly detected. Predict failure in 5 days.' },
    { id: 'CS-105', name: 'N95 Masks', category: 'Consumable', status: 'Low Stock', quantity: 150 },
    { id: 'EQ-002', name: 'Portable Ventilator', category: 'Equipment', status: 'Active' },
  ],
}),
  {
    name: 'kailash-inventorystore', version: 1,
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
  },
))
