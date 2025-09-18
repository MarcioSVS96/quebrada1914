"use client"

import type React from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function UserLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Credenciais inválidas. Verifique seu email e senha.")
        return
      }

      if (result?.ok) {
        // Redireciona para a página inicial após o login
        router.push("/")
      }
    } catch (loginError: unknown) {
      setError(loginError instanceof Error ? loginError.message : "Ocorreu um erro ao tentar fazer login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen concrete-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/90 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold graffiti-text tracking-wider text-white">LOGIN</CardTitle>
            <CardDescription className="text-gray-300 font-medium">Acesse sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300 font-bold tracking-wide">EMAIL</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black border-gray-700 text-white focus:border-red-500" />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300 font-bold tracking-wide">SENHA</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black border-gray-700 text-white focus:border-red-500" />
              </div>
              {error && (
                <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full btn-quebrada text-white font-bold tracking-wide" disabled={isLoading}>
                {isLoading ? "ENTRANDO..." : "ENTRAR"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Não tem uma conta?{" "}
                <Link href="/register" className="font-bold text-red-500 hover:underline">Crie uma agora</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

