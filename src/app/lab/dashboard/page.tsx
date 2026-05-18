"use client"

import { useLabStore } from "@/store/useLabStore"
import { FlaskConical, AlertTriangle, Activity, CheckCircle, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const TAT_DATA = [
  { hour: '08:00', routine: 55, urgent: 22, stat: 8 },
  { hour: '09:00', routine: 62, urgent: 18, stat: 12 },
  { hour: '10:00', routine: 78, urgent: 31, stat: 15 },
  { hour: '11:00', routine: 71, urgent: 25, stat: 9 },
  { hour: '12:00', routine: 84, urgent: 42, stat: 18 },
  { hour: '13:00', routine: 69, urgent: 28, stat: 11 },
  { hour: '14:00', routine: 57, urgent: 20, stat: 7 },
  { hour: '15:00', routine: 63, urgent: 24, stat: 10 },
]

export default function LabDashboard() {
  const { pendingTests, samples } = useLabStore()

  const aiAlerts = samples.filter(s => s.aiAnomalyAlert)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pathology & Laboratory</h1>
          <p className="text-sm text-slate-500">Real-time sample tracking & AI anomaly detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Tests',    value: pendingTests,                                      icon: FlaskConical,  cardBg: 'bg-blue-50/70',   ib: 'text-blue-600',   lb: 'text-blue-800/60' },
          { label: 'AI Anomalies',     value: aiAlerts.length,                                   icon: AlertTriangle, cardBg: 'bg-red-50/70',    ib: 'text-red-600',    lb: 'text-red-800/60' },
          { label: 'Processing',       value: samples.filter(s => s.status === 'Processing').length, icon: Activity, cardBg: 'bg-sky-50/70',    ib: 'text-sky-600',    lb: 'text-sky-800/60' },
          { label: 'Completed Today',  value: samples.filter(s => s.status === 'Completed').length,  icon: CheckCircle, cardBg: 'bg-green-50/70', ib: 'text-green-600', lb: 'text-green-800/60' },
        ].map(({ label, value, icon: Icon, cardBg, ib, lb }) => (
          <div key={label} className={`rounded-xl ${cardBg} p-4 flex items-center gap-4`}>
            <div className="p-3 rounded-xl bg-white shadow-sm flex-shrink-0">
              <Icon className={`h-5 w-5 ${ib}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${lb}`}>{label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* TAT Trend — Recharts Area Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mt-8">
        <h2 className="font-bold text-slate-900 mb-1">Turn-Around Time Trends (min)</h2>
        <p className="text-xs text-slate-500 mb-4">Average TAT by priority — today</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={TAT_DATA}>
            <defs>
              <linearGradient id="gradRoutine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUrgent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradStat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit=" min" />
            <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="routine" name="Routine" stroke="#3B82F6" fill="url(#gradRoutine)" strokeWidth={2} />
            <Area type="monotone" dataKey="urgent" name="Urgent" stroke="#F59E0B" fill="url(#gradUrgent)" strokeWidth={2} />
            <Area type="monotone" dataKey="stat" name="STAT" stroke="#EF4444" fill="url(#gradStat)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Live Sample Pipeline</h2>
          <Card className="overflow-hidden border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sample ID</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Test / Patient</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {samples.map(sample => (
                  <tr key={sample.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{sample.id}</p>
                      <NeonBadge variant={sample.priority === 'Urgent' ? 'danger' : 'blue'} className="mt-1">
                        {sample.priority}
                      </NeonBadge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{sample.testName}</p>
                      <p className="text-xs text-slate-500">{sample.patientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        sample.status === 'Completed' ? 'success' :
                        sample.status === 'Analyzing' ? 'warning' : 'primary'
                      }>
                        {sample.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-md transition-colors cursor-pointer">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">AI Alerts</h2>
          {aiAlerts.length > 0 ? (
            <div className="space-y-4">
              {aiAlerts.map(alert => (
                <Card key={alert.id} className="p-4 bg-red-50/80 shadow-sm">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="font-bold text-red-900 text-sm">{alert.aiAnomalyAlert}</p>
                      <p className="text-xs text-red-600 mt-1">{alert.patientName} - {alert.testName}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-slate-500 border-dashed">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">No critical anomalies detected</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
