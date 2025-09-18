"use client"

import type React from "react"
import { useState, useEffect } from "react";
import type { Product, Category, ContactMessage, Task, User } from "@/types";
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState("")
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "users" | "messages" | "tasks">("dashboard")
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    category: "",
    description: "",
    image: "",
    stock: 0,
    featured: false,
  })

  const [newCategory, setNewCategory] = useState({
    name: "",
    display_name: "",
    icon: "",
  })

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "tasks") {
      const dateString = selectedDate.toISOString().split("T")[0]
      fetchTasks(dateString)
    }
  }, [activeTab, selectedDate])

  const loadData = async () => {
    try {
      // O MongoDB usa _id, vamos mapear para id para manter a consistência da UI
      const mapId = (item: any) => ({ ...item, id: item._id.toString() })

      const [categoriesRes, productsRes, messagesRes, usersRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products"),
        fetch("/api/messages"),
        fetch("/api/users"),
      ])

      const [categoriesData, productsData, messagesData, usersData] = await Promise.all([
        categoriesRes.json(),
        productsRes.json(),
        messagesRes.json(),
        usersRes.json(),
      ])

      if (categoriesData) setCategories(categoriesData.map(mapId))
      if (productsData) setProducts(productsData.map(mapId))
      if (messagesData) setMessages(messagesData.map(mapId))
      if (usersData) setUsers(usersData.map(mapId))
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTasks = async (day: string) => {
    try {
      const res = await fetch(`/api/tasks?day=${day}`)
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const tasksData = await res.json()
      const mapId = (item: any) => ({ ...item, id: item._id })
      setTasks(tasksData.map(mapId))
    } catch (error) {
      console.error("Error loading tasks:", error)
      setTasks([]) // Limpa as tarefas em caso de erro
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      if (!res.ok) throw new Error("Failed to add product")

      const data = await res.json()
      if (data) {
        setProducts([{ ...data, id: data._id }, ...products])
        setNewProduct({ name: "", price: 0, category: "", description: "", image: "", stock: 0, featured: false })
        setShowProductForm(false)
      }
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Erro ao adicionar produto")
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      if (!res.ok) throw new Error("Failed to update product")

      const data = await res.json()
      if (data) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? { ...data, id: data._id.toString() } : p)))
        setEditingProduct(null)
        setNewProduct({ name: "", price: 0, category: "", description: "", image: "", stock: 0, featured: false })
        setShowProductForm(false)
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Erro ao atualizar produto")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete product")

      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erro ao deletar produto")
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (!res.ok) throw new Error("Failed to add category")

      const data = await res.json()
      if (data) {
        setCategories([...categories, { ...data, id: data._id }])
        setNewCategory({ name: "", display_name: "", icon: "" })
        setShowCategoryForm(false)
      }
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Erro ao adicionar categoria")
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      if (!res.ok) throw new Error("Failed to update category")

      const data = await res.json()
      if (data) {
        setCategories(categories.map((c) => (c.id === editingCategory.id ? { ...data, id: data._id } : c)))
        setEditingCategory(null)
        setNewCategory({ name: "", display_name: "", icon: "" })
        setShowCategoryForm(false)
      }
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Erro ao atualizar categoria")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete category")

      setCategories(categories.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Erro ao deletar categoria")
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.")) return

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete message")

      setMessages(messages.filter((m) => m.id !== id))
      alert("Mensagem deletada com sucesso.")
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Erro ao deletar mensagem")
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return

    try {
      const dateString = selectedDate.toISOString().split("T")[0]
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTaskText, day: dateString }),
      })
      if (!res.ok) throw new Error("Failed to add task")
      setNewTaskText("")
      fetchTasks(dateString) // Recarrega as tarefas do dia
    } catch (error) {
      console.error("Error adding task:", error)
      alert("Erro ao adicionar tarefa")
    }
  }

  const handleToggleTask = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      })
      if (!res.ok) throw new Error("Failed to update task")
      const updatedTask = await res.json()
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)),
      )
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Erro ao atualizar tarefa")
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete task")
      const dateString = selectedDate.toISOString().split("T")[0]
      fetchTasks(dateString) // Recarrega as tarefas do dia
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Erro ao deletar tarefa")
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add user")
      }

      const data = await res.json()
      if (data) {
        setUsers([{ ...data, id: data._id.toString() }, ...users])
        setNewUser({ name: "", email: "", password: "" })
        setShowUserForm(false)
      }
    } catch (error) {
      console.error("Error adding user:", error)
      alert(`Erro ao adicionar usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser), // A senha é opcional aqui
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update user")
      }

      const data = await res.json()
      if (data) {
        setUsers(users.map((u) => (u.id === editingUser.id ? { ...data, id: data._id.toString() } : u)))
        setEditingUser(null)
        setNewUser({ name: "", email: "", password: "" })
        setShowUserForm(false)
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert(`Erro ao atualizar usuário: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" })
      setUsers(users.filter((u) => u.id !== id))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Erro ao deletar usuário")
    }
  }

  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image || "",
      stock: product.stock,
      featured: product.featured,
    })
    setShowProductForm(true)
  }

  const startEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      display_name: category.display_name,
      icon: category.icon,
    })
    setShowCategoryForm(true)
  }

  const startEditUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: "", // Deixar a senha em branco para não forçar a alteração
    })
    setShowUserForm(true)
  }


  const handleSignOut = async () => {
    await signOut() // O NextAuth irá redirecionar para a página inicial ("/") conforme configurado.
  }

  if (isLoading) {
    return (
      <div className="min-h-screen concrete-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-white text-xl font-bold tracking-wide">CARREGANDO PAINEL ADMIN...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="concrete-bg text-white min-h-screen">
      <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold graffiti-text tracking-wider">QUEBRADA 1914 - ADMIN</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{session?.user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
              >
                SAIR
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "DASHBOARD", icon: "📊" },
              { id: "products", label: "PRODUTOS", icon: "👕" },
              { id: "categories", label: "CATEGORIAS", icon: "📁" },
              { id: "users", label: "USUÁRIOS", icon: "👥" },
              { id: "messages", label: "MENSAGENS", icon: "💬" },
              { id: "tasks", label: "TAREFAS", icon: "✅" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-4 font-bold tracking-wide transition ${
                  activeTab === tab.id ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">
                <div className="text-3xl font-bold text-red-500">{products.length}</div>
                <div className="text-gray-400 font-bold tracking-wide text-sm">PRODUTOS</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">
                <div className="text-3xl font-bold text-green-500">{categories.length}</div>
                <div className="text-gray-400 font-bold tracking-wide text-sm">CATEGORIAS</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">
                <div className="text-3xl font-bold text-blue-500">{products.filter((p) => p.featured).length}</div>
                <div className="text-gray-400 font-bold tracking-wide text-sm">DESTAQUES</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">
                <div className="text-3xl font-bold text-cyan-500">{users.length}</div>
                <div className="text-gray-400 font-bold tracking-wide text-sm">USUÁRIOS</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">
                <div className="text-3xl font-bold text-yellow-500">{messages.length}</div>
                <div className="text-gray-400 font-bold tracking-wide text-sm">MENSAGENS</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-gray-800">
                <div className="text-3xl font-bold text-purple-500">
                  R${" "}
                  {products.length > 0
                    ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
                    : "0"}
                </div>
                <div className="text-gray-400 font-bold tracking-wide text-sm">PREÇO MÉDIO</div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
              <h2 className="text-3xl font-bold mb-6 tracking-wide">PAINEL ADMINISTRATIVO</h2>
              <p className="text-gray-300 mb-6">
                Bem-vindo ao painel administrativo da Quebrada 1914! Aqui você pode gerenciar produtos, categorias e
                acompanhar as estatísticas da loja.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 tracking-wide">PRODUTOS RECENTES</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="bg-black/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{product.name}</h4>
                            <p className="text-sm text-gray-400">
                              R$ {product.price.toFixed(2)} - {product.category}
                            </p>
                          </div>
                          {product.featured && (
                            <span className="bg-yellow-600 px-2 py-1 rounded text-xs font-bold">DESTAQUE</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 tracking-wide">CATEGORIAS</h3>
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const productCount = products.filter((p) => p.category === category.name).length
                      return (
                        <div key={category.id} className="bg-black/50 p-4 rounded-lg border border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{category.icon}</span>
                              <span className="font-bold">{category.display_name}</span>
                            </div>
                            <span className="text-sm text-gray-400">{productCount} produtos</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-600/10 border border-green-600/30 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-green-400">CMS COMPLETO FUNCIONANDO</h3>
                <p className="text-gray-300">
                  Sistema completo de gerenciamento implementado! Você pode adicionar, editar e deletar produtos,
                  categorias e visualizar mensagens. Todas as alterações são salvas no MongoDB e refletidas na loja.
                </p>
              </div>
            </div>
          </>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold tracking-wide">GERENCIAR PRODUTOS</h2>
              <button
                onClick={() => {
                  setEditingProduct(null)
                  setNewProduct({
                    name: "",
                    price: 0,
                    category: "",
                    description: "",
                    image: "",
                    stock: 0,
                    featured: false,
                  })
                  setShowProductForm(true)
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                + ADICIONAR PRODUTO
              </button>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        {product.featured && (
                          <span className="bg-yellow-600 px-2 py-1 rounded text-xs font-bold">DESTAQUE</span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-2">{product.description}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        <span>
                          Preço: <strong className="text-green-400">R$ {product.price.toFixed(2)}</strong>
                        </span>
                        <span>
                          Categoria: <strong>{product.category}</strong>
                        </span>
                        <span>
                          Estoque: <strong>{product.stock}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditProduct(product)}
                        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
                      >
                        DELETAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold tracking-wide">GERENCIAR CATEGORIAS</h2>
              <button
                onClick={() => {
                  setEditingCategory(null)
                  setNewCategory({ name: "", display_name: "", icon: "" })
                  setShowCategoryForm(true)
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                + ADICIONAR CATEGORIA
              </button>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => {
                const productCount = products.filter((p) => p.category === category.name).length
                return (
                  <div key={category.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold">{category.display_name}</h3>
                          <p className="text-gray-400">Nome interno: {category.name}</p>
                          <p className="text-sm text-gray-500">{productCount} produtos nesta categoria</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
                        >
                          EDITAR
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
                        >
                          DELETAR
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold tracking-wide">GERENCIAR USUÁRIOS</h2>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setNewUser({ name: "", email: "", password: "" })
                  setShowUserForm(true)
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                + ADICIONAR USUÁRIO
              </button>
            </div>

            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-700 rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{user.name}</h3>
                        <p className="text-gray-400">{user.email}</p>
                        {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                          <span className="text-xs font-bold text-red-500">ADMIN</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditUser(user)}
                        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition disabled:bg-gray-500"
                        disabled={user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL}
                      >
                        DELETAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-wide">MENSAGENS DE CONTATO</h2>
            {messages.length === 0 ? (
              <div className="bg-gray-900/50 rounded-lg p-8 text-center border border-gray-800">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-400">Nenhuma mensagem recebida ainda.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {messages.map((message) => (
                  <div key={message.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-xl font-bold">{message.name}</h3>
                          <a href={`mailto:${message.email}`} className="text-sm text-red-400 hover:underline">
                            {message.email}
                          </a>
                        </div>
                        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{message.message}</p>
                        <p className="text-xs text-gray-500">
                          Recebido em: {new Date(message.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
                      >
                        DELETAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-wide">GERENCIAR TAREFAS</h2>

            <div className="flex items-center justify-center gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-2 rounded-full bg-gray-800 text-white hover:bg-red-600 transition-colors"
                aria-label="Semana anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex justify-center gap-2">
              {[
                { key: "segunda", name: "Segunda" },
                { key: "terca", name: "Terça" },
                { key: "quarta", name: "Quarta" },
                { key: "quinta", name: "Quinta" },
                { key: "sexta", name: "Sexta" },
                { key: "sabado", name: "Sábado" },
                { key: "domingo", name: "Domingo" },
              ].map((day, index) => {
                const today = new Date();
                today.setDate(today.getDate() + weekOffset * 7);
                const currentDayOfWeek = today.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
                const dayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1
                const date = new Date(today)
                date.setDate(today.getDate() - dayIndex + index)

                const isSelected = selectedDate.toDateString() === date.toDateString();

                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg font-bold transition-colors text-sm ${
                      isSelected
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{day.name}</span>
                    <span className="text-3xl font-black">{String(date.getDate()).padStart(2, "0")}</span>
                    <span className="text-xs font-light text-gray-500 capitalize">{date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                  </button>
                )
              })}
            </div>

              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-2 rounded-full bg-gray-800 text-white hover:bg-red-600 transition-colors"
                aria-label="Próxima semana"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-4 mb-6 bg-gray-900/50 p-6 rounded-lg border border-gray-800">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="O que precisa ser feito?"
                className="flex-grow bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">
                ADICIONAR TAREFA
              </button>
            </form>

            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <ul className="space-y-3">
                {tasks.sort((a, b) => Number(a.completed) - Number(b.completed)).map((task) => (
                  <li key={task.id} className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        className="h-6 w-6 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500 cursor-pointer"
                      />
                      <span
                        className={`text-lg ${
                          task.completed ? "line-through text-gray-500" : "text-white"
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700 transition text-xs"
                    >
                      DELETAR
                    </button>
                  </li>
                ))}
              </ul>
              {tasks.length === 0 && <p className="text-gray-400 text-center py-4">Nenhuma tarefa encontrada.</p>}
            </div>
          </div>
        )}
      </main>

      {showProductForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">{editingProduct ? "EDITAR PRODUTO" : "ADICIONAR PRODUTO"}</h3>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">NOME</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">PREÇO</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">ESTOQUE</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) || 0 })}
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">CATEGORIA</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.display_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">DESCRIÇÃO</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">URL DA IMAGEM</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-bold">
                  PRODUTO EM DESTAQUE
                </label>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition"
                >
                  {editingProduct ? "ATUALIZAR" : "ADICIONAR"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductForm(false)
                    setEditingProduct(null)
                    setNewProduct({
                      name: "",
                      price: 0,
                      category: "",
                      description: "",
                      image: "",
                      stock: 0,
                      featured: false,
                    })
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded font-bold hover:bg-gray-700 transition"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">{editingCategory ? "EDITAR CATEGORIA" : "ADICIONAR CATEGORIA"}</h3>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">NOME INTERNO</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  placeholder="camisetas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">NOME DE EXIBIÇÃO</label>
                <input
                  type="text"
                  value={newCategory.display_name}
                  onChange={(e) => setNewCategory({ ...newCategory, display_name: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  placeholder="Camisetas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">ÍCONE (EMOJI)</label>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  placeholder="👕"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition"
                >
                  {editingCategory ? "ATUALIZAR" : "ADICIONAR"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                    setNewCategory({ name: "", display_name: "", icon: "" })
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded font-bold hover:bg-gray-700 transition"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6">{editingUser ? "EDITAR USUÁRIO" : "ADICIONAR USUÁRIO"}</h3>
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">NOME</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">EMAIL</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">SENHA</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                  placeholder={editingUser ? "Deixe em branco para não alterar" : ""}
                  required={!editingUser}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 transition"
                >
                  {editingUser ? "ATUALIZAR" : "ADICIONAR"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false)
                    setEditingUser(null)
                    setNewUser({ name: "", email: "", password: "" })
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded font-bold hover:bg-gray-700 transition"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
