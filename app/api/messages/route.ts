import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const messages = await db
      .collection('contact_messages')
      .find({})
      .sort({ created_at: -1 }) // Exibir as mais recentes primeiro
      .toArray()

    return NextResponse.json(messages)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 })
  }
}
