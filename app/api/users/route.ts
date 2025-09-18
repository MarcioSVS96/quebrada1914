import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

// Listar todos os usuários (apenas admin)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    // Exclui a senha do retorno
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray()
    return NextResponse.json(users)
  } catch (e) {
    console.error('Erro ao buscar usuários:', e)
    return NextResponse.json({ error: 'Erro interno ao buscar usuários' }, { status: 500 })
  }
}

// Criar um novo usuário (apenas admin)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const usersCollection = db.collection('users')

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      name,
      email,
      password: hashedPassword,
      emailVerified: new Date(), // Admin cria usuários já verificados
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
    return NextResponse.json({ ...newUser, _id: result.insertedId, password: "" }, { status: 201 })
  } catch (e) {
    console.error('Erro ao criar usuário:', e)
    return NextResponse.json({ error: 'Erro interno ao criar usuário' }, { status: 500 })
  }
}