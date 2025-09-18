export interface Product {
  id: string // MongoDB ObjectId é uma string
  name: string
  price: number
  category: string
  description: string
  image: string | null
  stock: number
  featured: boolean
  created_at: string
}

export interface Category {
  id: string // MongoDB ObjectId é uma string
  name: string
  display_name: string
  icon: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export interface Task {
  id: string
  userId: string
  text: string
  completed: boolean
  createdAt: string
}
