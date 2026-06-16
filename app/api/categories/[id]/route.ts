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
    const { id } = params
    if (!id) return NextResponse.json({ error: "ID de categoria inválido" }, { status: 400 })

    const body = await request.json()

    const categoryDataToUpdate = {
      name: body.name,
      display_name: body.display_name,
      icon: body.icon,
    }

    const { data, error } = await supabaseAdmin
      .from("categories")
      .update(categoryDataToUpdate)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Error updating category" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ ...data, _id: data.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error updating category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: "ID de categoria inválido" }, { status: 400 })

    const { error } = await supabaseAdmin.from("categories").delete().eq("id", id)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Error deleting category" }, { status: 500 })
    }

    return NextResponse.json({ message: "Category deleted" }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error deleting category" }, { status: 500 })
  }
}
