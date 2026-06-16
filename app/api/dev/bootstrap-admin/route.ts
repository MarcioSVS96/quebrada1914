import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST() {
  try {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const name = "Administrador"

    if (!email || !password) {
      return NextResponse.json({ error: "Missing ADMIN envs" }, { status: 500 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Verifica se já existe
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (existingUser) {
      // RESET senha
      const { error } = await supabaseAdmin
        .from("users")
        .update({
          password: hashedPassword,
          name,
        })
        .eq("email", email)

      if (error) throw error

      return NextResponse.json({ message: "Admin resetado com sucesso" })
    }

    // CRIA admin
    const { error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
      })

    if (error) throw error

    return NextResponse.json({ message: "Admin criado com sucesso" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro bootstrap admin" }, { status: 500 })
  }
}
