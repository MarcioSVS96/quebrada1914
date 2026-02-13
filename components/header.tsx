"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CartItem } from "@/types"
import { createClient } from "@/lib/supabase/client"

interface HeaderProps {
  cart: CartItem[]
  onCartToggle: () => void
  onPageChange: (page: string) => void
  currentPage: string
}

export default function Header({ cart, onCartToggle, onPageChange, currentPage }: HeaderProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUserEmail(data.user?.email ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v)

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* LOGO */}
              <button
                type="button"
                onClick={() => handlePageChange("home")}
                className="flex items-center focus:outline-none"
                aria-label="Ir para início"
              >
                <img
                  src="/img.webp"
                  alt="Quebrada 1914"
                  className="h-[56px] md:h-[80px] max-h-[100px] w-auto object-contain select-none"
                  draggable={false}
                />
              </button>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => onPageChange("home")}
                className={`font-semibold tracking-wide transition ${
                  currentPage === "home" ? "text-red-500" : "text-white hover:text-red-500"
                }`}
              >
                PRODUTOS
              </button>
              <button
                onClick={() => onPageChange("about")}
                className={`font-semibold tracking-wide transition ${
                  currentPage === "about" ? "text-red-500" : "text-white hover:text-red-500"
                }`}
              >
                SOBRE
              </button>
              <button
                onClick={() => onPageChange("contact")}
                className={`font-semibold tracking-wide transition ${
                  currentPage === "contact" ? "text-red-500" : "text-white hover:text-red-500"
                }`}
              >
                CONTATO
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={onCartToggle}
                className="relative btn-quebrada text-white px-4 py-2 rounded font-bold tracking-wide transition"
              >
                🛒 CARRINHO ({totalItems})
                <span className="text-xs block">R$ {totalPrice.toFixed(2)}</span>
              </button>

              {/* Auth Buttons */}
              {/* {userEmail ? (
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-300">{userEmail}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 transition text-xs"
                  >
                    SAIR
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/login">
                    <button className="font-bold hover:text-red-500 transition px-4 py-2">LOGIN</button>
                  </Link>
                  <Link href="/register">
                    <button className="bg-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">
                      CRIAR CONTA
                    </button>
                  </Link>
                </div>
              )}  */}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu fixed top-0 left-0 w-64 h-full bg-black/95 backdrop-blur-sm z-40 md:hidden ${
          isMobileMenuOpen ? "open" : ""
        }`}
      >
        <div className="p-6 pt-20">
          <nav className="space-y-6">
            <button
              onClick={() => handlePageChange("home")}
              className="block text-white hover:text-red-500 font-bold text-xl tracking-wide transition"
            >
              PRODUTOS
            </button>
            <button
              onClick={() => handlePageChange("about")}
              className="block text-white hover:text-red-500 font-bold text-xl tracking-wide transition"
            >
              SOBRE
            </button>
            <button
              onClick={() => handlePageChange("contact")}
              className="block text-white hover:text-red-500 font-bold text-xl tracking-wide transition"
            >
              CONTATO
            </button>

            {/* <div className="border-t border-gray-700 pt-6 mt-6">
              {userEmail ? (
                <div className="space-y-4">
                  <span className="block text-gray-400 text-sm">{userEmail}</span>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                  >
                    SAIR
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href="/login">
                    <button className="w-full text-white hover:text-red-500 font-bold text-xl tracking-wide transition">
                      LOGIN
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">
                      CRIAR CONTA
                    </button>
                  </Link>
                </div>
              )}
            </div> */}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
