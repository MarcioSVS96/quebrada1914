"use client"

import type React from "react"

import { useState } from "react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error("Falha ao enviar a mensagem.")
      }

      alert("Mensagem enviada! Vamos responder em breve, mano!")
      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      console.error(error)
      alert("Ocorreu um erro. Tente novamente mais tarde.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="pt-20">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 tracking-wide">
            COLA COM A <span className="text-red-500">GENTE</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
              <h3 className="text-2xl font-bold mb-6 tracking-wide">MANDA O PAPO</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-bold mb-2 tracking-wide">NOME</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-2 tracking-wide">EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-2 tracking-wide">MENSAGEM</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-quebrada text-white py-3 rounded-lg font-bold tracking-wide transition"
                >
                  MANDAR MENSAGEM
                </button>
              </form>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-8 border border-gray-800">
              <h3 className="text-2xl font-bold mb-6 tracking-wide">NOSSOS CONTATOS</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📱</span>
                  <div>
                    <p className="font-bold tracking-wide">WHATSAPP</p>
                    <p className="text-gray-400">(11) 99999-9999</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📧</span>
                  <div>
                    <p className="font-bold tracking-wide">EMAIL</p>
                    <p className="text-gray-400">contato@quebrada1914.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <p className="font-bold tracking-wide">QUEBRADA</p>
                    <p className="text-gray-400">São Paulo - SP</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📷</span>
                  <div>
                    <p className="font-bold tracking-wide">INSTAGRAM</p>
                    <p className="text-gray-400">@quebrada1914</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  <strong className="text-red-400">ATENÇÃO:</strong> Todas as compras são finalizadas pelo WhatsApp.
                  Adicione os produtos no carrinho e clique em "FECHAR PELO ZAP"!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
