"use client"

import { useState } from "react"
import { ClipboardList, CheckCircle2, Circle, Clock, AlertCircle, Plus } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

type Task = {
  id: string
  title: string
  patient: string
  dueTime: string
  priority: 'High' | 'Medium' | 'Low'
  category: 'Medication' | 'Vitals' | 'Dressing' | 'Assessment' | 'Documentation'
  done: boolean
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Administer IV antibiotics',     patient: 'Sunita Sharma (Ward A-02)', dueTime: '10:00 AM', priority: 'High',   category: 'Medication',     done: false },
  { id: '2', title: 'Record morning vitals',         patient: 'Ramesh Kumar (Ward A-01)',  dueTime: '09:30 AM', priority: 'High',   category: 'Vitals',         done: true  },
  { id: '3', title: 'Change wound dressing',         patient: 'Amit Singh (Ward B-05)',    dueTime: '11:00 AM', priority: 'Medium', category: 'Dressing',       done: false },
  { id: '4', title: 'Neurological assessment',       patient: 'Sunita Sharma (Ward A-02)', dueTime: '12:00 PM', priority: 'High',   category: 'Assessment',     done: false },
  { id: '5', title: 'Update patient care notes',     patient: 'All ward patients',          dueTime: '02:00 PM', priority: 'Low',    category: 'Documentation',  done: false },
  { id: '6', title: 'Discharge paperwork preparation',patient: 'Amit Singh (Ward B-05)',   dueTime: '03:00 PM', priority: 'Medium', category: 'Documentation',  done: false },
]

const CATEGORY_COLOR: Record<Task['category'], string> = {
  Medication:     'text-red-600 bg-red-50 border-red-100',
  Vitals:         'text-green-600 bg-green-50 border-green-100',
  Dressing:       'text-amber-600 bg-amber-50 border-amber-100',
  Assessment:     'text-blue-600 bg-blue-50 border-blue-100',
  Documentation:  'text-slate-600 bg-slate-50 border-slate-100',
}

export default function NurseTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)

  const toggle = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      const task = updated.find(t => t.id === id)
      if (task?.done) toast.success(`Task completed: ${task.title}`)
      return updated
    })
  }

  const pending  = tasks.filter(t => !t.done)
  const done     = tasks.filter(t => t.done)
  const high     = pending.filter(t => t.priority === 'High')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Daily Tasks</h1>
          <p className="text-sm text-[#64748B] mt-1">
            {pending.length} tasks remaining · {done.length} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {high.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50/80">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-bold text-red-700">{high.length} urgent</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-slate-700">Shift Progress</p>
          <p className="text-sm font-bold text-blue-600">{Math.round((done.length / tasks.length) * 100)}%</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(done.length / tasks.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pending</p>
          <div className="space-y-2">
            {pending.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl shadow-sm hover:shadow-md transition-all ${
                  task.priority === 'High' ? 'bg-red-50/60' : task.priority === 'Medium' ? 'bg-amber-50/60' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => toggle(task.id)}
                  aria-label={`Mark "${task.title}" as complete`}
                  className="flex-shrink-0 cursor-pointer text-slate-300 hover:text-green-500 transition-colors"
                >
                  <Circle className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0F172A] text-sm">{task.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{task.patient}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${CATEGORY_COLOR[task.category]}`}>
                    {task.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#64748B] font-medium">
                    <Clock className="h-3 w-3" />
                    {task.dueTime}
                  </div>
                  <NeonBadge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'} className="text-[10px]">
                    {task.priority}
                  </NeonBadge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Completed</p>
          <div className="space-y-2">
            {done.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl opacity-60">
                <button
                  onClick={() => toggle(task.id)}
                  aria-label={`Mark "${task.title}" as pending`}
                  className="flex-shrink-0 cursor-pointer text-green-500 hover:text-slate-300 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-500 text-sm line-through">{task.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{task.patient}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {task.dueTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
