"use client"

import { Video, Phone, Clock } from "lucide-react"

const TELE_QUEUE = [
  { id: 'TL-001', patient: 'Rajan Mehta', age: 45, reason: 'Diabetes follow-up', slot: '10:00 AM', status: 'waiting' },
  { id: 'TL-002', patient: 'Savita Devi', age: 62, reason: 'Hypertension review', slot: '10:30 AM', status: 'waiting' },
  { id: 'TL-003', patient: 'Arjun Sharma', age: 28, reason: 'Post-surgery check', slot: '11:00 AM', status: 'completed' },
]

export default function Telemedicine() {
  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Telemedicine</h2>
        <p className="text-slate-500 text-sm mt-1">Video consultation queue — WebRTC sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {TELE_QUEUE.map((patient) => (
          <div key={patient.id} className={`bg-white rounded-xl border p-4 ${patient.status === 'waiting' ? 'border-blue-200' : 'border-slate-200 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-slate-900">{patient.patient}</p>
                <p className="text-xs text-slate-500">{patient.age}Y · {patient.reason}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" /> {patient.slot}
              </div>
            </div>
            {patient.status === 'waiting' ? (
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                <Video className="h-4 w-4" /> Join Session
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-500 text-sm font-bold rounded-xl">
                <Phone className="h-4 w-4" /> Completed
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold">WebRTC Integration Note</p>
        <p className="mt-1 text-blue-700">Video sessions use browser-native WebRTC. No plugin required. Ensure camera and microphone permissions are granted before joining.</p>
      </div>
    </div>
  )
}
