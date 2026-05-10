"use client"

export default function BMWReports() {
  return (
    <div className="space-y-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900">Compliance Reports</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">Monthly compliance reports and CPCB submissions</p>
        <p className="text-xs text-slate-400 mt-2">No reports submitted yet for May 2026</p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700">
          Generate Monthly Report
        </button>
      </div>
    </div>
  )
}
