"use client"

import { motion } from "framer-motion"
import { Calendar } from "lucide-react"

const SLOTS = [
  { time: '09:00 AM', patient: 'Meera Pillai', status: 'done' },
  { time: '09:30 AM', patient: 'Aarav Sharma', status: 'in-progress' },
  { time: '10:00 AM', patient: 'Sonal Desai', status: 'upcoming' },
  { time: '10:30 AM', patient: 'Kiran Patil', status: 'upcoming' },
  { time: '11:00 AM', patient: 'Nalini Kumar', status: 'upcoming' },
  { time: '11:30 AM', patient: '—', status: 'open' },
  { time: '12:00 PM', patient: '—', status: 'open' },
]

const statusStyle: Record<string, string> = {
  'done': 'bg-green-50 border-green-200 opacity-60',
  'in-progress': 'bg-blue-50 border-blue-200',
  'upcoming': 'bg-white border-slate-200',
  'open': 'bg-slate-50 border-dashed border-slate-200',
}

export default function DoctorSchedule() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-bold">Today's Schedule</h2>
      {SLOTS.map(({ time, patient, status }, i) => (
        <motion.div
          key={time}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
          className={`flex items-center gap-4 rounded-xl border p-4 ${statusStyle[status]}`}
        >
          <div className="w-24 text-sm font-bold text-slate-500">{time}</div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${status === 'open' ? 'text-slate-400' : 'text-slate-900'}`}>{patient}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            status === 'done' ? 'bg-green-600 text-white' :
            status === 'in-progress' ? 'bg-blue-600 text-white' :
            status === 'open' ? 'text-slate-400 bg-slate-200' :
            'bg-amber-50 text-amber-600'
          }`}>
            {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
