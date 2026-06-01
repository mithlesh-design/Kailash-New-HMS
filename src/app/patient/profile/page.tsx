"use client"

import { Droplet, AlertTriangle, HeartPulse, Phone, Pill, ShieldCheck, MapPin, Activity, UserCheck } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePatientStore } from "@/store/usePatientStore"
import { usePatientProfileStore } from "@/store/usePatientProfileStore"

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-5">
      <h3 className="text-[15px] font-bold text-slate-900 mb-3 flex items-center gap-2"><Icon className="h-4.5 w-4.5 text-slate-400" /> {title}</h3>
      {children}
    </div>
  )
}
const line = (xs: (string | undefined)[]) => xs.filter(Boolean).join(" · ")

export default function ProfilePage() {
  const currentUser = useAuthStore(s => s.currentUser)
  const id = currentUser?.role === "patient" ? currentUser.id : "PT-20394"
  const profile = usePatientProfileStore(s => s.profiles[id])
  const patient = usePatientStore(s => s.patients.find(p => p.id === id))
  const name = currentUser?.name ?? patient?.name ?? "Patient"
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2)

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-5">
      <div>
        <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">Profile &amp; Privacy</h1>
        <p className="text-[13px] text-slate-500 mt-1">Your details, medical info, family &amp; data consent</p>
      </div>

      {/* Identity */}
      <div className="rounded-3xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-[20px] font-bold">{initials}</div>
        <div className="flex-1">
          <p className="text-[18px] font-bold text-slate-900">{name}</p>
          <p className="text-[13px] text-slate-500">{line([id, patient ? `${patient.age}y` : undefined, patient?.gender, profile?.abhaId ? `ABHA: ${profile.abhaId}` : undefined])}</p>
        </div>
        {profile?.completedAt && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Verified by nursing</span>
        )}
      </div>

      {!profile?.completedAt ? (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-center">
          <Activity className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-[15px] font-bold text-amber-900">Your clinical profile isn&apos;t complete yet</p>
          <p className="text-[13px] text-amber-700 mt-1">The nursing team will complete it during your first vitals check. Only basic details were taken at registration to keep onboarding quick.</p>
        </div>
      ) : (
        <>
          {/* Medical info */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1"><Droplet className="h-4 w-4 text-red-500" /><span className="text-[11px] font-bold uppercase tracking-wide">Blood group</span></div>
              <p className="text-[18px] font-bold text-slate-900">{profile.bloodGroup ?? "—"}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1"><AlertTriangle className="h-4 w-4 text-amber-500" /><span className="text-[11px] font-bold uppercase tracking-wide">Allergies</span></div>
              <p className="text-[14px] font-semibold text-slate-900">{profile.noKnownAllergies ? "No known allergies" : (profile.allergies.join(", ") || "—")}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1"><HeartPulse className="h-4 w-4 text-pink-500" /><span className="text-[11px] font-bold uppercase tracking-wide">Conditions</span></div>
              <p className="text-[14px] font-semibold text-slate-900">{profile.chronicConditions.join(", ") || "—"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Card title="Current medications" icon={Pill}>
              {profile.currentMedications.length ? (
                <div className="flex flex-wrap gap-1.5">{profile.currentMedications.map(m => <span key={m} className="text-[12px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">{m}</span>)}</div>
              ) : <p className="text-[13px] text-slate-400">None recorded</p>}
            </Card>
            <Card title="Emergency contact" icon={Phone}>
              <p className="text-[14px] font-semibold text-slate-900">{profile.emergencyName ?? "—"} {profile.emergencyRelation ? <span className="text-slate-400 font-normal">· {profile.emergencyRelation}</span> : null}</p>
              <p className="text-[13px] text-slate-500">{profile.emergencyPhone ?? ""}</p>
            </Card>
            <Card title="Contact & address" icon={MapPin}>
              <p className="text-[14px] text-slate-700">{line([profile.address, profile.city, profile.pincode])}</p>
              <p className="text-[13px] text-slate-500 mt-1">{line([profile.preferredLanguage && `Language: ${profile.preferredLanguage}`, profile.occupation])}</p>
            </Card>
            <Card title="Lifestyle & measurements" icon={Activity}>
              <p className="text-[13px] text-slate-700">{line([profile.smoking && `Smoking: ${profile.smoking}`, profile.alcohol && `Alcohol: ${profile.alcohol}`, profile.pregnancy && profile.pregnancy !== "N/A" ? `Pregnancy: ${profile.pregnancy}` : undefined])}</p>
              <p className="text-[13px] text-slate-500 mt-1">{line([profile.heightCm ? `${profile.heightCm} cm` : undefined, profile.weightKg ? `${profile.weightKg} kg` : undefined])}</p>
            </Card>
          </div>

          {/* Consent */}
          <div className="rounded-3xl bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-5">
            <h3 className="text-[15px] font-bold text-slate-900 mb-3 flex items-center gap-2"><ShieldCheck className="h-4.5 w-4.5 text-blue-500" /> Data &amp; AI consent <span className="text-[11px] font-semibold text-slate-400">· DISHA</span></h3>
            <div className="space-y-2">
              {([
                ["consentRecords", "AI may read my records"],
                ["consentFamily", "Family live status tracking"],
                ["consentResearch", "Anonymised research use"],
              ] as const).map(([k, label]) => (
                <div key={k} className="flex items-center justify-between text-[14px]">
                  <span className="text-slate-700">{label}</span>
                  <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${profile[k] ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{profile[k] ? "Allowed" : "Off"}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
