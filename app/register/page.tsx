"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Falha ao registrar.")
      }

      // Redireciona para a página de login após o sucesso
      router.push("/login")
    } catch (registerError: unknown) {
      setError(registerError instanceof Error ? registerError.message : "Ocorreu um erro ao tentar registrar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen concrete-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/90 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold graffiti-text tracking-wider text-white">CRIAR CONTA</CardTitle>
            <CardDescription className="text-gray-300 font-medium">Junte-se à Quebrada 1914</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-300 font-bold tracking-wide">NOME</Label>
                <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="bg-black border-gray-700 text-white focus:border-red-500" />
              </div>
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
                {isLoading ? "CRIANDO..." : "CRIAR CONTA"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}