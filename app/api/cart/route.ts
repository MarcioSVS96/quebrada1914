import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import type { CartItem } from '@/types'

// Tempo de vida do carrinho no Redis em segundos (30 dias)
const CART_TTL = 60 * 60 * 24 * 30

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cartId = searchParams.get('cartId')

  if (!cartId) {
    return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 })
  }

  try {
    const cart = await redis.get<CartItem[]>(`cart:${cartId}`)
    return NextResponse.json(cart || [])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error fetching cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { cartId, cart } = (await request.json()) as {
      cartId: string
      cart: CartItem[]
    }

    if (!cartId || !cart) {
      return NextResponse.json({ error: 'Cart ID and cart data are required' }, { status: 400 })
    }

    // Salva o carrinho no Redis com um tempo de expiração
    await redis.set(`cart:${cartId}`, JSON.stringify(cart), {
      ex: CART_TTL,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error saving cart' }, { status: 500 })
  }
}

