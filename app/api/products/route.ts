import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { z } from 'zod'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const products = await db
      .collection('products')
      .find({})
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json(products)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 })
  }
}

// Schema de validação com Zod
const productSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  price: z.number().positive({ message: 'O preço deve ser um número positivo' }),
  category: z.string().min(1, { message: 'A categoria é obrigatória' }),
  description: z.string().optional(),
  image: z.string().url({ message: 'A imagem deve ser uma URL válida' }).optional(),
  stock: z.number().int().min(0, { message: 'O estoque não pode ser negativo' }),
  featured: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = productSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: validation.error.flatten().fieldErrors }, { status: 400 })
    }

    // Use the validated data from Zod to ensure type safety and include defaults.
    const newProductData = {
      ...validation.data,
      created_at: new Date().toISOString(),
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection('products').insertOne(newProductData)
    const insertedProduct = await db.collection('products').findOne({ _id: result.insertedId })

    return NextResponse.json(insertedProduct, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 })
  }
}
