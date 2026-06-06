"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Clock, Shield, Wifi, Sparkles, ScanLine } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { QRCodeSVG } from "qrcode.react"

const steps = [
  { step: '01', label: 'Scan QR', desc: 'Use any phone camera' },
  { step: '02', label: 'Fill Details', desc: 'A few quick taps' },
  { step: '03', label: 'Get Token', desc: 'Instant queue spot' },
  { step: '04', label: 'Track Live', desc: 'Real-time updates' },
]

export default function CheckinPage() {
  const router = useRouter()
  const [checkInUrl, setCheckInUrl] = useState('')

  useEffect(() => { setCheckInUrl(`${window.location.origin}/checkin/intake`) }, [])

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-white flex flex-col md:flex-row">

      {/* Left — info (desktop only) */}
      <div className="hidden md:flex md:flex-1 bg-slate-50 border-r border-slate-200 px-12 lg:px-16 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <img src="/kailash-Logo.png" alt="Kailash Healthcare" className="h-9 w-auto object-contain" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Kailash Healthcare</h2>
          </div>
          <NeonBadge variant="teal" dot pulse className="mb-5 inline-flex"><Wifi className="h-3 w-3" /> Live Check-In</NeonBadge>
          <h1 className="text-[40px] font-black leading-[1.08] tracking-tighter text-slate-900 mb-4">
            Skip the queue.<br /><span className="text-blue-600">Check in digitally.</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-500 mb-7 font-medium">
            Scan the QR, enter your details, and your information reaches the doctor before your consultation begins.
          </p>
          <div className="space-y-4">
            {steps.map(({ step, label, desc }) => (
              <div key={step} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-[11px] flex items-center justify-center flex-shrink-0 font-bold text-[13px] bg-blue-50 text-blue-600 border border-blue-100">{step}</div>
                <div>
                  <p className="font-bold text-[15px] text-slate-900 leading-tight">{label}</p>
                  <p className="text-[13px] text-slate-500 font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600"><Shield className="h-4.5 w-4.5 text-green-500" /> AES-256 Encrypted</div>
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600"><Clock className="h-4.5 w-4.5 text-blue-500" /> Under 2 minutes</div>
          </div>
        </div>
      </div>

      {/* Right — QR + action */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-[360px]"
        >
          <div className="md:hidden flex items-center gap-2 mb-4">
            <img src="/kailash-Logo.png" alt="Kailash Healthcare" className="h-8 w-auto object-contain" />
            <span className="text-base font-bold text-slate-900">Kailash Healthcare</span>
          </div>

          <div className="w-full bg-white rounded-[28px] p-6 flex flex-col items-center gap-4 shadow-2xl border border-slate-100 mb-6">
            <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100 flex items-center justify-center">
              {checkInUrl ? (
                <QRCodeSVG value={checkInUrl} size={176} bgColor="#F8FAFC" fgColor="#0F172A" level="M" aria-label="Scan to begin check-in" />
              ) : (
                <div className="h-[176px] w-[176px] flex items-center justify-center"><div className="h-9 w-9 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" role="status" aria-label="Loading QR code" /></div>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-[17px] text-slate-900">Kailash Healthcare — OPD</p>
              <p className="text-[13px] font-medium text-slate-500">Scan with your phone camera • No app needed</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 w-full justify-center">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-[13px] font-bold text-blue-700">AI Triage Active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse ml-1" />
            </div>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Or use this kiosk</p>
          <button
            onClick={() => router.push('/checkin/intake')}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-[15px] text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ScanLine className="h-5 w-5" /> Start Kiosk Check-In <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
