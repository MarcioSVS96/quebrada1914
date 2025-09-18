import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const newMessage = {
      name,
      email,
      message,
      created_at: new Date(),
    }

    await db.collection('contact_messages').insertOne(newMessage)

    return NextResponse.json({ success: true, message: 'Mensagem recebida com sucesso!' }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 })
  }
}

