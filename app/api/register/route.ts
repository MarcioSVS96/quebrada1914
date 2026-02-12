import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // cria usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      // exemplo: "User already registered"
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // se criou usuário, salva o nome no profiles
    const userId = data.user?.id
    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: userId, name })

      if (profileError) {
        // não quebra cadastro se profile falhar
        console.error("Erro ao salvar profile:", profileError)
      }
    }

    return NextResponse.json({ message: "Usuário criado com sucesso" }, { status: 201 })
  } catch (e) {
    console.error("Erro ao registrar usuário:", e)
    return NextResponse.json({ error: "Erro interno ao registrar usuário" }, { status: 500 })
  }
}
