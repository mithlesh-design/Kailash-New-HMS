import { create } from 'zustand'

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low'
export type NotificationChannel = 'in_app' | 'sms' | 'push'
export type NotificationType =
  | 'critical_value' | 'drug_interaction' | 'allergy_alert'
  | 'bed_request' | 'discharge_ready' | 'lab_result'
  | 'appointment' | 'system' | string

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  body: string
  targetRole?: string
  targetUserId?: string
  channels: NotificationChannel[]
  read: boolean
  createdAt: string
  readAt?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  add: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
}

const SEED: Notification[] = [
  { id: 'N-001', type: 'critical_value', priority: 'critical', title: 'Critical Lab Value', body: 'Pt. Kiran Patil — K+ 6.8 mEq/L (critical high)', channels: ['in_app'], read: false, createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'N-002', type: 'drug_interaction', priority: 'high', title: 'Drug Interaction Alert', body: 'Warfarin + Aspirin — major interaction flagged', channels: ['in_app'], read: false, createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'N-003', type: 'bed_request', priority: 'medium', title: 'Bed Request Pending', body: 'ICU Bed requested for Pt. Mohan Lal', channels: ['in_app'], read: true, readAt: new Date().toISOString(), createdAt: new Date(Date.now() - 1800000).toISOString() },
]

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: SEED,
  unreadCount: SEED.filter((n) => !n.read).length,
  add: (n) =>
    set((state) => {
      const entry: Notification = { ...n, id: `N-${Date.now()}`, read: false, createdAt: new Date().toISOString() }
      return { notifications: [entry, ...state.notifications], unreadCount: state.unreadCount + 1 }
    }),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })),
      unreadCount: 0,
    })),
  dismiss: (id) =>
    set((state) => {
      const n = state.notifications.find((x) => x.id === id)
      return {
        notifications: state.notifications.filter((x) => x.id !== id),
        unreadCount: n && !n.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }),
}))
