"use client"

import { useState, useEffect } from "react"

import type { Product, Category } from "@/types"

interface ProductsSectionProps {
  products: Product[]
  categories: Category[]
  onAddToCart: (productId: string) => void
}

export default function ProductsSection({ products, categories, onAddToCart }: ProductsSectionProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [currentFilter, setCurrentFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name-asc")

  useEffect(() => {
    let filtered = [...products]

    // Filter by category
    if (currentFilter !== "all") {
      filtered = filtered.filter((p) => p.category === currentFilter)
    }

    // Filter by search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower),
      )
    }

    // Filter by price
    if (priceFilter !== "all") {
      const [min, max] = priceFilter
        .split("-")
        .map((p) => (p === "+" ? Number.POSITIVE_INFINITY : Number.parseFloat(p)))
      filtered = filtered.filter((p) => {
        if (max === undefined) return p.price >= min
        return p.price >= min && p.price <= max
      })
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, currentFilter, searchTerm, priceFilter, sortBy])

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName)
    return category ? category.icon : "📦"
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              NA ARQUIBANCADA
              <br />
              OU NA <span className="text-red-500">QUEBRADA</span>
              <br />
              VISTA O QUE REPRESENTA!
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 font-medium">
              Roupas com atitude, direto da periferia pro seu guarda-roupa
            </p>
            <button
              onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-quebrada text-white px-8 py-4 rounded-lg font-bold text-lg tracking-wide transition"
            >
              BORA VER AS PEÇAS
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-wide">
            LANÇA NO <span className="text-red-500">CARRINHO</span>
          </h3>

          {/* Filters */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="PROCURAR PRODUTOS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 font-bold tracking-wide"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
              </div>

              {/* Price Filter */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 font-bold tracking-wide"
              >
                <option value="all">TODOS OS PREÇOS</option>
                <option value="0-30">ATÉ R$ 30</option>
                <option value="30-60">R$ 30 - R$ 60</option>
                <option value="60-100">R$ 60 - R$ 100</option>
                <option value="100+">ACIMA DE R$ 100</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 font-bold tracking-wide"
              >
                <option value="name-asc">NOME A-Z</option>
                <option value="name-desc">NOME Z-A</option>
                <option value="price-asc">MENOR PREÇO</option>
                <option value="price-desc">MAIOR PREÇO</option>
                <option value="newest">MAIS NOVOS</option>
                <option value="oldest">MAIS ANTIGOS</option>
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900/50 rounded-lg p-2 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setCurrentFilter("all")}
                className={`px-4 py-2 rounded font-bold tracking-wide transition ${
                  currentFilter === "all" ? "bg-red-600 text-white" : "text-white hover:bg-gray-700"
                }`}
              >
                TODOS
              </button>
              {categories.map((category) => {
                const productCount = products.filter((p) => p.category === category.name).length
                return (
                  <button
                    key={category.id}
                    onClick={() => setCurrentFilter(category.name)}
                    className={`px-4 py-2 rounded font-bold tracking-wide transition ${
                      currentFilter === category.name ? "bg-red-600 text-white" : "text-white hover:bg-gray-700"
                    }`}
                  >
                    {category.icon} {category.display_name.toUpperCase()} ({productCount})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Products Stats */}
          <div className="text-center mb-8">
            <p className="text-gray-400 font-medium">
              Mostrando {filteredProducts.length} de {products.length} produtos
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-gray-400 text-xl font-bold tracking-wide">NENHUM PRODUTO ENCONTRADO, MANO!</p>
                <p className="text-gray-500 mt-2">Tenta mudar os filtros ou buscar por outra coisa</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 hover:border-red-500/50 transition relative"
                >
                  {product.featured && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold z-10">
                      DESTAQUE
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded font-bold z-10">
                      ESGOTADO
                    </div>
                  )}
                  <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent"></div>
                        <span className="text-4xl relative z-10">{getCategoryIcon(product.category)}</span>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-2 tracking-wide">{product.name}</h4>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-red-500">R$ {product.price.toFixed(2)}</span>
                        {product.stock < 999 && <div className="text-xs text-gray-400">Estoque: {product.stock}</div>}
                      </div>
                      <button
                        onClick={() => onAddToCart(product.id)}
                        disabled={product.stock === 0}
                        className={`btn-quebrada text-white px-4 py-2 rounded font-bold tracking-wide transition ${
                          product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {product.stock === 0 ? "ESGOTADO" : "LANÇA NO CARRINHO"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">
              COLA NO NOSSO <span className="text-red-500">INSTA</span>
            </h3>
            <p className="text-xl text-gray-300 font-medium">Acompanha as novidades, looks e o movimento da quebrada</p>
            <a
              href="https://instagram.com/quebrada1914"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 btn-quebrada text-white px-8 py-4 rounded-lg font-bold text-lg tracking-wide transition"
            >
              @QUEBRADA1914 📷
            </a>
          </div>

          {/* Instagram Feed Simulation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
              <span className="text-4xl relative z-10">👕</span>
              <div className="absolute bottom-2 left-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                Nova coleção chegando! 🔥
              </div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
              <span className="text-4xl relative z-10">⚽</span>
              <div className="absolute bottom-2 left-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                Domingo tem jogo! 🏟️
              </div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
              <span className="text-4xl relative z-10">🧥</span>
              <div className="absolute bottom-2 left-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                Moletom premium disponível!
              </div>
            </div>
            <div className="aspect-square bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition"></div>
              <span className="text-4xl relative z-10">🧢</span>
              <div className="absolute bottom-2 left-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition">
                Estilo que representa! ✊
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 font-medium">
              Marca a gente nas suas fotos usando <span className="text-red-500 font-bold">#Quebrada1914</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
