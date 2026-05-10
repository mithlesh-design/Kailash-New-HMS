"use client"

import { usePatientStore } from "@/store/usePatientStore"
import { PatientCard } from "@/components/features/PatientCard"

export default function AdminOperations() {
  const { patients } = usePatientStore()
  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      <h2 className="text-lg font-bold">Real-time Operations Monitor</h2>
      <div className="grid grid-cols-2 gap-3">
        {patients.map((p, i) => <PatientCard key={p.id} patient={p} delay={i * 0.05} />)}
      </div>
    </div>
  )
}
