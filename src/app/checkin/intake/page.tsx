"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  User, CreditCard, Stethoscope, Upload,
  ArrowLeft, CheckCircle, AlertTriangle, Activity, Camera,
  ChevronRight, Phone, ScanLine, ShieldCheck, Sparkles, Share2, QrCode, Mic, MicOff,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { NeonBadge } from "@/components/ui/neon-badge"
import { usePatientStore } from "@/store/usePatientStore"
import { extractIntakeFromVoice } from "@/ai-services/voice-intake"
import { cn } from "@/lib/utils"

const VISIT_TYPES = [
  { id: 'New OPD',           label: 'New OPD',           desc: 'First-time visit' },
  { id: 'Follow-up',         label: 'Follow-up',         desc: 'Return visit' },
  { id: 'Emergency',         label: 'Emergency',         desc: 'Urgent care' },
  { id: 'Admission Inquiry', label: 'Admission',         desc: 'IPD inquiry' },
  { id: 'Cashless',          label: 'Cashless',          desc: 'Insurance TPA' },
  { id: 'Walk-in',           label: 'Walk-in',           desc: 'No appointment' },
] as const

const SYMPTOMS = [
  'Fever', 'Headache', 'Chest Pain', 'Shortness of Breath',
  'Cough', 'Nausea / Vomiting', 'Abdominal Pain', 'Dizziness',
  'Back Pain', 'Joint Pain', 'Fatigue', 'Skin Rash',
  'Difficulty Swallowing', 'Vision Issues', 'Hearing Issues', 'Other',
]

const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Orthopedics',
  'Neurology', 'Dermatology', 'ENT', 'Ophthalmology', 'Gastroenterology',
]

const INSURERS = [
  'Star Health Insurance', 'HDFC Ergo Health', 'Niva Bupa Health',
  'Care Health Insurance', 'Max Bupa Health', 'United India Insurance',
  'New India Assurance', 'National Insurance', 'Oriental Insurance',
]

function triageScore(symptoms: string[]): { level: 'Low' | 'Medium' | 'High' | 'Critical'; color: string; variant: 'success' | 'warning' | 'orange' | 'danger' } {
  const critical = ['Chest Pain', 'Shortness of Breath', 'Difficulty Swallowing']
  const high = ['Fever', 'Dizziness', 'Abdominal Pain', 'Vision Issues']
  if (symptoms.some(s => critical.includes(s))) return { level: 'Critical', color: 'text-red-600', variant: 'danger' }
  if (symptoms.filter(s => high.includes(s)).length >= 2) return { level: 'High', color: 'text-orange-600', variant: 'orange' }
  if (symptoms.length >= 3) return { level: 'Medium', color: 'text-amber-500', variant: 'warning' }
  return { level: 'Low', color: 'text-green-500', variant: 'success' }
}

export default function IntakePage() {
  const router = useRouter()
  const { addPatient, generateFamilyToken } = usePatientStore()

  const [step, setStep] = useState(1)
  const [dishaConsent, setDishaConsent] = useState(false)
  const [familyPhone, setFamilyPhone] = useState('')
  const [familyToken, setFamilyToken] = useState<string | null>(null)
  const [inputMode, setInputMode] = useState<'manual' | 'aadhaar' | 'voice'>('manual')
  const [voiceSupported] = useState(() => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('en')
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'done'>('idle')
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [elderlyMode, setElderlyMode] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const [aadhaarScanState, setAadhaarScanState] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [scannedFields, setScannedFields] = useState<Set<string>>(new Set())
  const [form, setForm] = useState({
    name: '', phone: '', aadhaar: '', age: '', gender: 'Male',
    symptoms: [] as string[], department: 'General Medicine',
    notes: '', hasReports: false, visitType: 'New OPD' as string,
  })
  const [healthCard, setHealthCard] = useState({ number: '', insurer: 'Star Health Insurance' })
  const { patients } = usePatientStore()
  const [submitting, setSubmitting] = useState(false)
  const [tokenNumber, setTokenNumber] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const triage = triageScore(form.symptoms)

  const duplicateMatch = (() => {
    const phone = form.phone.replace(/\D/g, '')
    const name = form.name.trim().toLowerCase()
    if (phone.length < 6 && name.length < 3) return null
    return patients.find(p => {
      const pPhone = p.phone.replace(/\D/g, '')
      if (phone.length === 10 && pPhone === phone) return true
      if (phone.length >= 6 && pPhone.startsWith(phone.slice(0, 6)) && name.length >= 3) {
        const firstName = name.split(' ')[0]
        if (p.name.toLowerCase().includes(firstName)) return true
      }
      return false
    }) ?? null
  })()

  const toggleSymptom = (s: string) => {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(s)
        ? f.symptoms.filter(x => x !== s)
        : [...f.symptoms, s],
    }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    const phone = form.phone.replace(/\D/g, '')
    if (!phone) newErrors.phone = 'Phone number is required'
    else if (phone.length !== 10) newErrors.phone = 'Enter a valid 10-digit mobile number'
    const age = parseInt(form.age)
    if (!form.age.trim()) newErrors.age = 'Age is required'
    else if (isNaN(age) || age < 1 || age > 120) newErrors.age = 'Enter a valid age (1–120)'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAadhaarScan = async () => {
    setAadhaarScanState('scanning')
    await new Promise(r => setTimeout(r, 2000))
    setAadhaarScanState('done')
    // Switch to manual tab after brief "done" display
    setTimeout(() => setInputMode('manual'), 300)
    // Staggered auto-fill with flash
    setTimeout(() => { setForm(f => ({ ...f, name: 'Ramesh Kumar' })); setScannedFields(new Set(['name'])) }, 500)
    setTimeout(() => { setForm(f => ({ ...f, age: '42' })); setScannedFields(new Set(['name', 'age'])) }, 700)
    setTimeout(() => { setForm(f => ({ ...f, gender: 'Male' })); setScannedFields(new Set(['name', 'age', 'gender'])) }, 900)
    setTimeout(() => { setForm(f => ({ ...f, aadhaar: '9876 XXXX XXXX' })); setScannedFields(new Set(['name', 'age', 'gender', 'aadhaar'])) }, 1100)
    setTimeout(() => { setScannedFields(new Set()); setAadhaarScanState('idle') }, 2600)
  }

  const startVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SRConstructor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SRConstructor) return
    const recognition = new SRConstructor()
    recognition.lang = voiceLang === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition
    recognition.onstart = () => setVoiceState('listening')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      setVoiceTranscript(transcript)
      setVoiceState('processing')
      const result = await extractIntakeFromVoice(transcript, voiceLang)
      const data = result.data
      setForm(f => ({
        ...f,
        name: data.extractedName ?? f.name,
        age: data.extractedAge ? String(data.extractedAge) : f.age,
        gender: data.extractedGender ?? f.gender,
        symptoms: data.extractedSymptoms.length > 0 ? [...new Set([...f.symptoms, ...data.extractedSymptoms])] : f.symptoms,
        department: data.extractedDepartmentPreference ?? f.department,
      }))
      setVoiceState('done')
    }
    recognition.onerror = () => setVoiceState('idle')
    recognition.onend = () => { if (voiceState === 'listening') setVoiceState('idle') }
    recognition.start()
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setVoiceState('idle')
  }

  useEffect(() => { return () => recognitionRef.current?.stop() }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1600))
    const token = Math.max(...patients.map(p => p.token), 1000) + 1
    setTokenNumber(token)
    const newPatientId = `PT-${Date.now()}`
    addPatient({
      id: newPatientId,
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender as 'Male' | 'Female' | 'Other',
      phone: form.phone,
      bloodGroup: 'A+',
      token,
      estimatedWait: (patients.filter(p => ['waiting', 'vitals'].includes(p.queueStatus)).length + 1) * 4,
      doctor: 'Dr. Priya Nair',
      department: form.department,
      symptoms: form.symptoms,
      history: [],
      triageLevel: triage.level,
      hasReports: form.hasReports,
    })
    if (dishaConsent && familyPhone.trim()) {
      const fToken = generateFamilyToken(newPatientId, [familyPhone.trim()], true)
      setFamilyToken(fToken)
    }
    setSubmitting(false)
    setStep(4)
  }

  const canProceed = () => {
    if (step === 1) return form.name.trim() !== '' && form.phone.trim() !== '' && form.age.trim() !== ''
    if (step === 2) return form.symptoms.length > 0
    return true
  }

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return
    }
    setStep(s => s + 1)
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col md:bg-slate-100 md:py-12">
      <div className="flex-1 w-full max-w-[420px] mx-auto flex flex-col bg-[#F2F2F7] md:rounded-[40px] md:shadow-2xl overflow-hidden relative border-x border-slate-200/50 md:border md:border-white/50">

        {/* iOS-style Dynamic Header */}
        {step < 4 && (
          <div className="pt-8 pb-4 px-6 bg-[#F2F2F7] sticky top-0 z-20">
            <div className="flex justify-center mb-6">
              <img src="/kailash-Logo.png" alt="Kailash Healthcare" className="h-7 w-auto object-contain" />
            </div>
            <div className="flex items-center justify-between mb-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-blue-600 flex items-center gap-1 font-medium -ml-2 active:opacity-60 transition-opacity"
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>
              ) : (
                <div className="w-16" />
              )}

              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === step ? "w-6 bg-blue-600" : i < step ? "w-2 bg-blue-600" : "w-2 bg-slate-300"
                    )}
                  />
                ))}
              </div>

              <div className="w-16" />
            </div>

            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {step === 1 && 'Patient Details'}
                {step === 2 && 'Symptoms'}
                {step === 3 && 'Review'}
              </h1>
            </motion.div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-32 scrollbar-hide">
          <AnimatePresence mode="wait" initial={false}>

            {/* Step 1 — Personal Details */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 pt-2">

                {/* Input Mode Tab Switcher */}
                <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1">
                  <button
                    onClick={() => setInputMode('manual')}
                    className={cn("flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-[0.97]",
                      inputMode === 'manual' ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-slate-500"
                    )}
                  >
                    <User className="h-3.5 w-3.5" /> Manual
                  </button>
                  <button
                    onClick={() => setInputMode('aadhaar')}
                    className={cn("flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-[0.97]",
                      inputMode === 'aadhaar' ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-slate-500"
                    )}
                  >
                    <ScanLine className="h-3.5 w-3.5" /> Aadhaar
                  </button>
                  {voiceSupported && (
                    <button
                      onClick={() => setInputMode('voice')}
                      className={cn("flex-1 h-9 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-[0.97]",
                        inputMode === 'voice' ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-slate-500"
                      )}
                    >
                      <Mic className="h-3.5 w-3.5" /> Voice
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {inputMode === 'manual' ? (
                    <motion.div
                      key="manual"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-5"
                    >
                      {/* iOS Grouped List */}
                      <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        {/* Name */}
                        <div className={cn(
                          "flex items-center px-4 py-1 border-b transition-colors duration-500",
                          scannedFields.has('name') ? 'bg-green-50/80 border-green-200' : errors.name ? 'border-red-200 bg-red-50/30' : 'border-slate-100 focus-within:bg-blue-50/30'
                        )}>
                          {scannedFields.has('name')
                            ? <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 text-green-500" />
                            : <User className={cn("h-5 w-5 mr-3 flex-shrink-0", errors.name ? 'text-red-400' : 'text-slate-400')} />
                          }
                          <input
                            className="w-full h-12 bg-transparent border-none text-slate-900 text-[17px] focus:outline-none placeholder:text-slate-400"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e2 => ({ ...e2, name: '' })) }}
                          />
                        </div>
                        {errors.name && <p className="px-4 py-1.5 text-xs font-medium text-red-600 bg-red-50">{errors.name}</p>}

                        {/* Phone */}
                        <div className={cn(
                          "flex items-center px-4 py-1 border-b transition-colors",
                          errors.phone ? 'border-red-200 bg-red-50/30' : 'border-slate-100 focus-within:bg-blue-50/30'
                        )}>
                          <Phone className={cn("h-5 w-5 mr-3 flex-shrink-0", errors.phone ? 'text-red-400' : 'text-slate-400')} />
                          <input
                            className="w-full h-12 bg-transparent border-none text-slate-900 text-[17px] focus:outline-none placeholder:text-slate-400"
                            placeholder="10-digit Mobile Number"
                            type="tel"
                            inputMode="tel"
                            maxLength={10}
                            value={form.phone}
                            onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(e2 => ({ ...e2, phone: '' })) }}
                          />
                        </div>
                        {errors.phone && <p className="px-4 py-1.5 text-xs font-medium text-red-600 bg-red-50">{errors.phone}</p>}

                        {/* Age */}
                        <div className={cn(
                          "flex items-center px-4 py-1 transition-colors duration-500",
                          scannedFields.has('age') ? 'bg-green-50/80' : errors.age ? 'bg-red-50/30' : 'focus-within:bg-blue-50/30'
                        )}>
                          <div className="h-5 w-5 flex items-center justify-center mr-3 flex-shrink-0">
                            {scannedFields.has('age')
                              ? <CheckCircle className="h-5 w-5 text-green-500" />
                              : <span className={cn("text-[13px] font-bold", errors.age ? 'text-red-400' : 'text-slate-400')}>AGE</span>
                            }
                          </div>
                          <input
                            className="w-full h-12 bg-transparent border-none text-slate-900 text-[17px] focus:outline-none placeholder:text-slate-400"
                            placeholder="Age in years (1–120)"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="120"
                            value={form.age}
                            onChange={e => { setForm(f => ({ ...f, age: e.target.value })); setErrors(e2 => ({ ...e2, age: '' })) }}
                          />
                        </div>
                        {errors.age && <p className="px-4 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-b-[20px]">{errors.age}</p>}
                      </div>

                      {/* Gender Segmented Control */}
                      <div>
                        <p className="text-[13px] uppercase text-slate-500 font-medium ml-4 mb-2 tracking-wide">Biological Gender</p>
                        <div className={cn(
                          "p-1 rounded-xl flex gap-1 transition-colors duration-500",
                          scannedFields.has('gender') ? 'bg-green-100/60' : 'bg-slate-200/60'
                        )}>
                          {['Male', 'Female', 'Other'].map(g => (
                            <button
                              key={g}
                              onClick={() => setForm(f => ({ ...f, gender: g }))}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-[15px] font-medium transition-all active:scale-[0.97]",
                                form.gender === g
                                  ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                                  : "text-slate-500"
                              )}
                            >
                              {g}{scannedFields.has('gender') && form.gender === g && <span className="ml-1 text-green-500">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duplicate Patient Warning */}
                      <AnimatePresence>
                        {duplicateMatch && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[20px]"
                          >
                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[14px] font-bold text-amber-900">Possible match found</p>
                              <p className="text-[13px] text-amber-800 mt-0.5">
                                {duplicateMatch.name} · {duplicateMatch.age} yrs · {duplicateMatch.phone}
                              </p>
                              <p className="text-[12px] text-amber-700 mt-1">
                                Already registered as {duplicateMatch.id}. Continue only if this is a different patient.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Visit Type */}
                      <div>
                        <p className="text-[13px] uppercase text-slate-500 font-medium ml-4 mb-2 tracking-wide">Visit Type</p>
                        <div className="grid grid-cols-3 gap-2">
                          {VISIT_TYPES.map(vt => (
                            <button
                              key={vt.id}
                              onClick={() => setForm(f => ({ ...f, visitType: vt.id }))}
                              className={cn(
                                "flex flex-col items-center py-3 px-2 rounded-[16px] border text-center transition-all active:scale-[0.97]",
                                form.visitType === vt.id
                                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                  : "bg-white border-slate-200 text-slate-700"
                              )}
                            >
                              <span className="text-[14px] font-semibold">{vt.label}</span>
                              <span className={cn("text-[11px] mt-0.5", form.visitType === vt.id ? "text-blue-100" : "text-slate-400")}>{vt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional: Aadhaar + Health Card */}
                      <div>
                        <p className="text-[13px] uppercase text-slate-500 font-medium ml-4 mb-2 tracking-wide">Optional</p>
                        <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                          {/* Aadhaar */}
                          <div className={cn(
                            "flex items-center px-4 py-1 border-b transition-colors duration-500",
                            scannedFields.has('aadhaar') ? 'bg-green-50/80 border-green-200' : 'border-slate-100 focus-within:bg-blue-50/30'
                          )}>
                            {scannedFields.has('aadhaar')
                              ? <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 text-green-500" />
                              : <CreditCard className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                            }
                            <input
                              className="w-full h-12 bg-transparent border-none text-slate-900 text-[17px] font-mono tracking-wider focus:outline-none placeholder:text-slate-400"
                              placeholder="Aadhaar Number"
                              inputMode="numeric"
                              value={form.aadhaar}
                              onChange={e => setForm(f => ({ ...f, aadhaar: e.target.value }))}
                            />
                          </div>

                          {/* Health / Insurance Card Number */}
                          <div className="flex items-center px-4 py-1 border-b border-slate-100 focus-within:bg-blue-50/30 transition-colors">
                            <ShieldCheck className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                            <input
                              className="w-full h-12 bg-transparent border-none text-slate-900 text-[17px] focus:outline-none placeholder:text-slate-400"
                              placeholder="Health / Insurance Card No."
                              value={healthCard.number}
                              onChange={e => setHealthCard(h => ({ ...h, number: e.target.value }))}
                            />
                          </div>

                          {/* Insurer — revealed when card number is typed */}
                          <AnimatePresence>
                            {healthCard.number.trim() && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center px-4 py-2 focus-within:bg-blue-50/30 transition-colors">
                                  <div className="h-5 w-5 mr-3 flex-shrink-0" />
                                  <select
                                    value={healthCard.insurer}
                                    onChange={e => setHealthCard(h => ({ ...h, insurer: e.target.value }))}
                                    className="w-full h-11 bg-transparent border-none text-slate-700 text-[16px] focus:outline-none"
                                  >
                                    {INSURERS.map(i => <option key={i}>{i}</option>)}
                                  </select>
                                  <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="text-[13px] text-slate-400 ml-4 mt-2">Required only if you wish to link your ABHA health ID.</p>
                      </div>
                    </motion.div>
                  ) : inputMode === 'aadhaar' ? (
                    <motion.div
                      key="aadhaar-scan"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      {/* Camera viewfinder */}
                      <div className="relative bg-slate-900 rounded-[20px] overflow-hidden aspect-[4/3] flex items-center justify-center select-none">
                        {aadhaarScanState === 'idle' && (
                          <>
                            <div className="absolute inset-6 border-2 border-dashed border-white/20 rounded-xl" />
                            <div className="flex flex-col items-center justify-center gap-4 text-center z-10">
                              <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <Camera className="h-8 w-8 text-white/60" />
                              </div>
                              <div>
                                <p className="text-white/80 text-[15px] font-semibold">Position Aadhaar card in frame</p>
                                <p className="text-white/40 text-[13px] mt-1">Make sure all four corners are visible</p>
                              </div>
                            </div>
                          </>
                        )}

                        {aadhaarScanState === 'scanning' && (
                          <>
                            <div className="absolute inset-6 border-2 border-green-400/50 rounded-xl" />
                            {/* Corner marks */}
                            <div className="absolute top-6 left-6 h-5 w-5 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
                            <div className="absolute top-6 right-6 h-5 w-5 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
                            <div className="absolute bottom-6 left-6 h-5 w-5 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
                            <div className="absolute bottom-6 right-6 h-5 w-5 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
                            {/* Scanning line */}
                            <motion.div
                              className="absolute left-8 right-8 h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.5)]"
                              style={{ top: '20%' }}
                              animate={{ top: ['20%', '80%', '20%'] }}
                              transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
                            />
                            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
                              <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
                              <p className="text-green-300 text-[13px] font-semibold">Scanning Aadhaar...</p>
                            </div>
                          </>
                        )}

                        {aadhaarScanState === 'done' && (
                          <div className="flex flex-col items-center justify-center gap-3 z-10">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
                            >
                              <CheckCircle className="h-14 w-14 text-green-400" />
                            </motion.div>
                            <p className="text-white font-semibold text-[15px]">Scan Complete</p>
                            <p className="text-white/50 text-[13px]">Auto-filling details...</p>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {aadhaarScanState === 'idle' && (
                        <div className="flex gap-3">
                          <button
                            onClick={handleAadhaarScan}
                            className="flex-1 h-12 rounded-[16px] bg-blue-600 text-white font-semibold text-[15px] active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                          >
                            <ScanLine className="h-5 w-5" /> Scan Card
                          </button>
                          <button
                            className="flex-1 h-12 rounded-[16px] bg-white text-slate-700 font-semibold text-[15px] active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                          >
                            <Upload className="h-5 w-5 text-slate-400" /> Upload Image
                          </button>
                        </div>
                      )}

                      {aadhaarScanState === 'scanning' && (
                        <p className="text-center text-slate-500 text-[14px] font-medium">AI reading your Aadhaar card...</p>
                      )}

                      <p className="text-[13px] text-slate-400 text-center px-4">
                        Your Aadhaar data is processed locally and never stored on our servers.
                      </p>
                    </motion.div>
                  ) : inputMode === 'voice' ? (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4"
                    >
                      {/* Language + Elderly Mode toggles */}
                      <div className="flex gap-2">
                        <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 flex-1">
                          {(['en', 'hi'] as const).map(lang => (
                            <button
                              key={lang}
                              onClick={() => setVoiceLang(lang)}
                              className={cn("flex-1 h-8 rounded-lg text-[13px] font-semibold transition-all",
                                voiceLang === lang ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" : "text-slate-500"
                              )}
                            >
                              {lang === 'en' ? 'English' : 'हिंदी'}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setElderlyMode(e => !e)}
                          className={cn("px-3 h-10 rounded-xl text-[12px] font-semibold border transition-all",
                            elderlyMode ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-white border-slate-200 text-slate-500"
                          )}
                        >
                          {elderlyMode ? '🔡 Large' : 'Normal'}
                        </button>
                      </div>

                      {/* Mic button */}
                      <div className="flex flex-col items-center gap-4 py-6">
                        <button
                          onClick={voiceState === 'listening' ? stopVoice : startVoice}
                          disabled={voiceState === 'processing'}
                          className={cn(
                            "h-24 w-24 rounded-full flex items-center justify-center transition-all active:scale-95",
                            voiceState === 'listening'
                              ? "bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,0.15),0_0_0_24px_rgba(239,68,68,0.07)] animate-pulse"
                              : voiceState === 'processing'
                              ? "bg-amber-400"
                              : "bg-blue-600 shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
                          )}
                        >
                          {voiceState === 'listening'
                            ? <MicOff className="h-10 w-10 text-white" />
                            : <Mic className="h-10 w-10 text-white" />
                          }
                        </button>

                        <p className={cn("text-[15px] font-semibold text-center", elderlyMode && "text-[20px]")}>
                          {voiceState === 'idle' && 'Tap to speak'}
                          {voiceState === 'listening' && 'Listening… tap to stop'}
                          {voiceState === 'processing' && 'Extracting details…'}
                          {voiceState === 'done' && 'Done! Review below.'}
                        </p>

                        {/* Waveform bars when listening */}
                        {voiceState === 'listening' && (
                          <div className="flex items-center gap-1 h-8">
                            {[0.6, 1, 0.4, 0.9, 0.7, 1, 0.5].map((h, i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 bg-red-400 rounded-full"
                                animate={{ scaleY: [h, h * 0.4, h] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                                style={{ height: 32 }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Transcript */}
                      {voiceTranscript && (
                        <div className="bg-slate-100 rounded-[16px] p-4">
                          <p className="text-[12px] text-slate-500 font-medium mb-1 uppercase tracking-wide">Transcript</p>
                          <p className={cn("text-slate-800", elderlyMode ? "text-[18px]" : "text-[14px]")}>&ldquo;{voiceTranscript}&rdquo;</p>
                        </div>
                      )}

                      {voiceState === 'done' && (
                        <p className="text-[13px] text-green-700 font-medium text-center">
                          Fields pre-filled below. Review and edit if needed.
                        </p>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 2 — Symptoms */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-2">

                <div>
                  <p className="text-[13px] uppercase text-slate-500 font-medium ml-4 mb-2 tracking-wide">Primary Symptoms</p>
                  <div className="flex flex-wrap gap-2.5">
                    {SYMPTOMS.map(sym => {
                      const active = form.symptoms.includes(sym)
                      return (
                        <button
                          key={sym}
                          onClick={() => toggleSymptom(sym)}
                          className={cn(
                            "px-4 py-2.5 rounded-[14px] text-[15px] font-medium transition-all border",
                            active
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm active:scale-95"
                              : "bg-white border-slate-200 text-slate-700 active:scale-95 hover:border-slate-300"
                          )}
                        >
                          {sym}
                        </button>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {form.symptoms.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-teal-100 shadow-[0_4px_20px_rgba(45,212,191,0.1)]">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100">
                              <Activity className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-[15px] font-bold text-slate-900 leading-tight">AI Assessment</p>
                              <p className="text-[13px] text-slate-500 font-medium">Predicted priority</p>
                            </div>
                          </div>
                          <NeonBadge variant={triage.variant} dot pulse className="px-3 py-1">
                            {triage.level}
                          </NeonBadge>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <p className="text-[13px] uppercase text-slate-500 font-medium ml-4 mb-2 tracking-wide">Select Department</p>
                  <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-slate-100">
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        onClick={() => setForm(f => ({ ...f, department: dept }))}
                        className={cn(
                          "w-full px-4 py-3.5 flex items-center justify-between text-[17px] transition-colors active:scale-[0.98]",
                          form.department === dept ? "text-blue-600 font-semibold bg-blue-50/30" : "text-slate-900"
                        )}
                      >
                        {dept}
                        {form.department === dept && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] uppercase text-slate-500 font-medium ml-4 mb-2 tracking-wide">Old Reports (Optional)</p>
                  <button
                    onClick={() => setForm(f => ({ ...f, hasReports: !f.hasReports }))}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-4 rounded-[20px] transition-all active:scale-[0.98]",
                      form.hasReports
                        ? "bg-green-50 text-green-700"
                        : "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", form.hasReports ? "bg-green-100" : "bg-slate-100")}>
                        {form.hasReports ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Camera className="h-4 w-4 text-slate-500" />}
                      </div>
                      <span className="text-[17px] font-medium">{form.hasReports ? 'Reports Uploaded' : 'Scan physical reports'}</span>
                    </div>
                    {!form.hasReports && <ChevronRight className="h-5 w-5 text-slate-300" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-2">

                <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-slate-100">
                  <div className="px-5 py-4">
                    <p className="text-[13px] uppercase text-slate-500 font-medium tracking-wide mb-1">Patient</p>
                    <p className="text-[17px] text-slate-900 font-medium">{form.name}</p>
                    <p className="text-[15px] text-slate-500 mt-0.5">{form.age} years • {form.gender}</p>
                    <p className="text-[15px] text-slate-500 mt-0.5">{form.phone}</p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[13px] uppercase text-slate-500 font-medium tracking-wide mb-2">Symptoms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.symptoms.map(s => (
                        <span key={s} className="px-2.5 py-1 text-[13px] font-medium rounded-lg bg-slate-100 text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                    <div>
                      <p className="text-[13px] uppercase text-slate-500 font-medium tracking-wide mb-1">Visit Type</p>
                      <p className="text-[17px] text-slate-900 font-medium">{form.visitType}</p>
                    </div>
                    <NeonBadge variant={form.visitType === 'Emergency' ? 'danger' : form.visitType === 'Cashless' ? 'blue' : 'muted'}>
                      {form.visitType}
                    </NeonBadge>
                  </div>

                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] uppercase text-slate-500 font-medium tracking-wide mb-1">Department</p>
                      <p className="text-[17px] text-slate-900 font-medium">{form.department}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* AI Triage */}
                <div className={cn(
                  "flex items-center justify-between p-5 rounded-[20px]",
                  triage.variant === 'danger' ? 'bg-red-50' : triage.variant === 'warning' ? 'bg-amber-50' : triage.variant === 'orange' ? 'bg-orange-50' : 'bg-green-50'
                )}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={cn("h-6 w-6", triage.color)} />
                    <div>
                      <p className="text-[15px] font-bold text-slate-900">AI Priority Match</p>
                      <p className={cn("text-[13px] font-medium", triage.color)}>{triage.level} Priority</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-5 w-5 opacity-40", triage.color)} />
                </div>

                {/* Insurance detected */}
                {healthCard.number.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-teal-50 rounded-[20px]"
                  >
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-teal-900">Insurance Detected</p>
                      <p className="text-[13px] text-teal-700 font-medium truncate">{healthCard.insurer} · Pre-auth check will be initiated</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  </motion.div>
                )}

                {/* DISHA Family Tracking Consent */}
                <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <button
                    onClick={() => setDishaConsent(d => !d)}
                    className="w-full flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", dishaConsent ? "bg-blue-100" : "bg-slate-100")}>
                        <QrCode className={cn("h-4 w-4", dishaConsent ? "text-blue-600" : "text-slate-500")} />
                      </div>
                      <div className="text-left">
                        <p className="text-[15px] font-semibold text-slate-900">Share journey with family?</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">DISHA compliant · Non-clinical info only</p>
                      </div>
                    </div>
                    <div className={cn("h-6 w-11 rounded-full transition-colors", dishaConsent ? "bg-blue-500" : "bg-slate-200")}>
                      <div className={cn("h-6 w-6 rounded-full bg-white shadow transition-transform", dishaConsent ? "translate-x-5" : "translate-x-0")} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {dishaConsent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="px-5 py-4 flex items-center gap-3">
                          <Phone className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <input
                            className="w-full bg-transparent border-none text-slate-900 text-[17px] focus:outline-none placeholder:text-slate-400"
                            placeholder="Family member's phone"
                            type="tel"
                            inputMode="tel"
                            maxLength={10}
                            value={familyPhone}
                            onChange={e => setFamilyPhone(e.target.value)}
                          />
                        </div>
                        <p className="px-5 pb-4 text-[12px] text-slate-400">
                          They will receive a link to see ward, condition, and estimated wait — no diagnoses or test results.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Step 4 — Success */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ease: [0.16, 1, 0.3, 1] }}
                className="text-center pt-8 px-4"
              >
                <div className="inline-flex items-center justify-center mb-6 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                    className="h-[100px] w-[100px] rounded-full flex items-center justify-center bg-green-50 border-[8px] border-green-100"
                  >
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </motion.div>
                </div>

                <h2 className="text-5xl font-bold text-slate-900 mb-1 tracking-tight">#{tokenNumber}</h2>
                <p className="text-[17px] font-medium text-slate-500 mb-8">
                  Check-in Complete
                </p>

                <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden text-left mb-8">
                  <div className="p-5 border-b border-slate-100">
                    <p className="text-[13px] uppercase text-slate-500 font-medium tracking-wide mb-1">Queue Status</p>
                    <div className="flex items-center gap-2">
                      <div className="status-dot online pulse" style={{ background: triage.variant === 'danger' ? '#DC2626' : triage.variant === 'warning' ? '#D97706' : triage.variant === 'orange' ? '#EA580C' : '#16A34A' }} />
                      <p className={cn("text-[17px] font-semibold", triage.color)}>{triage.level} Priority</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[13px] uppercase text-slate-500 font-medium tracking-wide mb-1">Estimated Wait Time</p>
                    <p className="text-[28px] font-bold text-slate-900 tracking-tight">~{(tokenNumber ?? 1) * 4} <span className="text-lg text-slate-500 font-medium">mins</span></p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/patient/waiting')}
                  className="w-full h-14 rounded-2xl font-semibold text-[17px] text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] active:scale-[0.97]"
                >
                  View Live Queue
                </button>

                {familyToken && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      <p className="text-[15px] font-bold text-slate-900">Family Tracking Link</p>
                    </div>
                    <div className="flex justify-center mb-4">
                      <QRCodeSVG
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/family-track/${familyToken}`}
                        size={160}
                        level="M"
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-[12px] text-slate-400 text-center mb-4">
                      Scan to see ward, condition &amp; estimated wait. No medical data shared.
                    </p>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/family-track/${familyToken}`
                        if (navigator.share) {
                          navigator.share({ title: 'Patient Status', url })
                        } else {
                          navigator.clipboard.writeText(url)
                        }
                      }}
                      className="w-full h-12 rounded-xl font-semibold text-[15px] bg-slate-100 text-slate-700 flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                    >
                      <Share2 className="h-4 w-4" /> Share with Family
                    </button>
                  </motion.div>
                )}

                <button
                  onClick={() => router.push('/')}
                  className="w-full h-14 rounded-2xl font-semibold text-[17px] text-slate-500 mt-3 active:bg-slate-200/50 transition-colors"
                >
                  Return to Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Action Button (iOS Style) */}
        {step < 4 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] to-transparent z-10">
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "w-full h-14 rounded-2xl font-semibold text-[17px] flex items-center justify-center gap-2 transition-all active:scale-[0.97]",
                  canProceed()
                    ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "w-full h-14 rounded-2xl font-semibold text-[17px] flex items-center justify-center gap-2 transition-all active:scale-[0.97]",
                  submitting ? "bg-slate-200 text-slate-500" : "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]"
                )}
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 border-[3px] border-slate-400/30 border-t-slate-600 rounded-full"
                    />
                    Finalizing…
                  </>
                ) : (
                  'Confirm Check-In'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
