import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  const adminEmail = process.env.ADMIN_EMAIL

  if (adminEmail && token.email !== adminEmail) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/unauthorized"
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}