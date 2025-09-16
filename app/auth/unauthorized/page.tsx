import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen concrete-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/90 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold graffiti-text tracking-wider text-white">QUEBRADA 1914</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl">🚫</div>
            <div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">ACESSO NEGADO</h2>
              <p className="text-gray-300 font-medium">Apenas o administrador autorizado pode acessar este sistema.</p>
            </div>
            <Link href="/auth/login">
              <Button className="btn-quebrada text-white font-bold tracking-wide">VOLTAR AO LOGIN</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
