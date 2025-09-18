import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

// Atualizar um usuário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, password } = body

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const updateData: any = { name, email, updatedAt: new Date() }

    // Se uma nova senha for fornecida, criptografa e adiciona ao update
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    )

    if (!result) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('Erro ao atualizar usuário:', e)
    return NextResponse.json({ error: 'Erro interno ao atualizar usuário' }, { status: 500 })
  }
}

// Deletar um usuário
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  // Proteção para não deletar o próprio admin
  const adminUser = await clientPromise.then(client => client.db(process.env.MONGODB_DB).collection('users').findOne({ _id: new ObjectId(params.id) }))
  if (adminUser?.email === process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não é permitido deletar o usuário administrador' }, { status: 403 })
  }

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error('Erro ao deletar usuário:', e)
    return NextResponse.json({ error: 'Erro interno ao deletar usuário' }, { status: 500 })
  }
}