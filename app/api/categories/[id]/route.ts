import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const { id } = params
    const body = await request.json()

    // Garante que apenas os campos esperados sejam atualizados
    const categoryDataToUpdate = {
      name: body.name,
      display_name: body.display_name,
      icon: body.icon,
    }

    const result = await db
      .collection('categories')
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: categoryDataToUpdate }, { returnDocument: 'after' })

    if (!result) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const { id } = params

    const result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 })
  }
}
