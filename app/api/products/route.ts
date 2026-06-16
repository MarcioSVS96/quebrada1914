import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Schema de validação com Zod (igual ao seu)
const productSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  price: z.number().positive({ message: "O preço deve ser um número positivo" }),
  category: z.string().min(1, { message: "A categoria é obrigatória" }),
  description: z.string().optional(),
  image: z.string().url({ message: "A imagem deve ser uma URL válida" }).optional(),
  stock: z.number().int().min(0, { message: "O estoque não pode ser negativo" }),
  featured: z.boolean().default(false),
})

export async function GET() {
  try {
    // Leitura pública: usa ANON (respeita RLS)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
    }

    // Para manter compatibilidade com o front/admin que espera _id:
    const mapped = (data ?? []).map((p) => ({ ...p, _id: p.id }))

    return NextResponse.json(mapped)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Criação: ADMIN (service role), porque é via painel
    const payload = {
      ...validation.data,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(payload)
      .select("*")
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Error creating product" }, { status: 500 })
    }

    return NextResponse.json({ ...data, _id: data.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}
