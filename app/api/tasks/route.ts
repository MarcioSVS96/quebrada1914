import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from '@/lib/mongodb'

// Listar tarefas do usuário logado
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  // Apenas o administrador pode ver as tarefas
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    
    const tasks = await db.collection('tasks').find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(tasks)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao buscar tarefas' }, { status: 500 })
  }
}

// Criar uma nova tarefa
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  // Apenas o administrador pode criar tarefas
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { text } = await request.json()
    if (!text) {
      return NextResponse.json({ error: 'O texto da tarefa é obrigatório' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const newTask = {
      
      userId: session.user.id,
      text,
      completed: false,
      createdAt: new Date(),
    }

    const result = await db.collection('tasks').insertOne(newTask)
    return NextResponse.json({ ...newTask, _id: result.insertedId }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 })
  }
}
