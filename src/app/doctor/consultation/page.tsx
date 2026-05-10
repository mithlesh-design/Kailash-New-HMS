"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"

const ROLE_HOME: Record<string, string> = {
  doctor: '/doctor/dashboard',
  patient: '/patient/dashboard',
  reception: '/reception/dashboard',
  admin: '/admin/dashboard',
}

export default function DoctorConsultation() {
  // For now redirect to dashboard since consultation is embedded there
  const { activeRole } = useAuthStore()
  const router = useRouter()
  useEffect(() => { router.replace('/doctor/dashboard') }, [])
  return null
}
