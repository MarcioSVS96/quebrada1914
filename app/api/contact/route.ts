import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name,
      email,
      message,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro Supabase ao salvar contato:", error)
      return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Mensagem recebida com sucesso!" }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 })
  }
}