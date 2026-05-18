import type { Metadata } from "next"
import { Figtree, Noto_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: "Kailash Healthcare HMS",
  description: "AI-Powered Hospital Management System — Kailash Healthcare",
  icons: { icon: "/kailash-Logo.ico" },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={`${figtree.variable} ${notoSans.variable}`}>
      <body suppressHydrationWarning className="font-body antialiased text-[#1E293B] bg-[#F8FAFC]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: 'var(--font-body, sans-serif)', fontSize: '14px' },
          }}
        />
      </body>
    </html>
  )
}
