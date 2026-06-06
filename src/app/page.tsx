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
      { role: 'doctor',    label: 'Doctor',          desc: 'AI pre-briefs, e-prescriptions, queue',         icon: Stethoscope, gradient: 'linear-gradient(135deg,#2563EB,#6366F1)', iconColor: '#2563EB', href: '/doctor/dashboard' },
      { role: 'nurse',     label: 'Nurse',           desc: 'Ward monitoring, vitals, MAR, handover',        icon: Activity,    gradient: 'linear-gradient(135deg,#10B981,#2563EB)', iconColor: '#10B981', href: '/nurse/dashboard' },
      { role: 'pharmacy',  label: 'Pharmacy',        desc: 'Prescriptions, dispensing, narcotics log',      icon: Pill,        gradient: 'linear-gradient(135deg,#EC4899,#2563EB)', iconColor: '#EC4899', href: '/pharmacy/dashboard' },
      { role: 'lab',       label: 'Laboratory',      desc: 'Sample tracking, AI anomaly, reflex tests',     icon: Microscope,  gradient: 'linear-gradient(135deg,#2563EB,#EC4899)', iconColor: '#2563EB', href: '/lab/dashboard' },
      { role: 'radiology', label: 'Radiology',       desc: 'Scan scheduling, DICOM viewer, AI findings',    icon: ScanLine,    gradient: 'linear-gradient(135deg,#6366F1,#2563EB)', iconColor: '#6366F1', href: '/radiology/dashboard' },
      { role: 'emergency', label: 'Emergency',       desc: 'ER triage, trauma tracking, sepsis alerts',     icon: Ambulance,   gradient: 'linear-gradient(135deg,#EF4444,#F97316)', iconColor: '#EF4444', href: '/emergency/dashboard' },
    ]
  },
  {
    id: 'operations',
    label: 'Operations',
    roles: [
      { role: 'reception',   label: 'Reception',         desc: 'OPD queue, registration, kiosk',           icon: LayoutDashboard, gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)', iconColor: '#F59E0B', href: '/reception/dashboard' },
      { role: 'bed_manager', label: 'Admission / Beds',  desc: 'Bed allocation, forecast, census',         icon: BedDouble,       gradient: 'linear-gradient(135deg,#2563EB,#2563EB)', iconColor: '#2563EB', href: '/admission/dashboard' },
      { role: 'discharge',   label: 'Discharge',         desc: '5-pillar clearance, discharge summary',     icon: ClipboardList,   gradient: 'linear-gradient(135deg,#059669,#10B981)', iconColor: '#059669', href: '/discharge/dashboard' },
      { role: 'ot',          label: 'Operation Theater', desc: 'OT scheduling, WHO checklist, briefing',    icon: Scissors,        gradient: 'linear-gradient(135deg,#DC2626,#9F1239)', iconColor: '#DC2626', href: '/ot/dashboard' },
    ]
  },
  {
    id: 'finance',
    label: 'Finance',
    roles: [
      { role: 'billing',   label: 'Billing',         desc: 'Invoices, packages, refunds, discounts',    icon: CreditCard, gradient: 'linear-gradient(135deg,#B45309,#D97706)', iconColor: '#B45309', href: '/billing/dashboard' },
      { role: 'insurance', label: 'Insurance / TPA', desc: 'Claims, pre-auth, AI approval scoring',     icon: FileText,   gradient: 'linear-gradient(135deg,#2563EB,#2563EB)', iconColor: '#2563EB', href: '/insurance/dashboard' },
    ]
  },
  {
    id: 'management',
    label: 'Management',
    roles: [
      { role: 'admin',        label: 'Admin',        desc: 'Analytics, staff, operations overview',    icon: Shield,      gradient: 'linear-gradient(135deg,#2563EB,#6366F1)', iconColor: '#2563EB', href: '/admin/dashboard' },
      { role: 'quality',      label: 'Quality',      desc: 'NABH compliance, audits, incidents',       icon: Heart,       gradient: 'linear-gradient(135deg,#EC4899,#2563EB)', iconColor: '#EC4899', href: '/quality/dashboard' },
      { role: 'housekeeping', label: 'Housekeeping', desc: 'Ward cleanliness, bed turnover tasks',     icon: Package,     gradient: 'linear-gradient(135deg,#1E3A8A,#6366F1)', iconColor: '#1E3A8A', href: '/housekeeping/dashboard' },
      { role: 'inventory',    label: 'Inventory',    desc: 'Assets, stock levels, procurement',        icon: FlaskConical,gradient: 'linear-gradient(135deg,#D97706,#EA580C)', iconColor: '#D97706', href: '/inventory/dashboard' },
    ]
  },
  {
    id: 'support',
    label: 'Support Services',
    roles: [
      { role: 'blood_bank',    label: 'Blood Bank',          desc: 'Inventory, cross-match, AI demand forecast',        icon: Droplets,    gradient: 'linear-gradient(135deg,#DC2626,#B91C1C)', iconColor: '#DC2626', href: '/bloodbank/dashboard' },
      { role: 'cssd',          label: 'CSSD',                desc: 'Sterilization cycles, instrument tracking',         icon: Package,     gradient: 'linear-gradient(135deg,#1E3A8A,#2563EB)', iconColor: '#1E3A8A', href: '/cssd/dashboard' },
      { role: 'dietary',       label: 'Dietary',             desc: 'Diet plans, meal orders, AI nutrition',             icon: Utensils,    gradient: 'linear-gradient(135deg,#16A34A,#1E3A8A)', iconColor: '#16A34A', href: '/dietary/dashboard' },
      { role: 'bmw',           label: 'Bio-Medical Waste',   desc: 'Waste categories, disposal logs, compliance',       icon: Trash2,      gradient: 'linear-gradient(135deg,#D97706,#B45309)', iconColor: '#D97706', href: '/bmw/dashboard' },
      { role: 'mortuary',      label: 'Mortuary',            desc: 'Deceased records, MLC clearance, certificates',     icon: FileText,    gradient: 'linear-gradient(135deg,#475569,#334155)', iconColor: '#475569', href: '/mortuary/dashboard' },
      { role: 'ambulance',     label: 'Ambulance',           desc: 'Fleet management, dispatch, trip log',              icon: Truck,       gradient: 'linear-gradient(135deg,#EA580C,#DC2626)', iconColor: '#EA580C', href: '/ambulance/dashboard' },
      { role: 'audit_officer', label: 'Audit / Compliance',  desc: 'Audit trail, compliance reports, NABH prep',        icon: ShieldCheck, gradient: 'linear-gradient(135deg,#4F46E5,#1E3A8A)', iconColor: '#4F46E5', href: '/audit/dashboard' },
    ]
  },
  {
    id: 'patient',
    label: 'Patient',
    roles: [
      { role: 'patient', label: 'Patient Portal', desc: 'Track queue, view records, billing, appointments', icon: Users, gradient: 'linear-gradient(135deg,#2563EB,#2563EB)', iconColor: '#2563EB', href: '/patient/dashboard' },
    ]
  },
]

// Uniform brand identity (no per-item color) — premium, single deep-blue system.
const BRAND_COLOR = '#1E3A8A'
const BRAND_SOFT = 'rgba(30,58,138,0.08)'

const floatingCards = [
  { icon: Activity,    title: 'Live Queue',      value: '24 patients',    sub: 'Avg wait: 12 min',            color: BRAND_COLOR, delay: 0 },
  { icon: Sparkles,    title: 'AI Suggestions',  value: '98.2% accuracy', sub: 'Clinical decision support',   color: BRAND_COLOR, delay: 0.6 },
  { icon: TrendingUp,  title: 'Bed Occupancy',   value: '87%',            sub: '214 / 247 beds',              color: BRAND_COLOR, delay: 1.2 },
  { icon: CheckCircle, title: 'Discharges Today',value: '18 patients',    sub: 'Avg LOS: 3.4 days',           color: BRAND_COLOR, delay: 1.8 },
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
  const totalRoles = allRoleGroups.reduce((n, g) => n + g.roles.length, 0)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-background)' }}>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 h-16 flex items-center justify-between px-5 lg:px-10 bg-white"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-[#EAECF2]">
            <img src="/kailash-Logo.png" alt="Kailash Healthcare" className="h-7 w-7 object-contain" />
          </div>
          <div className="leading-none">
            <p className="font-bold text-[15px] text-[#101828] tracking-tight">Kailash HMS</p>
            <p className="text-[11px] font-medium text-[#667085] mt-0.5">Hospital Management System</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/checkin')}
          className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold text-[#344054] bg-white border border-[#EAECF2] hover:border-[#D0D5DD] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        >
          <QrCode className="h-4 w-4 text-[#1E3A8A]" />
          Patient Self Check-In
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-5 lg:px-10 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 min-h-0">

        {/* Left — contained premium brand panel */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-between rounded-3xl relative overflow-hidden p-8"
          style={{ background: 'linear-gradient(160deg, #0B1A36 0%, #0F2347 45%, #0A1526 100%)' }}
        >
          {/* grid + glow texture */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -right-12 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(14,159,110,0.14) 0%, transparent 70%)' }} />

          {/* Hero copy */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold tracking-wide"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <Sparkles className="h-3 w-3" /> AI-NATIVE PLATFORM
            </span>
            <h1 className="text-[28px] font-bold leading-[1.2] tracking-tight mt-5 text-white">
              Intelligent care,<br />
              <span style={{ background: 'linear-gradient(135deg, #93B4FF, #5EE3B0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                seamless operations.
              </span>
            </h1>
            <p className="text-[13.5px] leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
              One enterprise platform for the entire hospital — clinical, operations, and support teams, unified.
            </p>
          </div>

          {/* Live metric chips */}
          <div className="relative z-10 space-y-2.5 my-7">
            {floatingCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(147,180,255,0.14)', border: '1px solid rgba(147,180,255,0.18)' }}>
                    <Icon className="h-4 w-4" style={{ color: '#93B4FF' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.42)' }}>{card.title}</p>
                    <p className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>{card.value}</p>
                  </div>
                  <p className="text-[10.5px] text-right flex-shrink-0" style={{ color: 'rgba(255,255,255,0.32)' }}>{card.sub}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Trust badges + footer */}
          <div className="relative z-10">
            <div className="flex flex-wrap gap-1.5">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon className="h-3 w-3" /> {label}
                </div>
              ))}
            </div>
            <p className="text-[10.5px] font-medium mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>© 2026 Kailash Healthcare Group</p>
          </div>
        </motion.aside>

        {/* Right — portal launcher */}
        <main className="flex flex-col min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start justify-between gap-4 flex-wrap mb-5"
          >
            <div>
              <h2 className="text-[22px] font-bold text-[#101828] tracking-tight">Select your portal</h2>
              <p className="text-[13.5px] text-[#667085] mt-1">{totalRoles} role portals across clinical, operations, finance &amp; support</p>
            </div>
            <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full"
              style={{ background: 'var(--color-warning-bg)', border: '1px solid rgba(217,119,6,0.20)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[12px] font-semibold text-[#B45309]">Demo — pick any role to explore</span>
            </div>
          </motion.div>

          {/* Category pills */}
          <div className="flex-shrink-0 flex gap-1.5 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
            {allRoleGroups.map(group => {
              const active = activeTab === group.id
              return (
                <button
                  key={group.id}
                  onClick={() => setActiveTab(group.id)}
                  className={cn(
                    "flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap border",
                    active
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-white text-[#475467] border-[#EAECF2] hover:border-[#D0D5DD] hover:text-[#101828]"
                  )}
                >
                  {group.label}
                  <span className={cn("text-[11px] font-bold", active ? "text-white/70" : "text-[#98A2B3]")}>{group.roles.length}</span>
                </button>
              )
            })}
          </div>

          {/* Role cards */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
              >
                {activeGroup.roles.map(({ role, label, desc, icon: Icon, href }) => {
                  const isSelected = selectedRole === role
                  const isLoading = loadingRole === role
                  return (
                    <button
                      key={role}
                      onClick={() => handleLogin(role, href)}
                      disabled={!!loadingRole}
                      className={cn(
                        "group flex items-start gap-3 p-4 rounded-2xl text-left cursor-pointer w-full bg-white border transition-all duration-200",
                        isSelected
                          ? "border-[#1E3A8A] shadow-[0_0_0_1px_#1E3A8A,0_8px_24px_rgba(30,58,138,0.12)]"
                          : "border-[#EAECF2] hover:border-[#D0D5DD] hover:shadow-[0_6px_18px_rgba(16,24,40,0.08)] hover:-translate-y-0.5"
                      )}
                    >
                      {/* Icon chip — soft tinted, uniform brand */}
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: BRAND_SOFT, color: BRAND_COLOR }}>
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5" style={{ color: BRAND_COLOR }} fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#101828] text-[14px] leading-tight">{label}</p>
                        <p className="text-[11.5px] text-[#667085] mt-1 leading-relaxed">{desc}</p>
                      </div>

                      <ArrowRight
                        className={cn(
                          "h-4 w-4 flex-shrink-0 mt-0.5 transition-all duration-200",
                          isSelected ? "text-[#1E3A8A]" : "text-[#CBD2DC] group-hover:text-[#1E3A8A] group-hover:translate-x-0.5"
                        )}
                      />
                    </button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile check-in CTA */}
          <button
            onClick={() => router.push('/checkin')}
            className="sm:hidden mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm text-[#344054] bg-white border border-[#EAECF2] cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-[#1E3A8A]" />
            Patient Self Check-In
          </button>
        </main>
      </div>
    </div>
  )
}
