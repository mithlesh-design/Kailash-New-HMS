"use client"

import { useEffect } from "react"
import { useMessagingStore } from "@/store/useMessagingStore"
import { useNotificationStore } from "@/store/useNotificationStore"
import { useInpatientStore } from "@/store/useInpatientStore"
import { useDoctorProfileStore } from "@/store/useDoctorProfileStore"
import { useNursingStore } from "@/store/useNursingStore"
import { usePatientProfileStore } from "@/store/usePatientProfileStore"
import { useShiftStore } from "@/store/useShiftStore"
import { useHRStore } from "@/store/useHRStore"
import { useVendorStore } from "@/store/useVendorStore"
import { useStatutoryStore } from "@/store/useStatutoryStore"

// Persisted stores use `skipHydration: true` so the server and the first client
// render both start from the seed (identical markup → no hydration mismatch).
// We rehydrate from localStorage only after mount, which is a normal post-mount
// state update.
export function StoreHydrator() {
  useEffect(() => {
    useMessagingStore.persist.rehydrate()
    useNotificationStore.persist.rehydrate()
    useInpatientStore.persist.rehydrate()
    useDoctorProfileStore.persist.rehydrate()
    useNursingStore.persist.rehydrate()
    usePatientProfileStore.persist.rehydrate()
    useShiftStore.persist.rehydrate()
    useHRStore.persist.rehydrate()
    useVendorStore.persist.rehydrate()
    useStatutoryStore.persist.rehydrate()
  }, [])
  return null
}
