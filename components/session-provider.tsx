"use client"

import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

type Props = {
  children: React.ReactNode
  session?: Session | null
}

export default function NextAuthSessionProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}