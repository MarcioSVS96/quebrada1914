"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Product, Category, CartItem } from "@/types"
import Header from "./header";
import Footer from "./footer";
import ProductsSection from "./products-section";
import AboutSection from "./about-section";
import ContactSection from "./contact-section";
import CartModal from "./cart-modal";
import NotificationContainer from "./notification-container";

export default function PublicStore() {
  const [currentPage, setCurrentPage] = useState("home")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Função para obter/criar um ID único para o carrinho do usuário anônimo
  const getCartId = (): string => {
    let cartId = localStorage.getItem("cartId")
    if (!cartId) {
      cartId = uuidv4()
      localStorage.setItem("cartId", cartId)
    }
    return cartId
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const categoriesRes = await fetch("/api/categories")
      const productsRes = await fetch("/api/products")

      const categoriesData = await categoriesRes.json()
      const productsData = await productsRes.json()

      // O MongoDB usa _id, vamos mapear para id para manter a consistência da UI
      const mapId = (item: any) => ({ ...item, id: item._id })

      if (categoriesData) setCategories(categoriesData.map(mapId))
      if (productsData) setProducts(productsData.map(mapId))

      // Carrega o carrinho do Redis via API
      const cartId = getCartId()
      const cartRes = await fetch(`/api/cart?cartId=${cartId}`)
      const cartData = await cartRes.json()
      if (cartData) {
        setCart(cartData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCartToDb = async (cartData: CartItem[]) => {
    try {
      const cartId = getCartId()
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, cart: cartData }),
      })
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  const addToCart = (productId: string) => {
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
    saveCartToDb(newCart)
  }

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.id !== productId)
    setCart(newCart)
    saveCartToDb(newCart)
  }

  const updateQuantity = (productId: string, change: number) => {
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
      saveCartToDb(newCart)
    }
  }

  const clearCart = () => {
    setCart([])
    saveCartToDb([])
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
