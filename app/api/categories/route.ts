import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    // Leitura pública (respeita RLS)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
    }

    // Compatibilidade com UI que espera _id
    const mapped = (data ?? []).map((c) => ({ ...c, _id: c.id }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const body = await request.json()

    const newCategoryData = {
      name: body.name,
      display_name: body.display_name,
      icon: body.icon,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert(newCategoryData)
      .select("*")
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Error creating category" }, { status: 500 })
    }

    return NextResponse.json({ ...data, _id: data.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error creating category" }, { status: 500 })
  }
}
