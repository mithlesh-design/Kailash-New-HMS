import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size?: "xs" | "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
  icon?: React.ElementType
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, icon: Icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm hover:shadow focus-visible:ring-[#2563EB]": variant === "default" || variant === "primary",
            "bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] focus-visible:ring-[#94A3B8]": variant === "secondary",
            "border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:text-[#0F172A] shadow-sm focus-visible:ring-[#CBD5E1]": variant === "outline",
            "hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] focus-visible:ring-[#94A3B8]": variant === "ghost",
            "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm focus-visible:ring-[#DC2626]": variant === "danger",
            "bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm focus-visible:ring-[#16A34A]": variant === "success",

            "h-7 px-2.5 text-xs rounded-md": size === "xs",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-xl px-5 text-sm": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : Icon ? (
          <Icon className="h-4 w-4 flex-shrink-0" />
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
export { Button }
