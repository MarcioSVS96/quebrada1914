import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const messages = await db.collection("contact_messages").find({}).sort({ created_at: -1 }).toArray()

    return NextResponse.json(messages)
  } catch (e) {
    console.error("Erro ao buscar mensagens:", e)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}