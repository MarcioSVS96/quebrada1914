import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Atualizar uma tarefa (marcar como completa/incompleta)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  // Apenas o administrador pode modificar tarefas
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { completed } = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection('tasks').findOneAndUpdate(
      { _id: new ObjectId(params.id) }, // Admin pode editar qualquer tarefa
      { $set: { completed } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Tarefa não encontrada ou não autorizada' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 })
  }
}

// Deletar uma tarefa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  // Apenas o administrador pode deletar tarefas
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(params.id) // Admin pode deletar qualquer tarefa
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Tarefa não encontrada ou não autorizada' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao deletar tarefa' }, { status: 500 })
  }
}
