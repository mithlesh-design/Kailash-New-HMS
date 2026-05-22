"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { QrCode, ArrowRight, Clock, Shield, Wifi, Sparkles, Video, ExternalLink } from "lucide-react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { QRCodeSVG } from "qrcode.react"

const steps = [
  { step: '01', label: 'Scan QR',       desc: 'Scan with any phone camera' },
  { step: '02', label: 'Fill Details',  desc: 'Name, Aadhaar, symptoms' },
  { step: '03', label: 'Get Token',     desc: 'Instant queue assignment' },
  { step: '04', label: 'Track Live',    desc: 'Real-time wait updates' },
]

const DEMO_FAMILY_TOKEN = 'demo-family-token-meera-001'

export default function CheckinPage() {
  const router = useRouter()
  const [checkInUrl, setCheckInUrl] = useState('')
  const [familyTrackUrl, setFamilyTrackUrl] = useState('')

  useEffect(() => {
    setCheckInUrl(`${window.location.origin}/checkin/intake`)
    setFamilyTrackUrl(`${window.location.origin}/family-track/${DEMO_FAMILY_TOKEN}`)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* Left — Info Side (Branding & Steps) */}
      <div className="flex-1 bg-slate-50 border-r border-slate-200 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        
        {/* Subtle background gradient layer */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center">
                <img src="/kailash-Logo.png" alt="Kailash Healthcare" className="h-10 w-auto object-contain" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kailash Healthcare</h2>
            </div>

            <NeonBadge variant="teal" dot pulse className="mb-6 inline-flex">
              <Wifi className="h-3 w-3" /> Live Check-In System
            </NeonBadge>

            <h1 className="text-5xl font-black leading-[1.1] tracking-tighter text-slate-900 mb-5">
              Skip the queue.<br />
              <span className="text-blue-600">
                Check in digitally.
              </span>
            </h1>

            <p className="text-lg leading-relaxed text-slate-500 mb-10 font-medium">
              Scan the QR code, enter your details and upload any medical reports.
              Your information reaches the doctor before your consultation even begins.
            </p>

            {/* Steps */}
            <div className="space-y-6">
              {steps.map(({ step, label, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4"
                >
                  <div className="h-10 w-10 rounded-[12px] flex items-center justify-center flex-shrink-0 font-bold text-sm bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                    {step}
                  </div>
                  <div>
                    <p className="font-bold text-base text-slate-900 leading-tight">{label}</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <Shield className="h-5 w-5 text-green-500" />
                AES-256 Encrypted
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <Clock className="h-5 w-5 text-teal-500" />
                Under 2 minutes
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — QR Card Side */}
      <div className="flex-1 bg-white p-8 md:p-16 flex flex-col items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full max-w-md"
        >
          {/* QR Box */}
          <div className="w-full bg-white rounded-[32px] p-10 flex flex-col items-center gap-8 shadow-2xl border border-slate-100 mb-8">
            {/* Real scannable QR code */}
            <div className="relative bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex items-center justify-center">
              {checkInUrl ? (
                <QRCodeSVG
                  value={checkInUrl}
                  size={192}
                  bgColor="#F8FAFC"
                  fgColor="#0F172A"
                  level="M"
                  includeMargin={false}
                  aria-label="Scan this QR code with your phone camera to begin check-in"
                />
              ) : (
                <div className="h-48 w-48 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" role="status" aria-label="Loading QR code" />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="font-bold text-xl text-slate-900 mb-1">
                Kailash Healthcare OPD
              </p>
              <p className="text-sm font-medium text-slate-500">
                Scan with phone camera • No app needed
              </p>
            </div>

            {/* AI ready indicator */}
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-50 border border-teal-100 w-full justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-bold text-teal-700">
                AI Triage Active
              </span>
              <div className="status-dot online pulse ml-1.5" />
            </div>
          </div>

          {/* Or proceed manually */}
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Or proceed manually</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/checkin/intake')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              Start Kiosk Check-In
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Demo family portal shortcut */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Video className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-amber-900">Family Live Tracking — Demo</p>
                <p className="text-xs text-amber-700 mt-0.5">View Meera Pillai's live status + camera request</p>
                {familyTrackUrl && (
                  <p className="text-[10px] text-amber-500 font-mono mt-1 truncate">{familyTrackUrl}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(`/family-track/${DEMO_FAMILY_TOKEN}`)}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Family Portal
            </button>
          </motion.div>
        </motion.div>
      </div>

    </div>
  )
}
