import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Listar tarefas (apenas admin) por dia
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const day = searchParams.get("day")
  if (!day) {
    return NextResponse.json({ error: 'O parâmetro "day" é obrigatório' }, { status: 400 })
  }

  try {
    // ⚠️ Sua coluna é createdAt (camelCase), não created_at
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("day", day)
      .order("createdAt", { ascending: false })

    if (error) {
      console.error("[api/tasks GET] supabase error:", error)
      return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
    }

    // Compatibilidade com UI antiga que espera _id
    const mapped = (data ?? []).map((t: any) => ({ ...t, _id: t.id }))
    return NextResponse.json(mapped)
  } catch (e) {
    console.error("[api/tasks GET] error:", e)
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
  }
}

// Criar uma nova tarefa (apenas admin)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { text, day } = await request.json()

    if (!text || !day) {
      return NextResponse.json({ error: "O texto e o dia da tarefa são obrigatórios" }, { status: 400 })
    }

    const newTask = {
      userId: session.user.id,
      text,
      day,
      completed: false,
      // ⚠️ Sua coluna é createdAt
      createdAt: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(newTask)
      .select("*")
      .single()

    if (error) {
      console.error("[api/tasks POST] supabase error:", error)
      return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
    }

    return NextResponse.json({ ...data, _id: data.id }, { status: 201 })
  } catch (e) {
    console.error("[api/tasks POST] error:", e)
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
  }
}
