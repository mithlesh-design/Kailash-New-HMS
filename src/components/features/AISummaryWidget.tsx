"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import type { Patient } from "@/store/usePatientStore"

const summary = (p: Patient) => `Patient presents with ${p.symptoms.join(' and ').toLowerCase()}. ${p.history.includes('No known drug allergies') ? 'No known allergies.' : `Medical background: ${p.history.join(', ')}.`} Vitals are ${p.vitals ? `BP ${p.vitals.bp}, Temp ${p.vitals.temp}, SpO2 ${p.vitals.spo2} — within normal limits.` : 'pending triage.'} Based on reported symptoms, consider evaluating for URTI or early-stage viral syndrome. Patient is flagged as ${p.history.length > 1 ? 'moderate-risk due to comorbidities' : 'low-risk'}.`

export function AISummaryWidget({ patient }: { patient: Patient }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const full = summary(patient)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      if (i < full.length) {
        setDisplayed(full.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(timer)
      }
    }, 14)
    return () => clearInterval(timer)
  }, [patient.id])

  return (
    <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-500 opacity-60" />
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-blue-700">AI Patient Summary</span>
        <AnimatePresence>
          {!done && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="ml-auto text-[10px] font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full"
            >
              Generating...
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">
        {displayed}
        {!done && <span className="ai-stream-cursor" />}
      </p>
    </div>
  )
}
