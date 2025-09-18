import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const categories = await db
      .collection('categories')
      .find({})
      .sort({ created_at: 1 }) // Ordenar por data de criação
      .toArray()

    return NextResponse.json(categories)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const body = await request.json()

    // Garante que apenas os campos esperados sejam inseridos
    const newCategoryData = {
      name: body.name,
      display_name: body.display_name,
      icon: body.icon,
      created_at: new Date().toISOString(),
    }

    const result = await db.collection('categories').insertOne(newCategoryData)
    const insertedCategory = await db.collection('categories').findOne({ _id: result.insertedId })

    return NextResponse.json(insertedCategory, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 })
  }
}