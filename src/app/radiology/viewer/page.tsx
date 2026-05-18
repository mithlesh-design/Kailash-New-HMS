"use client"

import { ScanLine, Info } from "lucide-react"

const STUDIES = [
  { id: 'STU-001', patient: 'Kiran Patil', modality: 'X-ray', bodyPart: 'Chest PA', orderedBy: 'Dr. Priya Menon', accession: 'ACC-20260509-001', status: 'available', studyDate: '2026-05-09' },
  { id: 'STU-002', patient: 'Mohan Lal', modality: 'CT', bodyPart: 'Abdomen + Pelvis', orderedBy: 'Dr. Vikram Rathore', accession: 'ACC-20260509-002', status: 'pending', studyDate: '2026-05-09' },
]

export default function RadiologyViewer() {
  return (
    <div className="space-y-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">DICOM Viewer</h2>
        <p className="text-slate-500 text-sm mt-1">Radiology image viewer — DICOM integration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study list */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Studies</p>
          {STUDIES.map((s) => (
            <button key={s.id} className="w-full text-left bg-white rounded-xl border border-slate-200 p-3 hover:border-blue-400 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{s.patient}</p>
                  <p className="text-xs text-slate-500">{s.modality} · {s.bodyPart}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.accession}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Viewer placeholder */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-xl border border-slate-800 aspect-[4/3] flex flex-col items-center justify-center">
            <ScanLine className="h-16 w-16 text-slate-700 mb-4" />
            <p className="text-slate-500 font-medium">Select a study to open viewer</p>
            <p className="text-slate-600 text-xs mt-1">DICOM viewer integration pending</p>
          </div>
          <div className="mt-3 flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            DICOM viewer requires Cornerstone.js or OHIFViewer integration. The RIS worklist and study metadata are available via the studies panel.
          </div>
        </div>
      </div>
    </div>
  )
}
