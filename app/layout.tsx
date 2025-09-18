import type { Metadata } from "next"
import { Inter } from "next/font/google"
import NextAuthSessionProvider from "@/components/session-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quebrada 1914 - Vista o que Representa",
  description: "Roupas com atitude, direto da periferia pro seu guarda-roupa",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
      </body>
    </html>
  )
}
