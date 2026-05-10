"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, Maximize2, Minimize2, Clock, Users, Sparkles, Activity, CheckCircle, ArrowRight } from "lucide-react"
import { usePatientStore } from "@/store/usePatientStore"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  waiting:    { label: 'Waiting',    color: '#F59E0B', bg: '#FFFBEB', dot: '#F59E0B' },
  vitals:     { label: 'Vitals',     color: '#0EA5E9', bg: '#F0F9FF', dot: '#0EA5E9' },
  consulting: { label: 'Consulting', color: '#8B5CF6', bg: '#FAF5FF', dot: '#8B5CF6' },
  pharmacy:   { label: 'Pharmacy',   color: '#14B8A6', bg: '#F0FDFA', dot: '#14B8A6' },
  billing:    { label: 'Billing',    color: '#EA580C', bg: '#FFF7ED', dot: '#EA580C' },
  done:       { label: 'Done',       color: '#16A34A', bg: '#F0FDF4', dot: '#16A34A' },
}

const TRIAGE_GRADIENTS: Record<string, { gradient: string; text: string; shadow: string }> = {
  Critical: { gradient: 'linear-gradient(135deg,#DC2626,#B91C1C)', text: 'white', shadow: 'rgba(220,38,38,0.35)' },
  High:     { gradient: 'linear-gradient(135deg,#EA580C,#DC2626)', text: 'white', shadow: 'rgba(234,88,12,0.35)' },
  Medium:   { gradient: 'linear-gradient(135deg,#D97706,#B45309)', text: 'white', shadow: 'rgba(217,119,6,0.30)' },
  Low:      { gradient: 'linear-gradient(135deg,#16A34A,#0D9488)', text: 'white', shadow: 'rgba(22,163,74,0.30)' },
}

function TokenRow({ token, name, status, department, triage, idx }: {
  token: number; name: string; status: string
  department: string; triage: string; idx: number
}) {
  const sc = STATUS_CONFIG[status] ?? { label: status, color: '#64748B', bg: '#F8FAFC', dot: '#94A3B8' }
  const tg = TRIAGE_GRADIENTS[triage] ?? TRIAGE_GRADIENTS.Low
  const isNow = status === 'consulting'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all"
      style={{
        background: isNow ? 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(8,145,178,0.04))' : 'white',
        boxShadow: isNow
          ? '0 0 0 1.5px rgba(37,99,235,0.3), 0 4px 16px rgba(37,99,235,0.12)'
          : '0 1px 4px rgba(15,23,42,0.05), 0 2px 8px rgba(15,23,42,0.03)',
      }}
    >
      {/* Triage-colored token circle */}
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg"
        style={{
          background: tg.gradient,
          color: tg.text,
          boxShadow: `0 4px 12px ${tg.shadow}`,
          transform: isNow ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {token}
      </div>

      {/* Name + dept */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#0F172A] truncate leading-tight" style={{ fontSize: '0.9375rem' }}>
          {name}
        </p>
        <p className="text-xs font-medium text-[#94A3B8] truncate mt-0.5">{department}</p>
      </div>

      {/* Triage pill */}
      <div
        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
        style={{ background: tg.gradient, color: tg.text, boxShadow: `0 2px 6px ${tg.shadow}` }}
      >
        {triage}
      </div>

      {/* Status pill */}
      <div
        className="h-8 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold flex-shrink-0"
        style={{ background: sc.bg, color: sc.color, minWidth: '110px', justifyContent: 'center' }}
      >
        {isNow && (
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse flex-shrink-0"
            style={{ background: sc.dot }}
          />
        )}
        {sc.label}
      </div>
    </motion.div>
  )
}

export default function QueueBoardPage() {
  const { patients } = usePatientStore()
  const [kioskMode, setKioskMode] = useState(false)
  const [time, setTime] = useState(new Date())

  const queue = patients
    .filter(p => ['waiting', 'vitals', 'consulting', 'pharmacy'].includes(p.queueStatus))
    .sort((a, b) => a.token - b.token)

  const nowServing  = patients.find(p => p.queueStatus === 'consulting')
  const waitingCount = patients.filter(p => p.queueStatus === 'waiting').length
  const vitalsCount  = patients.filter(p => p.queueStatus === 'vitals').length

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={cn(
      "min-h-full transition-all",
      kioskMode ? "p-8" : "max-w-full space-y-5"
    )}>
      <div className={cn("space-y-5", kioskMode ? 'max-w-5xl mx-auto' : '')}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: '#16A34A', boxShadow: '0 0 8px rgba(22,163,74,0.6)' }}
              />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#16A34A' }}>Live Queue Board</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">OPD Display</h1>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Clock */}
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
            >
              <Clock className="h-4 w-4 text-[#94A3B8]" />
              <span className="text-base font-bold font-mono tracking-widest text-[#0F172A]">
                {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <button
              onClick={() => setKioskMode(k => !k)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={kioskMode ? {
                background: 'linear-gradient(135deg,#2563EB,#0891B2)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(37,99,235,0.30)',
              } : {
                background: 'white',
                color: '#64748B',
                boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
              }}
            >
              {kioskMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {kioskMode ? 'Exit Kiosk' : 'Kiosk Mode'}
            </button>
          </div>
        </motion.div>

        {/* Summary Stats — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Volume2,
              label: 'Now Serving',
              value: nowServing ? `Token #${nowServing.token}` : '—',
              gradient: 'linear-gradient(135deg,#8B5CF6,#6366F1)',
              glow: 'rgba(139,92,246,0.25)',
              pulse: !!nowServing,
            },
            {
              icon: Users,
              label: 'In Queue',
              value: `${waitingCount} patients`,
              gradient: 'linear-gradient(135deg,#F59E0B,#EA580C)',
              glow: 'rgba(245,158,11,0.25)',
              pulse: false,
            },
            {
              icon: Activity,
              label: 'Vitals Room',
              value: `${vitalsCount} in progress`,
              gradient: 'linear-gradient(135deg,#2563EB,#0891B2)',
              glow: 'rgba(37,99,235,0.20)',
              pulse: false,
            },
          ].map(({ icon: Icon, label, value, gradient, glow, pulse }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: gradient, boxShadow: `0 4px 12px ${glow}` }}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">{label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-bold text-[#0F172A] tracking-tight truncate">{value}</p>
                  {pulse && (
                    <span className="h-2.5 w-2.5 rounded-full animate-pulse flex-shrink-0" style={{ background: '#8B5CF6' }} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Board: 2 column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* NOW SERVING — Premium gradient card */}
          <div className="lg:col-span-5 min-w-0">
            <AnimatePresence mode="wait">
              {nowServing ? (
                <motion.div
                  key={nowServing.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-3xl p-8 h-full flex flex-col justify-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 40%, #1E3A5F 100%)',
                    boxShadow: '0 20px 60px rgba(79,70,229,0.35), 0 8px 24px rgba(15,23,42,0.20)',
                    minHeight: '340px',
                  }}
                >
                  {/* Subtle glow circles */}
                  <div className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
                  <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)' }} />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Live badge */}
                    <div
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.80)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                      Now Consulting — Please Proceed
                    </div>

                    {/* Token number — large white on dark */}
                    <div
                      className="flex flex-col items-center justify-center mb-6"
                      style={{
                        background: 'rgba(255,255,255,0.10)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '24px',
                        width: '128px',
                        height: '128px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                      }}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.40)' }}>TOKEN</span>
                      <span className="text-6xl font-black text-white leading-none tracking-tight">
                        {nowServing.token}
                      </span>
                    </div>

                    {/* Patient name */}
                    <p className="text-2xl font-bold text-white mb-3 tracking-tight">
                      {nowServing.name}
                    </p>

                    {/* Dept pill */}
                    <div
                      className="px-5 py-2 rounded-2xl inline-flex flex-col items-center"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
                    >
                      <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{nowServing.department}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{nowServing.doctor}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div
                  className="rounded-3xl p-12 flex flex-col items-center justify-center text-center h-full"
                  style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06)', minHeight: '340px' }}
                >
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: '#F8FAFC' }}
                  >
                    <Volume2 className="h-8 w-8 text-[#CBD5E1]" />
                  </div>
                  <p className="text-lg font-bold text-[#0F172A] mb-2">Waiting for next patient</p>
                  <p className="text-sm text-[#94A3B8]">The doctor will call the next token shortly.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Queue Table */}
          <div className="lg:col-span-7 min-w-0 rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
              <h2 className="text-base font-bold text-[#0F172A]">Up Next</h2>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#2563EB,#0891B2)', color: 'white', boxShadow: '0 2px 8px rgba(37,99,235,0.30)' }}
              >
                {queue.length} in queue
              </div>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-4 px-5 py-3" style={{ borderBottom: '1px solid rgba(15,23,42,0.04)' }}>
              <div className="w-12 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Token</div>
              <div className="flex-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Patient</div>
              <div className="w-20 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">Priority</div>
              <div className="w-28 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest text-center">Status</div>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: '420px' }}>
              <AnimatePresence>
                {queue.map((p, i) => (
                  <TokenRow
                    key={p.id}
                    token={p.token}
                    name={p.name}
                    status={p.queueStatus}
                    department={p.department}
                    triage={p.triageLevel ?? 'Low'}
                    idx={i}
                  />
                ))}
              </AnimatePresence>

              {queue.length === 0 && (
                <div className="py-16 text-center rounded-2xl" style={{ background: '#F8FAFC' }}>
                  <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                  <p className="text-base font-bold text-[#0F172A] mb-1">Queue is empty</p>
                  <p className="text-sm text-[#94A3B8]">All scheduled patients have been seen.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Flow Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4 flex items-center gap-2 overflow-x-auto"
          style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}
        >
          <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex-shrink-0 mr-2">Patient Journey</p>
          {Object.entries(STATUS_CONFIG).map(([key, sc], i, arr) => (
            <div key={key} className="flex items-center gap-2 flex-shrink-0">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: sc.bg, color: sc.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: sc.dot }} />
                {sc.label}
              </div>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-[#CBD5E1] flex-shrink-0" />}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
