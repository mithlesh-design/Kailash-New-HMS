"use client"
import { AppShell } from "@/components/layout/AppShell"
import { CopilotLayout } from "@/components/features/CopilotLayout"
export default function QualityLayout({ children }: { children: React.ReactNode }) {
  return <AppShell><CopilotLayout role="quality">{children}</CopilotLayout></AppShell>
}
