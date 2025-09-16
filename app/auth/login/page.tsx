"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user?.email === "quebrada1914@outlook.com") {
        router.push("/admin")
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Check if email is the authorized one
    if (email !== "quebrada1914@outlook.com") {
      setError("Acesso negado! Apenas o administrador autorizado pode entrar.")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
        },
      })

      if (error) throw error

      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen concrete-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/90 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold graffiti-text tracking-wider text-white">QUEBRADA 1914</CardTitle>
            <CardDescription className="text-gray-300 font-medium">Acesso Administrativo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300 font-bold tracking-wide">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="quebrada1914@outlook.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border-gray-700 text-white focus:border-red-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300 font-bold tracking-wide">
                  SENHA
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-gray-700 text-white focus:border-red-500"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full btn-quebrada text-white font-bold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? "ENTRANDO..." : "ENTRAR NO SISTEMA"}
              </Button>
            </form>
            <div className="mt-6 p-4 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
              <p className="text-sm text-yellow-300 font-medium">
                <strong>Acesso Restrito:</strong> Apenas quebrada1914@outlook.com pode acessar o sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
