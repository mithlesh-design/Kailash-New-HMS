"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Stethoscope, FileText, Pill, Ban, FlaskConical, GitBranch, Activity, Scissors, Utensils, LogOut } from "lucide-react"

export type IpdAction =
  | 'round' | 'chart' | 'add_med' | 'stop_med' | 'order_test' | 'refer' | 'icu' | 'ot' | 'diet' | 'discharge'

const ITEMS: { id: IpdAction; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: 'round', label: 'Start round', icon: Stethoscope },
  { id: 'chart', label: 'Open full chart', icon: FileText },
  { id: 'add_med', label: 'Add medication', icon: Pill },
  { id: 'stop_med', label: 'Stop medication', icon: Ban },
  { id: 'order_test', label: 'Order test', icon: FlaskConical },
  { id: 'refer', label: 'Refer to specialist', icon: GitBranch },
  { id: 'icu', label: 'Shift to ICU', icon: Activity },
  { id: 'ot', label: 'Book OT / Plan surgery', icon: Scissors },
  { id: 'diet', label: 'Change diet', icon: Utensils },
  { id: 'discharge', label: 'Initiate discharge', icon: LogOut, danger: true },
]

export function ActionsMenu({ onAction }: { onAction: (a: IpdAction) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative inline-block">
      <button aria-label="Actions" onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }} className="p-1.5 rounded-lg hover:bg-slate-100">
        <MoreVertical className="h-4.5 w-4.5 text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-52 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5" onClick={e => e.stopPropagation()}>
          {ITEMS.map(it => (
            <button key={it.id} onClick={() => { setOpen(false); onAction(it.id) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium hover:bg-slate-50 ${it.danger ? 'text-rose-600' : 'text-slate-700'}`}>
              <it.icon className={`h-4 w-4 ${it.danger ? 'text-rose-400' : 'text-slate-400'}`} /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
