import { RoleGuard } from "@/components/layout/RoleGuard"

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="nurse">{children}</RoleGuard>
}
