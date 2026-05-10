import { RoleGuard } from "@/components/layout/RoleGuard"

export default function InsuranceLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="insurance">{children}</RoleGuard>
}
