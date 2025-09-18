import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const usersCollection = db.collection('users')

    // Verifica se o usuário já existe
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 })
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      name,
      email,
      password: hashedPassword,
      emailVerified: null, // NextAuth usa isso
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json({ message: 'Usuário criado com sucesso', userId: result.insertedId }, { status: 201 })
  } catch (e) {
    console.error('Erro ao registrar usuário:', e)
    return NextResponse.json({ error: 'Erro interno ao registrar usuário' }, { status: 500 })
  }
}

