"use client"
import { AppShell } from "@/components/layout/AppShell"
import { CopilotLayout } from "@/components/features/CopilotLayout"
export default function DischargeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell><CopilotLayout role="discharge">{children}</CopilotLayout></AppShell>
}
