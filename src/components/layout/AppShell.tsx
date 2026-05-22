"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Activity, BarChart3, Bell, Calendar, ClipboardList,
  FileText, Home, LogOut, Settings, Users, Stethoscope,
  LayoutDashboard, Receipt, UserCog, Workflow, Bot,
  FlaskConical, Pill, Search, PanelLeftClose, PanelLeft,
  Package, CheckCircle, ShieldCheck, Microscope, ScanLine, Ambulance, X,
  BedDouble, Scissors, CreditCard, Trash2, HeartPulse,
  Droplets, Utensils, Truck, Heart, BookOpen, AlertTriangle,
  Sparkles, ChevronRight,
} from "lucide-react"
import { useAuthStore, type Role } from "@/store/useAuthStore"
import { Avatar } from "@/components/ui/avatar"
import { LocaleToggle } from "@/components/ui/LocaleToggle"
import { useState } from "react"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: React.ElementType }

const navByRole: Record<Role, NavItem[]> = {
  patient: [
    { href: '/patient/dashboard',    label: 'Dashboard',     icon: Home },
    { href: '/patient/appointments', label: 'Appointments',  icon: Calendar },
    { href: '/patient/waiting',      label: 'Waiting Room',  icon: Activity },
    { href: '/patient/records',      label: 'My Records',    icon: FileText },
    { href: '/patient/billing',      label: 'Billing',       icon: Receipt },
    { href: '/patient/followup',     label: 'Post-Discharge',icon: HeartPulse },
    { href: '/discovery',            label: 'Find a Doctor', icon: Search },
  ],
  doctor: [
    { href: '/doctor/dashboard',      label: 'Consultations',    icon: Stethoscope },
    { href: '/doctor/records',        label: 'Patient Records',  icon: ClipboardList },
    { href: '/doctor/schedule',       label: 'My Schedule',      icon: Calendar },
    { href: '/doctor/consultation',   label: 'Consultation',     icon: Bot },
    { href: '/doctor/inbox',          label: 'Inbox',            icon: FileText },
    { href: '/doctor/telemedicine',   label: 'Telemedicine',     icon: Activity },
    { href: '/doctor/registries',     label: 'Disease Registries', icon: Users },
  ],
  reception: [
    { href: '/reception/dashboard', label: 'Queue Board',    icon: LayoutDashboard },
    { href: '/reception/patients',  label: 'Patients',       icon: Users },
    { href: '/checkin',             label: 'Kiosk System',   icon: ScanLine },
  ],
  admin: [
    { href: '/admin/dashboard',       label: 'COO Dashboard',    icon: LayoutDashboard },
    { href: '/admin/users',           label: 'Staff Management', icon: UserCog },
    { href: '/admin/operations',      label: 'Operations',       icon: Workflow },
    { href: '/admin/analytics',       label: 'Analytics',        icon: BarChart3 },
    { href: '/admin/roster',          label: 'HR Roster',        icon: Calendar },
    { href: '/admin/duty',            label: 'Duty Assignment',  icon: ClipboardList },
    { href: '/admin/staffing',        label: 'Staffing Overview',icon: Users },
    { href: '/quality/dashboard',     label: 'Quality',          icon: ShieldCheck },
    { href: '/quality/nabh',          label: 'NABH Cockpit',     icon: ShieldCheck },
    { href: '/admin/ai-performance',  label: 'AI Performance',   icon: Sparkles },
  ],
  nurse: [
    { href: '/nurse/dashboard',  label: 'Ward Dashboard',  icon: LayoutDashboard },
    { href: '/nurse/patients',   label: 'My Patients',     icon: Users },
    { href: '/nurse/rounds',     label: 'Doctor Rounds',   icon: Stethoscope },
    { href: '/nurse/tasks',      label: 'Daily Tasks',     icon: ClipboardList },
    { href: '/nurse/medication', label: 'Medication (MAR)', icon: Pill },
    { href: '/nurse/handover',   label: 'Handover Brief',  icon: FileText },
  ],
  emergency: [
    { href: '/emergency/dashboard', label: 'ER Dashboard',  icon: Activity },
    { href: '/emergency/triage',    label: 'Triage Queue',  icon: Ambulance },
  ],
  lab: [
    { href: '/lab/dashboard', label: 'Lab Overview',    icon: FlaskConical },
    { href: '/lab/samples',   label: 'Sample Tracking', icon: Microscope },
    { href: '/lab/qc',        label: 'Quality Control', icon: ShieldCheck },
    { href: '/lab/reflex',    label: 'Reflex Tests',    icon: Activity },
  ],
  radiology: [
    { href: '/radiology/dashboard', label: 'RIS Dashboard',    icon: LayoutDashboard },
    { href: '/radiology/scans',     label: 'Scan Schedule',    icon: ScanLine },
    { href: '/radiology/viewer',    label: 'DICOM Viewer',     icon: FileText },
    { href: '/radiology/templates', label: 'Report Templates', icon: ClipboardList },
  ],
  insurance: [
    { href: '/insurance/dashboard', label: 'TPA Overview',  icon: LayoutDashboard },
    { href: '/insurance/claims',    label: 'Active Claims', icon: FileText },
    { href: '/insurance/preauth',   label: 'Pre-Auth',      icon: ShieldCheck },
    { href: '/insurance/documents', label: 'Documents',     icon: Package },
  ],
  inventory: [
    { href: '/inventory/dashboard', label: 'Asset Overview', icon: LayoutDashboard },
    { href: '/inventory/stock',     label: 'Stock Levels',   icon: Package },
  ],
  pharmacy: [
    { href: '/pharmacy/dashboard',  label: 'Pharmacy Queue',   icon: Pill },
    { href: '/pharmacy/dispense',   label: 'Dispense',         icon: CheckCircle },
    { href: '/pharmacy/inventory',  label: 'Inventory',        icon: Package },
    { href: '/pharmacy/master',     label: 'Drug Master',      icon: BookOpen },
    { href: '/pharmacy/narcotics',  label: 'Narcotics Log',    icon: AlertTriangle },
  ],
  bed_manager: [
    { href: '/admission/dashboard', label: 'Admissions',   icon: BedDouble },
    { href: '/admission/beds',      label: 'Bed Board',    icon: LayoutDashboard },
    { href: '/admission/forecast',  label: 'Bed Forecast', icon: BarChart3 },
  ],
  discharge: [
    { href: '/discharge/dashboard', label: 'Discharge Queue', icon: CheckCircle },
  ],
  billing: [
    { href: '/billing/dashboard',   label: 'Billing Overview', icon: CreditCard },
    { href: '/billing/packages',    label: 'Packages',         icon: Package },
    { href: '/billing/refunds',     label: 'Refunds',          icon: Receipt },
    { href: '/billing/discounts',   label: 'Discounts',        icon: Heart },
  ],
  ot: [
    { href: '/ot/dashboard',    label: 'OT Live',          icon: Scissors },
    { href: '/ot/schedule',     label: 'OT Schedule',      icon: Calendar },
    { href: '/ot/checklist',    label: 'Pre-Op Checklist', icon: ClipboardList },
  ],
  housekeeping: [
    { href: '/housekeeping/dashboard', label: 'Cleaning Queue', icon: Trash2 },
  ],
  quality: [
    { href: '/quality/dashboard',  label: 'QI Dashboard', icon: ShieldCheck },
    { href: '/quality/incidents',  label: 'Incidents',    icon: Activity },
  ],
  blood_bank: [
    { href: '/bloodbank/dashboard',  label: 'BB Dashboard',         icon: Droplets },
    { href: '/bloodbank/inventory',  label: 'Inventory',            icon: Package },
    { href: '/bloodbank/requests',   label: 'Cross-Match Requests', icon: ClipboardList },
    { href: '/bloodbank/donors',     label: 'Donor Registry',       icon: Heart },
  ],
  cssd: [
    { href: '/cssd/dashboard',    label: 'CSSD Dashboard',       icon: LayoutDashboard },
    { href: '/cssd/cycles',       label: 'Sterilization Cycles', icon: Activity },
    { href: '/cssd/instruments',  label: 'Instruments',          icon: Package },
  ],
  dietary: [
    { href: '/dietary/dashboard', label: 'Dietary Dashboard', icon: Utensils },
    { href: '/dietary/plans',     label: 'Diet Plans',        icon: BookOpen },
    { href: '/dietary/orders',    label: 'Meal Orders',       icon: ClipboardList },
  ],
  bmw: [
    { href: '/bmw/dashboard', label: 'BMW Dashboard',      icon: AlertTriangle },
    { href: '/bmw/log',       label: 'Waste Log',          icon: FileText },
    { href: '/bmw/reports',   label: 'Compliance Reports', icon: BarChart3 },
  ],
  mortuary: [
    { href: '/mortuary/dashboard',   label: 'Mortuary Dashboard', icon: LayoutDashboard },
    { href: '/mortuary/records',     label: 'Deceased Records',   icon: FileText },
    { href: '/mortuary/clearances',  label: 'Legal Clearances',   icon: CheckCircle },
  ],
  ambulance: [
    { href: '/ambulance/dashboard', label: 'Fleet Dashboard', icon: Truck },
    { href: '/ambulance/dispatch',  label: 'Dispatch',        icon: Activity },
    { href: '/ambulance/log',       label: 'Trip Log',        icon: FileText },
  ],
  audit_officer: [
    { href: '/audit/dashboard', label: 'Audit Dashboard',     icon: ShieldCheck },
    { href: '/audit/log',       label: 'Audit Trail',         icon: FileText },
    { href: '/audit/reports',   label: 'Compliance Reports',  icon: BarChart3 },
  ],
}

const roleConfig: Record<Role, { label: string; color: string; bg: string; gradient: string }> = {
  patient:       { label: 'Patient Portal',      color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   gradient: 'linear-gradient(135deg,#2563EB,#0891B2)' },
  doctor:        { label: 'Doctor Portal',       color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)',  gradient: 'linear-gradient(135deg,#0EA5E9,#6366F1)' },
  reception:     { label: 'Reception',           color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', gradient: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  admin:         { label: 'Admin Portal',        color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',  gradient: 'linear-gradient(135deg,#8B5CF6,#6366F1)' },
  nurse:         { label: 'Nursing Station',     color: '#10B981', bg: 'rgba(16,185,129,0.08)', gradient: 'linear-gradient(135deg,#10B981,#06B6D4)' },
  emergency:     { label: 'Emergency Room',      color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  gradient: 'linear-gradient(135deg,#EF4444,#F97316)' },
  lab:           { label: 'Laboratory',          color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', gradient: 'linear-gradient(135deg,#8B5CF6,#EC4899)' },
  radiology:     { label: 'Radiology Dept',      color: '#6366F1', bg: 'rgba(99,102,241,0.08)', gradient: 'linear-gradient(135deg,#6366F1,#8B5CF6)' },
  insurance:     { label: 'TPA & Insurance',     color: '#14B8A6', bg: 'rgba(20,184,166,0.08)', gradient: 'linear-gradient(135deg,#14B8A6,#0EA5E9)' },
  inventory:     { label: 'Inventory Mgr',       color: '#D97706', bg: 'rgba(217,119,6,0.08)',  gradient: 'linear-gradient(135deg,#D97706,#EA580C)' },
  pharmacy:      { label: 'Pharmacy',            color: '#EC4899', bg: 'rgba(236,72,153,0.08)', gradient: 'linear-gradient(135deg,#EC4899,#8B5CF6)' },
  bed_manager:   { label: 'Admission Desk',      color: '#0891B2', bg: 'rgba(8,145,178,0.08)',  gradient: 'linear-gradient(135deg,#0891B2,#0EA5E9)' },
  discharge:     { label: 'Discharge Desk',      color: '#059669', bg: 'rgba(5,150,105,0.08)',  gradient: 'linear-gradient(135deg,#059669,#10B981)' },
  billing:       { label: 'Billing Dept',        color: '#B45309', bg: 'rgba(180,83,9,0.08)',   gradient: 'linear-gradient(135deg,#B45309,#D97706)' },
  ot:            { label: 'Operation Theater',   color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  gradient: 'linear-gradient(135deg,#DC2626,#9F1239)' },
  housekeeping:  { label: 'Housekeeping',        color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', gradient: 'linear-gradient(135deg,#7C3AED,#6366F1)' },
  quality:       { label: 'Quality & Safety',    color: '#0D9488', bg: 'rgba(13,148,136,0.08)', gradient: 'linear-gradient(135deg,#0D9488,#0891B2)' },
  blood_bank:    { label: 'Blood Bank',          color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  gradient: 'linear-gradient(135deg,#DC2626,#B91C1C)' },
  cssd:          { label: 'CSSD',               color: '#0D9488', bg: 'rgba(13,148,136,0.08)', gradient: 'linear-gradient(135deg,#0D9488,#0891B2)' },
  dietary:       { label: 'Dietary Services',    color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  gradient: 'linear-gradient(135deg,#16A34A,#0D9488)' },
  bmw:           { label: 'Bio-Medical Waste',   color: '#D97706', bg: 'rgba(217,119,6,0.08)',  gradient: 'linear-gradient(135deg,#D97706,#B45309)' },
  mortuary:      { label: 'Mortuary',            color: '#475569', bg: 'rgba(71,85,105,0.08)',  gradient: 'linear-gradient(135deg,#475569,#334155)' },
  ambulance:     { label: 'Ambulance Svc.',      color: '#EA580C', bg: 'rgba(234,88,12,0.08)',  gradient: 'linear-gradient(135deg,#EA580C,#DC2626)' },
  audit_officer: { label: 'Audit & Compliance',  color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',  gradient: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
}

const allRoles: Role[] = [
  'patient', 'doctor', 'nurse', 'reception', 'admin',
  'emergency', 'lab', 'radiology', 'pharmacy', 'insurance', 'inventory',
  'bed_manager', 'discharge', 'billing', 'ot', 'housekeeping', 'quality',
  'blood_bank', 'cssd', 'dietary', 'bmw', 'mortuary', 'ambulance', 'audit_officer',
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, activeRole, setRole, logout } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const nav = navByRole[activeRole] ?? []
  const config = roleConfig[activeRole]
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleRoleSwitch = (role: Role) => {
    setRole(role)
    router.push(navByRole[role][0].href)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0F4F8' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 264 }}
        transition={transition}
        className="flex-shrink-0 flex flex-col bg-white z-20 relative overflow-hidden"
        style={{ boxShadow: '4px 0 24px rgba(15,23,42,0.07)' }}
        aria-label="Main sidebar"
      >
        {/* Brand Header */}
        <div className="h-[68px] flex items-center px-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap w-full">
            <div
              className="flex items-center justify-center flex-shrink-0 h-10 w-10 rounded-xl bg-white"
              style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.12)' }}
            >
              <img src="/kailash-Logo.png" alt="Kailash" className="h-8 w-8 object-contain" />
            </div>
            {!collapsed && (
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                className="min-w-0"
              >
                <p
                  className="font-bold text-sm leading-tight tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #0F172A, #334155)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Kailash HMS
                </p>
                <p className="text-[11px] font-semibold truncate max-w-[160px]" style={{ color: config.color }}>{config.label}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <div
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer relative group",
                    isActive
                      ? "font-semibold"
                      : "font-medium text-[#64748B] hover:text-[#0F172A]"
                  )}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${config.bg}, rgba(15,23,42,0.02))`,
                    color: config.color,
                  } : {}}
                >
                  {/* Active indicator pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                      style={{ background: config.gradient }}
                    />
                  )}
                  {/* Hover background for inactive */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  )}
                  <Icon
                    className={cn("h-[18px] w-[18px] flex-shrink-0 relative z-10 transition-colors")}
                    style={{ color: isActive ? config.color : undefined }}
                    aria-hidden="true"
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate relative z-10">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <ChevronRight className="h-3.5 w-3.5 relative z-10 opacity-50" style={{ color: config.color }} />
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom: Role Switcher + User */}
        <div className="px-2.5 pb-4 flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid rgba(15,23,42,0.05)' }}>
          {!collapsed && (
            <div className="p-3 rounded-xl mb-1" style={{ background: '#F8FAFC' }}>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2 px-1">Switch Portal</p>
              <div className="grid grid-cols-2 gap-1">
                {allRoles.map((role) => {
                  const rc = roleConfig[role]
                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      aria-label={`Switch to ${role} portal`}
                      className="text-[10px] font-semibold rounded-lg px-2 py-1.5 capitalize transition-all cursor-pointer text-left leading-tight"
                      style={activeRole === role ? {
                        background: rc.gradient,
                        color: 'white',
                        boxShadow: `0 2px 8px ${rc.color}30`,
                      } : {
                        color: '#64748B',
                      }}
                    >
                      {role.replace('_', ' ')}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* AI Status Chip */}
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #FAF5FF, #F5F3FF)', border: '1px solid rgba(139,92,246,0.10)' }}>
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#7C3AED' }} />
              <span className="text-[11px] font-semibold" style={{ color: '#7C3AED' }}>AI Active</span>
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" style={{ boxShadow: '0 0 6px #22c55e' }} />
            </div>
          )}

          {/* User Row */}
          <div className={cn("flex items-center", collapsed ? "justify-center flex-col gap-2" : "gap-3 px-1")}>
            <Avatar name={currentUser?.name ?? 'User'} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A] truncate">{currentUser?.name}</p>
                <p className="text-[11px] font-medium text-[#94A3B8] truncate">{currentUser?.id}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="p-1.5 rounded-lg transition-all flex-shrink-0 cursor-pointer"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ── Main Area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header
          className="h-[68px] flex-shrink-0 flex items-center justify-between px-6 bg-white relative z-10"
          style={{ boxShadow: '0 1px 12px rgba(15,23,42,0.06)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-2 -ml-2 rounded-xl transition-all cursor-pointer"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#0F172A'; (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              {collapsed
                ? <PanelLeft className="h-5 w-5" aria-hidden="true" />
                : <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
              }
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#0F172A]">
                {nav.find(n => pathname.startsWith(n.href))?.label ?? 'Dashboard'}
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="flex items-center gap-1 text-xs font-medium text-[#94A3B8]">
                  <li>{config.label}</li>
                  {nav.find(n => pathname.startsWith(n.href)) && (
                    <>
                      <li aria-hidden="true">/</li>
                      <li aria-current="page" className="font-semibold" style={{ color: config.color }}>
                        {nav.find(n => pathname.startsWith(n.href))?.label}
                      </li>
                    </>
                  )}
                </ol>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Global Search */}
            <div className="relative hidden md:block w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search patients..."
                aria-label="Search patients"
                className="w-full h-9 pl-9 pr-4 rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none transition-all"
                style={{
                  background: '#F8FAFC',
                  border: '1px solid rgba(15,23,42,0.06)',
                  boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.04)',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = `0 0 0 2px ${config.color}30`; e.currentTarget.style.borderColor = config.color }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(15,23,42,0.04)'; e.currentTarget.style.borderColor = 'rgba(15,23,42,0.06)' }}
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                aria-expanded={notifOpen}
                className="relative p-2 rounded-xl transition-all cursor-pointer"
                style={{ background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 4px rgba(15,23,42,0.06)', color: '#64748B' }}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]" style={{ boxShadow: '0 0 0 1.5px white' }} aria-label="New notifications" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-72 bg-white rounded-2xl z-50 overflow-hidden"
                    style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.08)' }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
                      <p className="text-sm font-bold text-[#0F172A]">Notifications</p>
                      <button onClick={() => setNotifOpen(false)} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="p-6 text-center text-sm text-[#94A3B8]">
                      All caught up — no new notifications
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <LocaleToggle />

            <Link href="/admin/analytics">
              <button
                aria-label="Settings"
                className="p-2 rounded-xl transition-all cursor-pointer"
                style={{ background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 1px 4px rgba(15,23,42,0.06)', color: '#64748B' }}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
              </button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto px-6 pb-8 pt-6 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' as const }}
              className="h-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
