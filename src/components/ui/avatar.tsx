"use client"

import { cn } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const colors = [
  "bg-blue-600 text-white",
  "bg-teal-500 text-white",
  "bg-purple-600 text-white",
  "bg-green-600 text-white",
  "bg-amber-500 text-white",
]

function getColor(name: string) {
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
  const sizeClass = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" }[size]
  return (
    <div className={cn("rounded-full flex items-center justify-center font-semibold flex-shrink-0", getColor(name), sizeClass, className)}>
      {initials}
    </div>
  )
}
