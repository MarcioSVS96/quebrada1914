import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { ObjectId } from "mongodb"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    if (!params.id) {
      return NextResponse.json({ error: "ID da mensagem é obrigatório" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection("contact_messages").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error("Erro ao deletar mensagem:", e)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

