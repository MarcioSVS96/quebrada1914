import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { name, email, password } = await request.json()

    if (!params.id) {
      return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 })
    }

    const updateData: {
      email?: string
      password?: string
      user_metadata?: { name?: string }
    } = {}

    if (email) updateData.email = email
    if (password) updateData.password = password
    if (name) updateData.user_metadata = { name }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(params.id, updateData)

    if (error) {
      console.error("Erro Supabase ao atualizar usuário:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const user = data.user

    return NextResponse.json({
      _id: user.id,
      id: user.id,
      name: (user.user_metadata as any)?.name ?? user.email?.split("@")[0] ?? "Usuário",
      email: user.email,
      created_at: user.created_at,
    })
  } catch (e) {
    console.error("Erro ao atualizar usuário:", e)
    return NextResponse.json({ error: "Erro interno ao atualizar usuário" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    if (!params.id) {
      return NextResponse.json({ error: "ID de usuário inválido" }, { status: 400 })
    }

    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(params.id)

    if (getUserError) {
      return NextResponse.json({ error: getUserError.message }, { status: 404 })
    }

    if (userData.user?.email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Não é permitido deletar o usuário administrador" }, { status: 403 })
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id)

    if (error) {
      console.error("Erro Supabase ao deletar usuário:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error("Erro ao deletar usuário:", e)
    return NextResponse.json({ error: "Erro interno ao deletar usuário" }, { status: 500 })
  }
}