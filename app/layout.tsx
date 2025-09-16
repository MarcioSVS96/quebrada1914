import type React from "react"
import { Oswald } from "next/font/google"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-oswald",
})

export const metadata = {
  title: "Quebrada 1914 - Vista o que Representa",
  description: "Roupas com atitude, direto da periferia pro seu guarda-roupa",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} antialiased`}>
      <body className="font-oswald">{children}</body>
    </html>
  )
}
