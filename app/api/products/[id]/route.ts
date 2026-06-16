import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Atualizar um produto (apenas admin)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })

    const body = await request.json()

    const productDataToUpdate = {
      name: body.name,
      price: body.price,
      category: body.category,
      description: body.description,
      image: body.image,
      stock: body.stock,
      featured: body.featured,
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(productDataToUpdate)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Erro ao atualizar produto:", error)
      return NextResponse.json({ error: "Erro interno ao atualizar produto" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ ...data, _id: data.id })
  } catch (e) {
    console.error("Erro ao atualizar produto:", e)
    return NextResponse.json({ error: "Erro interno ao atualizar produto" }, { status: 500 })
  }
}

// Deletar um produto (apenas admin)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: "ID de produto inválido" }, { status: 400 })

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id)

    if (error) {
      console.error("Erro ao deletar produto:", error)
      return NextResponse.json({ error: "Erro interno ao deletar produto" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error("Erro ao deletar produto:", e)
    return NextResponse.json({ error: "Erro interno ao deletar produto" }, { status: 500 })
  }
}
