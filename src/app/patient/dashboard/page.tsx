"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, Stethoscope, Sparkles, CheckCircle, Activity, Pill, CreditCard, ArrowRight, Bot, Heart } from "lucide-react"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Avatar } from "@/components/ui/avatar"
import { usePatientStore } from "@/store/usePatientStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useRouter } from "next/navigation"

const JOURNEY_STEPS = [
  { id: 'waiting',    label: 'Arrived',    icon: CheckCircle },
  { id: 'vitals',     label: 'Vitals',     icon: Activity },
  { id: 'consulting', label: 'Consulting', icon: Stethoscope },
  { id: 'pharmacy',   label: 'Pharmacy',   icon: Pill },
  { id: 'billing',    label: 'Billing',    icon: CreditCard },
]

const TRIAGE_STYLE: Record<string, { gradient: string; shadow: string; text: string }> = {
  Critical: { gradient: 'linear-gradient(135deg,#EF4444,#DC2626)', shadow: 'rgba(239,68,68,0.35)', text: 'white' },
  High:     { gradient: 'linear-gradient(135deg,#F97316,#EA580C)', shadow: 'rgba(249,115,22,0.35)', text: 'white' },
  Medium:   { gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', shadow: 'rgba(245,158,11,0.30)', text: 'white' },
  Low:      { gradient: 'linear-gradient(135deg,#10B981,#0D9488)', shadow: 'rgba(16,185,129,0.25)', text: 'white' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

export default function PatientDashboard() {
  const router = useRouter()
  const { patients } = usePatientStore()
  const { currentUser } = useAuthStore()
  const [waitMin, setWaitMin] = useState<number | null>(null)

  const patientId = currentUser?.id ?? 'PT-20394'
  const me = patients.find(p => p.id === patientId) ?? patients[0]
  const ahead = patients.filter(
    p => ['consulting', 'vitals'].includes(p.queueStatus) ||
         (p.queueStatus === 'waiting' && p.token < me?.token)
  )

  const journeyStepIdx = JOURNEY_STEPS.findIndex(s => s.id === me?.queueStatus)
  const progressPct = Math.max(8, ((journeyStepIdx + 1) / JOURNEY_STEPS.length) * 100)

  useEffect(() => { setWaitMin(me?.estimatedWait ?? 0) }, [me?.estimatedWait])
  if (!me) return null

  const triage = me.triageLevel ?? 'Low'
  const ts = TRIAGE_STYLE[triage] ?? TRIAGE_STYLE.Low

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Welcome Hero ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl p-7"
        style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 8px 32px rgba(15,23,42,0.06)' }}
      >
        {/* Background gradient shimmer */}
        <div
          className="absolute top-0 right-0 w-80 h-full pointer-events-none"
          style={{ background: 'linear-gradient(270deg, rgba(37,99,235,0.04) 0%, transparent 100%)' }}
        />

        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          {/* Patient info */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Avatar name={me.name} size="lg" className="h-16 w-16" />
              <div
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#16A34A,#0D9488)', boxShadow: '0 2px 6px rgba(22,163,74,0.4)' }}
              >
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94A3B8' }}>{getGreeting()}</p>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">{me.name}</h2>
              <p className="text-sm font-medium" style={{ color: '#64748B' }}>
                {me.id} · {me.age}y · {me.bloodGroup}
              </p>
            </div>
          </div>

          {/* Token card */}
          <div
            className="flex flex-col items-center px-6 py-4 rounded-2xl text-center flex-shrink-0 min-w-[130px]"
            style={{
              background: 'linear-gradient(145deg, #1E3A5F, #0F172A)',
              boxShadow: '0 8px 32px rgba(15,23,42,0.30), 0 2px 8px rgba(15,23,42,0.20)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Queue Token
            </p>
            <p className="text-5xl font-black text-white leading-none tracking-tight mb-2">
              #{me.token}
            </p>
            <div
              className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{ background: ts.gradient, color: ts.text, boxShadow: `0 2px 8px ${ts.shadow}` }}
            >
              {triage} Priority
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Clock, label: 'Est. Wait', gradient: 'linear-gradient(135deg,#F97316,#F59E0B)', glow: 'rgba(249,115,22,0.25)',
            content: (
              <ProgressRing
                value={Math.max(5, 100 - ((waitMin ?? 0) / 40) * 100)}
                size={52} strokeWidth={5} color="#F97316"
                label={<span className="text-sm font-bold text-[#0F172A]">{waitMin}m</span>}
              />
            ),
          },
          {
            icon: Activity, label: 'Ahead of You', gradient: 'linear-gradient(135deg,#2563EB,#0891B2)', glow: 'rgba(37,99,235,0.20)',
            content: (
              <ProgressRing
                value={Math.max(5, 100 - ahead.length * 20)}
                size={52} strokeWidth={5} color="#2563EB"
                label={<span className="text-sm font-bold text-[#0F172A]">{ahead.length}</span>}
              />
            ),
          },
          {
            icon: Stethoscope, label: 'Your Doctor', gradient: 'linear-gradient(135deg,#0D9488,#06B6D4)', glow: 'rgba(13,148,136,0.20)',
            content: (
              <p className="text-sm font-bold text-[#0F172A] text-center leading-tight px-2">{me.doctor}</p>
            ),
          },
        ].map(({ icon: Icon, label, gradient, glow, content }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
            className="p-5 flex flex-col items-center gap-3 rounded-2xl"
            style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: gradient, boxShadow: `0 4px 12px ${glow}` }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>{label}</p>
            <div className="flex justify-center items-center h-14">{content}</div>
          </motion.div>
        ))}
      </div>

      {/* ── OPD Journey Stepper ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="p-6 rounded-3xl"
        style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: '#94A3B8' }}>OPD Journey</p>

        {/* Progress track */}
        <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: '#F1F5F9' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#2563EB,#0891B2)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="flex items-start justify-between">
          {JOURNEY_STEPS.map((s, i) => {
            const done   = i < journeyStepIdx
            const active = i === journeyStepIdx
            const Icon   = s.icon
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 z-10" style={{ width: '20%' }}>
                <div
                  className="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={done ? {
                    background: 'linear-gradient(135deg,#10B981,#0D9488)',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.30)',
                  } : active ? {
                    background: 'linear-gradient(135deg,#2563EB,#0891B2)',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
                    transform: 'scale(1.1)',
                  } : {
                    background: '#F8FAFC',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: done || active ? 'white' : '#CBD5E1' }}
                  />
                </div>
                <p
                  className="text-[11px] font-bold text-center leading-tight"
                  style={{ color: done ? '#10B981' : active ? '#2563EB' : '#94A3B8' }}
                >
                  {s.label}
                </p>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Vitals ────────────────────────────────────── */}
      {me.vitals && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="p-6 rounded-3xl"
          style={{ background: 'white', boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" style={{ color: '#EF4444' }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#94A3B8' }}>Vitals Recorded</p>
            </div>
            <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{me.registeredAt}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(me.vitals).map(([key, val]) => {
              const isAbnormal =
                (key === 'bp'    && val.startsWith('14')) ||
                (key === 'spo2'  && parseInt(val) < 95) ||
                (key === 'temp'  && parseFloat(val) > 99.5) ||
                (key === 'pulse' && parseInt(val) > 100)
              return (
                <div
                  key={key}
                  className="p-3 rounded-xl text-center"
                  style={isAbnormal ? {
                    background: 'linear-gradient(135deg, #FEF2F2, #FFF5F5)',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.12)',
                    borderLeft: '3px solid #EF4444',
                  } : {
                    background: '#F8FAFC',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
                  }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: isAbnormal ? '#EF4444' : '#94A3B8' }}>{key}</p>
                  <p className="text-sm font-bold" style={{ color: isAbnormal ? '#DC2626' : '#0F172A' }}>{val}</p>
                  {isAbnormal && <p className="text-[9px] font-bold mt-0.5" style={{ color: '#EF4444' }}>↑ Abnormal</p>}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── AI Brief Glass Card ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.30 }}
        className="p-6 rounded-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #F0F9FF 100%)',
          boxShadow: '0 4px 20px rgba(13,148,136,0.12), 0 1px 6px rgba(15,23,42,0.06)',
          border: '1px solid rgba(13,148,136,0.10)',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#0D9488,#0891B2)', boxShadow: '0 4px 12px rgba(13,148,136,0.30)' }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <p className="font-bold text-[#0F172A] text-base">AI Brief Sent to Doctor</p>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(13,148,136,0.12)', color: '#0D9488' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {me.symptoms.map((s, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(13,148,136,0.10)', color: '#0D9488' }}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              Your doctor has received a complete AI-generated brief including your symptoms, history, and triage score. You may enter the consultation room immediately when called.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Action Buttons ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38 }}
        className="flex gap-3"
      >
        <button
          onClick={() => router.push('/patient/waiting')}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg,#2563EB,#0891B2)',
            boxShadow: '0 4px 16px rgba(37,99,235,0.30)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(37,99,235,0.40)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(37,99,235,0.30)'}
        >
          Live Waiting Room <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => router.push('/patient/records')}
          className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{ background: 'white', color: '#334155', boxShadow: '0 1px 4px rgba(15,23,42,0.08)' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(15,23,42,0.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.08)'}
        >
          My Records
        </button>
      </motion.div>

      {/* ── AI Health Assistant FAB ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-8 right-8 z-40"
      >
        <button
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-white text-sm cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg,#7C3AED,#6366F1)',
            boxShadow: '0 8px 32px rgba(124,58,237,0.40), 0 2px 8px rgba(124,58,237,0.20)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
        >
          <Bot className="h-4 w-4" />
          AI Health Assistant
        </button>
      </motion.div>
    </div>
  )
}
