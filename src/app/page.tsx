"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Stethoscope, Users, Shield,
  Bot, QrCode, FlaskConical, Pill,
  ArrowRight, LayoutDashboard, Ambulance, Microscope,
  ScanLine, FileText, Package, ClipboardList,
  Droplets, Utensils, Trash2, Truck, ShieldCheck,
  BedDouble, CreditCard, Scissors, Heart, Sparkles,
  TrendingUp, CheckCircle, Zap, Lock,
} from "lucide-react"
import { useAuthStore, type Role } from "@/store/useAuthStore"
import { cn } from "@/lib/utils"

type RoleCard = {
  role: Role
  label: string
  desc: string
  icon: React.ElementType
  gradient: string
  iconColor: string
  href: string
}

const allRoleGroups: { id: string; label: string; roles: RoleCard[] }[] = [
  {
    id: 'clinical',
    label: 'Clinical',
    roles: [
      { role: 'doctor',    label: 'Doctor',          desc: 'AI pre-briefs, e-prescriptions, queue',         icon: Stethoscope, gradient: 'linear-gradient(135deg,#0EA5E9,#6366F1)', iconColor: '#0EA5E9', href: '/doctor/dashboard' },
      { role: 'nurse',     label: 'Nurse',           desc: 'Ward monitoring, vitals, MAR, handover',        icon: Activity,    gradient: 'linear-gradient(135deg,#10B981,#06B6D4)', iconColor: '#10B981', href: '/nurse/dashboard' },
      { role: 'pharmacy',  label: 'Pharmacy',        desc: 'Prescriptions, dispensing, narcotics log',      icon: Pill,        gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)', iconColor: '#EC4899', href: '/pharmacy/dashboard' },
      { role: 'lab',       label: 'Laboratory',      desc: 'Sample tracking, AI anomaly, reflex tests',     icon: Microscope,  gradient: 'linear-gradient(135deg,#8B5CF6,#EC4899)', iconColor: '#8B5CF6', href: '/lab/dashboard' },
      { role: 'radiology', label: 'Radiology',       desc: 'Scan scheduling, DICOM viewer, AI findings',    icon: ScanLine,    gradient: 'linear-gradient(135deg,#6366F1,#8B5CF6)', iconColor: '#6366F1', href: '/radiology/dashboard' },
      { role: 'emergency', label: 'Emergency',       desc: 'ER triage, trauma tracking, sepsis alerts',     icon: Ambulance,   gradient: 'linear-gradient(135deg,#EF4444,#F97316)', iconColor: '#EF4444', href: '/emergency/dashboard' },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    roles: [
      { role: 'reception',   label: 'Reception',         desc: 'OPD queue, registration, kiosk',           icon: LayoutDashboard, gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)', iconColor: '#F59E0B', href: '/reception/dashboard' },
      { role: 'bed_manager', label: 'Admission / Beds',  desc: 'Bed allocation, forecast, census',         icon: BedDouble,       gradient: 'linear-gradient(135deg,#0891B2,#0EA5E9)', iconColor: '#0891B2', href: '/admission/dashboard' },
      { role: 'discharge',   label: 'Discharge',         desc: '5-pillar clearance, discharge summary',     icon: ClipboardList,   gradient: 'linear-gradient(135deg,#059669,#10B981)', iconColor: '#059669', href: '/discharge/dashboard' },
      { role: 'ot',          label: 'Operation Theater', desc: 'OT scheduling, WHO checklist, briefing',    icon: Scissors,        gradient: 'linear-gradient(135deg,#DC2626,#9F1239)', iconColor: '#DC2626', href: '/ot/dashboard' },
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    roles: [
      { role: 'billing',   label: 'Billing',         desc: 'Invoices, packages, refunds, discounts',    icon: CreditCard, gradient: 'linear-gradient(135deg,#B45309,#D97706)', iconColor: '#B45309', href: '/billing/dashboard' },
      { role: 'insurance', label: 'Insurance / TPA', desc: 'Claims, pre-auth, AI approval scoring',     icon: FileText,   gradient: 'linear-gradient(135deg,#14B8A6,#0EA5E9)', iconColor: '#14B8A6', href: '/insurance/dashboard' },
    ]
  },
  {
    id: 'management',
    label: 'Management',
    roles: [
      { role: 'admin',        label: 'Admin',        desc: 'Analytics, staff, operations overview',    icon: Shield,      gradient: 'linear-gradient(135deg,#8B5CF6,#6366F1)', iconColor: '#8B5CF6', href: '/admin/dashboard' },
      { role: 'quality',      label: 'Quality',      desc: 'NABH compliance, audits, incidents',       icon: Heart,       gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)', iconColor: '#EC4899', href: '/quality/dashboard' },
      { role: 'housekeeping', label: 'Housekeeping', desc: 'Ward cleanliness, bed turnover tasks',     icon: Package,     gradient: 'linear-gradient(135deg,#7C3AED,#6366F1)', iconColor: '#7C3AED', href: '/housekeeping/dashboard' },
      { role: 'inventory',    label: 'Inventory',    desc: 'Assets, stock levels, procurement',        icon: FlaskConical,gradient: 'linear-gradient(135deg,#D97706,#EA580C)', iconColor: '#D97706', href: '/inventory/dashboard' },
    ]
  },
  {
    id: 'support',
    label: 'Support Services',
    roles: [
      { role: 'blood_bank',    label: 'Blood Bank',          desc: 'Inventory, cross-match, AI demand forecast',        icon: Droplets,    gradient: 'linear-gradient(135deg,#DC2626,#B91C1C)', iconColor: '#DC2626', href: '/bloodbank/dashboard' },
      { role: 'cssd',          label: 'CSSD',                desc: 'Sterilization cycles, instrument tracking',         icon: Package,     gradient: 'linear-gradient(135deg,#0D9488,#0891B2)', iconColor: '#0D9488', href: '/cssd/dashboard' },
      { role: 'dietary',       label: 'Dietary',             desc: 'Diet plans, meal orders, AI nutrition',             icon: Utensils,    gradient: 'linear-gradient(135deg,#16A34A,#0D9488)', iconColor: '#16A34A', href: '/dietary/dashboard' },
      { role: 'bmw',           label: 'Bio-Medical Waste',   desc: 'Waste categories, disposal logs, compliance',       icon: Trash2,      gradient: 'linear-gradient(135deg,#D97706,#B45309)', iconColor: '#D97706', href: '/bmw/dashboard' },
      { role: 'mortuary',      label: 'Mortuary',            desc: 'Deceased records, MLC clearance, certificates',     icon: FileText,    gradient: 'linear-gradient(135deg,#475569,#334155)', iconColor: '#475569', href: '/mortuary/dashboard' },
      { role: 'ambulance',     label: 'Ambulance',           desc: 'Fleet management, dispatch, trip log',              icon: Truck,       gradient: 'linear-gradient(135deg,#EA580C,#DC2626)', iconColor: '#EA580C', href: '/ambulance/dashboard' },
      { role: 'audit_officer', label: 'Audit / Compliance',  desc: 'Audit trail, compliance reports, NABH prep',        icon: ShieldCheck, gradient: 'linear-gradient(135deg,#4F46E5,#7C3AED)', iconColor: '#4F46E5', href: '/audit/dashboard' },
    ]
  },
  {
    id: 'patient',
    label: 'Patient',
    roles: [
      { role: 'patient', label: 'Patient Portal', desc: 'Track queue, view records, billing, appointments', icon: Users, gradient: 'linear-gradient(135deg,#2563EB,#0891B2)', iconColor: '#2563EB', href: '/patient/dashboard' },
    ]
  },
]

const floatingCards = [
  {
    icon: Activity,
    title: 'Live Queue',
    value: '24 patients',
    sub: 'Avg wait: 12 min',
    color: '#10B981',
    delay: 0,
  },
  {
    icon: Sparkles,
    title: 'AI Suggestions',
    value: '98.2% accuracy',
    sub: 'Clinical decision support',
    color: '#8B5CF6',
    delay: 0.6,
  },
  {
    icon: TrendingUp,
    title: 'Bed Occupancy',
    value: '87%',
    sub: '214 / 247 beds',
    color: '#0EA5E9',
    delay: 1.2,
  },
  {
    icon: CheckCircle,
    title: 'Discharges Today',
    value: '18 patients',
    sub: 'Avg LOS: 3.4 days',
    color: '#F59E0B',
    delay: 1.8,
  },
]

const trustBadges = [
  { icon: Zap,       label: 'AI-Powered' },
  { icon: Lock,      label: 'DISHA Secure' },
  { icon: Activity,  label: 'Real-time' },
  { icon: ShieldCheck, label: 'NABH Ready' },
]

export default function LoginPage() {
  const { setRole } = useAuthStore()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [loadingRole, setLoadingRole] = React.useState<Role | null>(null)
  const [activeTab, setActiveTab] = React.useState('clinical')

  const handleLogin = (role: Role, href: string) => {
    setSelectedRole(role)
    setLoadingRole(role)
    setRole(role)
    router.push(href)
  }

  const activeGroup = allRoleGroups.find(g => g.id === activeTab) ?? allRoleGroups[0]

  return (
    <div className="min-h-screen flex w-full overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left Panel: Premium Brand Visual ───────────────── */}
      <div
        className="hidden lg:flex w-[44%] flex-col justify-between p-10 relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(145deg, #0A1628 0%, #0F2040 40%, #091520 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)' }} />

        {/* Logo + Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.20)' }}>
            <img src="/kailash-Logo.png" alt="Kailash" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-base tracking-tight leading-none">Kailash HMS</p>
            <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Hospital Management System</p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl font-bold leading-tight tracking-tight mb-5" style={{ color: 'rgba(255,255,255,0.96)' }}>
              Intelligent Care.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #60A5FA, #34D399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Seamless Operations.
              </span>
            </h1>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Enterprise-grade platform for modern hospitals — built with AI at its core.
            </p>
          </motion.div>

          {/* Floating Live Metric Cards */}
          <div className="space-y-3">
            {floatingCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${card.color}20`, border: `1px solid ${card.color}30` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: card.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.40)' }}>{card.title}</p>
                    <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>{card.value}</p>
                  </div>
                  <p className="text-[11px] text-right flex-shrink-0" style={{ color: 'rgba(255,255,255,0.30)' }}>{card.sub}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <p>© 2026 Kailash Healthcare Group</p>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Role Selector ──────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-center gap-3 py-6 px-6" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-white"
            style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.12)' }}>
            <img src="/kailash-Logo.png" alt="" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-lg font-bold text-slate-900">Kailash HMS</span>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden px-8 py-8 max-w-2xl w-full mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 mb-6"
          >
            {/* Demo Banner */}
            <div
              className="mb-5 flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-800">Demo environment — select any role to explore</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Select your portal</h2>
            <p className="text-slate-400 text-sm">24 role portals across clinical, operations, and support teams</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="flex-shrink-0 flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
            style={{ background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.05)' }}
          >
            {allRoleGroups.map(group => (
              <button
                key={group.id}
                onClick={() => setActiveTab(group.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                style={activeTab === group.id ? {
                  background: 'white',
                  color: '#0F172A',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
                } : {
                  color: '#94A3B8',
                  background: 'transparent',
                }}
              >
                {group.label}
              </button>
            ))}
          </motion.div>

          {/* Role Cards Grid */}
          <div className="flex-1 overflow-y-auto pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {activeGroup.roles.map(({ role, label, desc, icon: Icon, gradient, iconColor, href }) => {
                  const isSelected = selectedRole === role
                  const isLoading = loadingRole === role
                  return (
                    <motion.button
                      key={role}
                      onClick={() => handleLogin(role, href)}
                      disabled={!!loadingRole}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="group flex items-start gap-3.5 p-4 rounded-2xl text-left cursor-pointer w-full relative overflow-hidden"
                      style={{
                        background: isSelected ? `${iconColor}08` : 'white',
                        boxShadow: isSelected
                          ? `0 0 0 2px ${iconColor}, 0 4px 16px ${iconColor}20`
                          : '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
                      }}
                    >
                      {/* Hover gradient overlay */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: `linear-gradient(135deg, ${iconColor}05, transparent)` }}
                      />

                      {/* Icon */}
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                        style={{ background: gradient, boxShadow: `0 4px 12px ${iconColor}30` }}
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <Icon className="h-5 w-5 text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="font-bold text-slate-900 text-sm leading-tight">{label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                      </div>

                      {/* Arrow */}
                      <div
                        className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 mt-0.5 transition-all duration-200 group-hover:scale-110"
                        style={{
                          background: isSelected ? gradient : 'rgba(15,23,42,0.04)',
                          boxShadow: isSelected ? `0 2px 8px ${iconColor}30` : 'none',
                        }}
                      >
                        <ArrowRight
                          className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: isSelected ? 'white' : '#94A3B8' }}
                        />
                      </div>
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.35 }}
            className="flex-shrink-0 mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(15,23,42,0.05)' }}
          >
            <button
              onClick={() => router.push('/checkin')}
              className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200"
              style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid rgba(15,23,42,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
            >
              <QrCode className="h-4 w-4" />
              Patient Self Check-In (Public Kiosk)
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
