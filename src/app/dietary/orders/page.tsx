"use client"

import { useDietaryStore } from "@/store/useDietaryStore"
import { CheckCircle, Clock } from "lucide-react"

export default function DietaryOrders() {
  const { mealOrders, updateMealOrder } = useDietaryStore()

  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Meal Orders</h2>
      <div className="space-y-3">
        {mealOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{order.patientName} — {order.mealType}</p>
                <p className="text-sm text-slate-500 mt-0.5">{order.ward} · {order.bedNumber}</p>
                <p className="text-xs text-slate-600 mt-1">Items: {order.items.join(', ')}</p>
                <p className="text-xs text-slate-400 mt-1">Scheduled: {new Date(order.scheduledAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {order.status === 'delivered'
                  ? <CheckCircle className="h-5 w-5 text-green-500" />
                  : (
                    <button
                      onClick={() => updateMealOrder(order.id, { status: 'delivered', deliveredAt: new Date().toISOString() })}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark Delivered
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
