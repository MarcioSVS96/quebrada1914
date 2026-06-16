import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Atualizar uma tarefa (apenas admin)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { completed } = await request.json()

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update({ completed })
      .eq("id", params.id)
      .select("*")
      .single()

    if (error) {
      console.error("[api/tasks/[id] PUT] supabase error:", error)
      return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 })
    }

    return NextResponse.json({ ...data, _id: data.id })
  } catch (e) {
    console.error("[api/tasks/[id] PUT] error:", e)
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 })
  }
}

// Deletar uma tarefa (apenas admin)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", params.id)

    if (error) {
      console.error("[api/tasks/[id] DELETE] supabase error:", error)
      return NextResponse.json({ error: "Erro ao deletar tarefa" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error("[api/tasks/[id] DELETE] error:", e)
    return NextResponse.json({ error: "Erro ao deletar tarefa" }, { status: 500 })
  }
}
