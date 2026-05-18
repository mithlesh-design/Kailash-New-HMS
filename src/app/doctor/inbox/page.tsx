"use client"

import { useNotificationStore } from "@/store/useNotificationStore"
import { Bell, CheckCircle } from "lucide-react"

export default function DoctorInbox() {
  const { notifications, markRead, markAllRead } = useNotificationStore()
  const relevant = notifications.filter((n) => !n.targetRole || n.targetRole === 'doctor')

  const priorityColor = (p: string) => {
    if (p === 'critical') return 'border-l-4 border-l-red-500 bg-red-50'
    if (p === 'high') return 'border-l-4 border-l-orange-400 bg-orange-50'
    return 'border-l-4 border-l-slate-200 bg-slate-50'
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inbox</h2>
          <p className="text-slate-500 text-sm mt-1">Lab results, referrals, and clinical alerts</p>
        </div>
        <button onClick={markAllRead} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {relevant.map((n) => (
          <div key={n.id} className={`p-4 rounded-xl border border-slate-200 ${priorityColor(n.priority)} ${!n.read ? 'ring-1 ring-blue-200' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Bell className={`h-5 w-5 mt-0.5 flex-shrink-0 ${n.priority === 'critical' ? 'text-red-500' : n.priority === 'high' ? 'text-orange-500' : 'text-slate-400'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex-shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {relevant.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm font-medium">Inbox clear</p>
          </div>
        )}
      </div>
    </div>
  )
}
