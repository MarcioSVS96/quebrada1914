"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string | null
  stock: number
  featured: boolean
  created_at: string
}

interface Category {
  id: number
  name: string
  display_name: string
  icon: string
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories">("dashboard")
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const router = useRouter()
  const supabase = createClient()

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: categoriesData } = await supabase.from("categories").select("*").order("created_at")
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (categoriesData) setCategories(categoriesData)
      if (productsData) setProducts(productsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from("products").insert([newProduct]).select()

      if (error) throw error

      if (data) {
        setProducts([...data, ...products])
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
      const { data, error } = await supabase.from("products").update(newProduct).eq("id", editingProduct.id).select()

      if (error) throw error

      if (data) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? data[0] : p)))
        setEditingProduct(null)
        setNewProduct({ name: "", price: 0, category: "", description: "", image: "", stock: 0, featured: false })
        setShowProductForm(false)
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Erro ao atualizar produto")
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erro ao deletar produto")
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from("categories").insert([newCategory]).select()

      if (error) throw error

      if (data) {
        setCategories([...categories, ...data])
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
      const { data, error } = await supabase
        .from("categories")
        .update(newCategory)
        .eq("id", editingCategory.id)
        .select()

      if (error) throw error

      if (data) {
        setCategories(categories.map((c) => (c.id === editingCategory.id ? data[0] : c)))
        setEditingCategory(null)
        setNewCategory({ name: "", display_name: "", icon: "" })
        setShowCategoryForm(false)
      }
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Erro ao atualizar categoria")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Erro ao deletar categoria")
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
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
              <span className="text-sm text-gray-400">quebrada1914@outlook.com</span>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
                  Sistema completo de gerenciamento implementado! Você pode adicionar, editar e deletar produtos e
                  categorias. Todas as alterações são salvas no Supabase e refletidas na loja automaticamente.
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
    </div>
  )
}
