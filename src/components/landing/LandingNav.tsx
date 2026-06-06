"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Intelligence", href: "#intelligence" },
  { label: "Security", href: "#security" },
  { label: "Outcomes", href: "#outcomes" },
]

export function LandingNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })

  return (
    <header className={cn("sticky top-0 z-50 transition-all", scrolled ? "bg-white/85 backdrop-blur-md border-b border-[#EAECF2]" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto h-16 px-5 lg:px-10 flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 cursor-pointer">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-white border border-[#EAECF2]">
            <img src="/kailash-Logo.png" alt="Kailash Healthcare" className="h-7 w-7 object-contain" />
          </div>
          <div className="leading-none text-left">
            <p className="font-bold text-[15px] text-[#101828] tracking-tight">Kailash HMS</p>
            <p className="text-[11px] font-medium text-[#667085] mt-0.5">Hospital Operating System</p>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {LINKS.map(l => (
            <button key={l.href} onClick={() => scrollTo(l.href)}
              className="px-3 py-2 rounded-lg text-[13.5px] font-semibold text-[#475467] hover:text-[#101828] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/checkin")}
            className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold text-[#344054] bg-white border border-[#EAECF2] hover:border-[#D0D5DD] transition-colors cursor-pointer">
            <QrCode className="h-4 w-4 text-[#1E3A8A]" /> Patient Check-In
          </button>
          <button onClick={() => scrollTo("#launcher")}
            className="inline-flex items-center h-9 px-4 rounded-full text-[13px] font-semibold text-white bg-[#1E3A8A] hover:bg-[#172E6E] transition-colors cursor-pointer">
            Launch console
          </button>
        </div>
      </div>
    </header>
  )
}
