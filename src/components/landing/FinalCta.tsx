"use client"

import { ArrowRight, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"
import { Reveal } from "./Reveal"

const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" })

export function FinalCta() {
  const router = useRouter()
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] px-8 lg:px-16 py-14 lg:py-20 text-center"
            style={{ background: "linear-gradient(150deg,#0B1A36 0%,#16244A 55%,#0B1220 100%)" }}>
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.28), transparent)" }} />
            <div className="relative">
              <h2 className="text-[30px] lg:text-[44px] font-bold tracking-tight leading-[1.1]" style={{ color: "#FFFFFF" }}>
                Run your hospital on intelligence
              </h2>
              <p className="text-[15.5px] text-white/60 mt-4 max-w-xl mx-auto">
                Step into any role and experience the AI-native hospital operating system — clinical, operations, finance and support, unified.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => scrollTo("#launcher")}
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px] font-semibold text-[#0B1A36] bg-white hover:bg-white/90 transition-colors cursor-pointer">
                  Launch console <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => router.push("/checkin")}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl text-[15px] font-semibold text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-colors cursor-pointer">
                  <QrCode className="h-4 w-4" /> Patient Check-In
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
