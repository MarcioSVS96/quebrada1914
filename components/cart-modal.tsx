"use client"

import type { CartItem, Category } from "@/types"

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: string, change: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  onCheckout: () => void
  categories: Category[]
}

export default function CartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  categories,
}: CartModalProps) {
  if (!isOpen) return null

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName)
    return category ? category.icon : "📦"
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold tracking-wide">SEU CARRINHO</h3>
              <div className="flex items-center space-x-4">
                {cart.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-sm px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 font-bold"
                  >
                    LIMPAR TUDO
                  </button>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">
                  &times;
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-400 font-bold tracking-wide text-xl">SEU CARRINHO TÁ VAZIO, MANO!</p>
                  <p className="text-gray-500 mt-2">Bora adicionar umas peças maneiras aí</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">{getCategoryIcon(item.category)}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold tracking-wide">{item.name}</h4>
                        <p className="text-gray-400 text-sm">R$ {item.price.toFixed(2)} cada</p>
                        <p className="text-red-400 text-sm font-bold">
                          Total: R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 font-bold transition"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 font-bold transition"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 ml-2 font-bold transition"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-700 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal:</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Itens:</span>
                    <span>{totalItems}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xl font-bold mb-6 p-4 bg-red-600/10 rounded-lg border border-red-600/30">
                  <span>TOTAL: R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="bg-gray-700 text-white py-3 rounded-lg font-bold tracking-wide hover:bg-gray-600 transition">
                    💾 SALVAR PARA DEPOIS
                  </button>
                  <button
                    onClick={onCheckout}
                    className="btn-quebrada text-white py-3 rounded-lg font-bold tracking-wide transition"
                  >
                    FECHAR PELO ZAP 📱
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
