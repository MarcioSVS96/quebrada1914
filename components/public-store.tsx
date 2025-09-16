"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Header from "./header"
import Footer from "./footer"
import ProductsSection from "./products-section"
import AboutSection from "./about-section"
import ContactSection from "./contact-section"
import CartModal from "./cart-modal"
import NotificationContainer from "./notification-container"

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

interface CartItem extends Product {
  quantity: number
}

export default function PublicStore() {
  const [currentPage, setCurrentPage] = useState("home")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadData()
    loadCartFromStorage()
  }, [])

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase.from("categories").select("*").order("created_at")

      // Load products
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

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem("quebrada_cart")
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    }
  }

  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem("quebrada_cart", JSON.stringify(cartData))
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  const addToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product || product.stock === 0) return

    const existingItem = cart.find((item) => item.id === productId)
    let newCart: CartItem[]

    if (existingItem) {
      if (existingItem.quantity >= product.stock && product.stock < 999) return
      newCart = cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }

    setCart(newCart)
    saveCartToStorage(newCart)
  }

  const removeFromCart = (productId: number) => {
    const newCart = cart.filter((item) => item.id !== productId)
    setCart(newCart)
    saveCartToStorage(newCart)
  }

  const updateQuantity = (productId: number, change: number) => {
    const item = cart.find((item) => item.id === productId)
    const product = products.find((p) => p.id === productId)

    if (!item || !product) return

    const newQuantity = item.quantity + change

    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else if (newQuantity > product.stock && product.stock < 999) {
      return
    } else {
      const newCart = cart.map((cartItem) =>
        cartItem.id === productId ? { ...cartItem, quantity: newQuantity } : cartItem,
      )
      setCart(newCart)
      saveCartToStorage(newCart)
    }
  }

  const clearCart = () => {
    setCart([])
    saveCartToStorage([])
  }

  const checkout = () => {
    if (cart.length === 0) return

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let message = `🔥 Salve! Quero fechar esses produtos da Quebrada 1914:\n\n`

    cart.forEach((item) => {
      message += `• ${item.name}\n`
      message += `  Quantidade: ${item.quantity}x\n`
      message += `  Preço unitário: R$ ${item.price.toFixed(2)}\n`
      message += `  Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`
    })

    message += `💰 TOTAL GERAL: R$ ${total.toFixed(2)}\n\n`
    message += `🚀 Bora fechar o bonde! Quebrada 1914 sempre representando! ✊`

    const whatsappUrl = `https://wa.me/5581997441023?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    clearCart()
    setIsCartOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen concrete-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔥</div>
          <p className="text-white text-xl font-bold tracking-wide">CARREGANDO A QUEBRADA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="concrete-bg text-white min-h-screen">
      <Header
        cart={cart}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
      />

      <main>
        {currentPage === "home" && (
          <ProductsSection products={products} categories={categories} onAddToCart={addToCart} />
        )}
        {currentPage === "about" && <AboutSection />}
        {currentPage === "contact" && <ContactSection />}
      </main>

      <Footer categories={categories} onPageChange={setCurrentPage} />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={checkout}
        categories={categories}
      />

      <NotificationContainer />
    </div>
  )
}
