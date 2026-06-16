import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    if (!params.id) {
      return NextResponse.json({ error: "ID da mensagem é obrigatório" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("contact_messages")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Erro Supabase ao deletar mensagem:", error)
      return NextResponse.json({ error: "Erro ao deletar mensagem" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error("Erro ao deletar mensagem:", e)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}