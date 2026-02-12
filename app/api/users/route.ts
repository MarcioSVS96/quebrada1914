import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Listar usuários (apenas admin)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
    }

    // Mantém compatibilidade com a UI (que antes esperava _id / Mongo)
    const mapped = (data?.users ?? []).map((u) => ({
      _id: u.id,
      id: u.id,
      name: (u.user_metadata as any)?.name ?? u.email?.split("@")[0] ?? "Usuário",
      email: u.email,
      created_at: u.created_at,
    }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error("Erro ao buscar usuários:", e)
    return NextResponse.json({ error: "Erro interno ao buscar usuários" }, { status: 500 })
  }
}

// Criar usuário (apenas admin)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // cria já verificado (igual você fazia no Mongo)
      user_metadata: { name },
    })

    if (error) {
      // Ex.: email já existe
      const msg = error.message?.toLowerCase().includes("already") ? "Este email já está em uso" : error.message
      return NextResponse.json({ error: msg }, { status: 409 })
    }

    const u = data.user
    if (!u) {
      return NextResponse.json({ error: "Falha ao criar usuário" }, { status: 500 })
    }

    return NextResponse.json(
      {
        _id: u.id,
        id: u.id,
        name,
        email: u.email,
        created_at: u.created_at,
      },
      { status: 201 },
    )
  } catch (e) {
    console.error("Erro ao criar usuário:", e)
    return NextResponse.json({ error: "Erro interno ao criar usuário" }, { status: 500 })
  }
}
