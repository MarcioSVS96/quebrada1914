import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` estende o objeto `req` com o token do usuário.
  function middleware(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isAdminUser = req.nextauth.token?.email === process.env.ADMIN_EMAIL

    // Se a rota é de admin e o usuário não é o admin, redireciona para a página de não autorizado.
    if (isAdminRoute && !isAdminUser) {
      return NextResponse.rewrite(new URL("/auth/unauthorized", req.url))
    }
  },
  {
    callbacks: {
      // O middleware só será invocado se o token existir (usuário logado).
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  // Protege todas as rotas de administrador.
  matcher: ["/admin/:path*"],
};
