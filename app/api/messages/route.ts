import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro Supabase ao buscar mensagens:", error)
      return NextResponse.json([], { status: 200 })
    }

    const mapped = (data ?? []).map((message) => ({
      ...message,
      _id: message.id,
      id: message.id,
    }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error("Erro ao buscar mensagens:", e)
    return NextResponse.json([], { status: 200 })
  }
}