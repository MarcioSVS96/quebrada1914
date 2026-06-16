import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CartItem } from "@/types"

export async function GET(request: Request) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const cartId = searchParams.get("cartId")

  if (!cartId) {
    return NextResponse.json({ error: "Cart ID is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("carts")
    .select("items")
    .eq("id", cartId)
    .single()

  if (error || !data) return NextResponse.json([])

  return NextResponse.json((data.items as CartItem[]) || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const { cartId, cart } = (await request.json()) as {
      cartId: string
      cart: CartItem[]
    }

    if (!cartId || !cart) {
      return NextResponse.json(
        { error: "Cart ID and cart data are required" },
        { status: 400 }
      )
    }

    const { error } = await supabase.from("carts").upsert({
      id: cartId,
      items: cart,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return NextResponse.json({ error: "Error saving cart" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
}
