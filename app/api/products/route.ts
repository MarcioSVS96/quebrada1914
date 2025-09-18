import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

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

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const body = await request.json()

    // Garante que apenas os campos esperados sejam inseridos
    const newProductData = {
      name: body.name,
      price: body.price,
      category: body.category,
      description: body.description,
      image: body.image,
      stock: body.stock,
      featured: body.featured,
      created_at: new Date().toISOString(),
    }

    const result = await db.collection('products').insertOne(newProductData)
    const insertedProduct = await db.collection('products').findOne({ _id: result.insertedId })

    return NextResponse.json(insertedProduct, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error creating product' }, { status: 500 })
  }
}
