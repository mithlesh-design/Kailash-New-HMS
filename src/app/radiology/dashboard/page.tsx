"use client"

import { useRadiologyStore } from "@/store/useRadiologyStore"
import { Calendar, MonitorPlay, Brain, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Badge } from "@/components/ui/badge"

export default function RadiologyDashboard() {
  const { scansToday, scans } = useRadiologyStore()

  const aiFindings = scans.filter(s => s.aiFinding)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Radiology & Imaging (RIS)</h1>
          <p className="text-sm text-slate-500">Scan scheduling and AI-assisted diagnostics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Scans Scheduled Today', value: scansToday,                                        icon: Calendar,    cardBg: 'bg-blue-50/70',   ib: 'text-blue-600',   lb: 'text-blue-800/60' },
          { label: 'Pending Reviews',        value: scans.filter(s => s.status === 'Ready for Review').length, icon: MonitorPlay, cardBg: 'bg-green-50/70', ib: 'text-green-600', lb: 'text-green-800/60' },
          { label: 'AI Insights Found',      value: aiFindings.length,                                 icon: Brain,       cardBg: 'bg-amber-50/70',  ib: 'text-amber-600',  lb: 'text-amber-800/60' },
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

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Today's Modality Schedule</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scans.map(scan => (
            <Card key={scan.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <NeonBadge
                    variant={scan.scanType === 'MRI' ? 'blue' : scan.scanType === 'CT Scan' ? 'warning' : 'success'}
                  >
                    {scan.scanType}
                  </NeonBadge>
                  <Badge variant={
                    scan.status === 'Ready for Review' ? 'success' :
                    scan.status === 'In Progress' ? 'primary' : 'muted'
                  }>
                    {scan.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1">{scan.patientName}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                  <Clock className="h-4 w-4" /> {scan.time} | ID: {scan.id}
                </p>

                {scan.aiFinding && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 mt-4">
                    <Brain className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-900 uppercase tracking-wider">AI Preliminary Finding</p>
                      <p className="text-sm font-medium text-slate-900 mt-0.5">{scan.aiFinding}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer">
                  {scan.status === 'Ready for Review' ? 'Open DICOM Viewer' : 'Manage Scan'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
