"use client"
import { AppShell } from "@/components/layout/AppShell"
import { CopilotLayout } from "@/components/features/CopilotLayout"
export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <AppShell><CopilotLayout role="billing">{children}</CopilotLayout></AppShell>
}
