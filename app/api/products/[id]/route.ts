import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Atualizar um produto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  // Verificação de segurança: apenas o admin pode atualizar
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    // Validação para garantir que o ID é um ObjectId válido
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 })
    }

    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Dados do produto a serem atualizados
    const productDataToUpdate = {
      name: body.name,
      price: body.price,
      category: body.category,
      description: body.description,
      image: body.image,
      stock: body.stock,
      featured: body.featured,
    }

    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(params.id) }, // <-- CORREÇÃO CRÍTICA AQUI
      { $set: productDataToUpdate },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('Erro ao atualizar produto:', e)
    return NextResponse.json({ error: 'Erro interno ao atualizar produto' }, { status: 500 })
  }
}

// Deletar um produto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  // Verificação de segurança: apenas o admin pode deletar
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(params.id), // <-- CORREÇÃO CRÍTICA AQUI
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (e) {
    console.error('Erro ao deletar produto:', e)
    return NextResponse.json({ error: 'Erro interno ao deletar produto' }, { status: 500 })
  }
}
