import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 opacity-40" />
      </div>
      <p className="font-semibold text-slate-600">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
