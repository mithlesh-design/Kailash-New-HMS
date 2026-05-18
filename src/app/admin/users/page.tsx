"use client"

import { motion } from "framer-motion"
import { Shield, UserPlus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge, type BadgeVariant } from "@/components/ui/badge"

const USERS = [
  { id: 'DR-1012', name: 'Dr. Priya Menon',  role: 'Doctor',     dept: 'General Medicine', status: 'active' },
  { id: 'DR-1013', name: 'Dr. Rohan Mehta',  role: 'Doctor',     dept: 'Cardiology',       status: 'active' },
  { id: 'RC-204',  name: 'Sunita Joshi',      role: 'Reception',  dept: 'Front Desk',       status: 'active' },
  { id: 'RC-205',  name: 'Abhay Nair',        role: 'Reception',  dept: 'OPD',              status: 'inactive' },
  { id: 'ADM-01',  name: 'Rajesh Kulkarni',   role: 'Admin',      dept: 'Administration',   status: 'active' },
  { id: 'VAL-01',  name: 'Archana Patil',     role: 'Validator',  dept: 'Claims',           status: 'active' },
]

const ROLE_VARIANT: Record<string, BadgeVariant> = {
  Doctor:    'primary',
  Reception: 'teal',
  Admin:     'purple',
  Validator: 'warning',
}

export default function AdminUsers() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500">Manage roles, access, and permissions (RBAC)</p>
        </div>
        <Button icon={UserPlus}>Add User</Button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['User', 'ID', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                <th key={h} scope="col" className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {USERS.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <span className="text-sm font-semibold text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{u.id}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={ROLE_VARIANT[u.role] ?? 'default'}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{u.dept}</td>
                <td className="px-5 py-3.5">
                  <Badge
                    variant={u.status === 'active' ? 'success' : 'muted'}
                    dot
                    pulse={u.status === 'active'}
                  >
                    {u.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button
                      aria-label={`Edit ${u.name}`}
                      className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-blue-600 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label={`Delete ${u.name}`}
                      className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
