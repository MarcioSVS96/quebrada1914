"use client"

interface Category {
  id: number
  name: string
  display_name: string
  icon: string
}

interface FooterProps {
  categories: Category[]
  onPageChange: (page: string) => void
}

export default function Footer({ categories, onPageChange }: FooterProps) {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold graffiti-text tracking-wider mb-4">QUEBRADA 1914</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Da quebrada, para a quebrada. Roupas com atitude que representam a cultura periférica e a paixão
              clubística. Vista o que você é!
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/quebrada1914"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition"
              >
                📷 INSTAGRAM
              </a>
              <a
                href="https://wa.me/5581997441023"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
              >
                📱 WHATSAPP
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 tracking-wide">NAVEGAÇÃO</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onPageChange("home")}
                  className="text-gray-400 hover:text-white transition font-medium"
                >
                  Produtos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange("about")}
                  className="text-gray-400 hover:text-white transition font-medium"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange("contact")}
                  className="text-gray-400 hover:text-white transition font-medium"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4 tracking-wide">CATEGORIAS</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => onPageChange("home")}
                    className="text-gray-400 hover:text-white transition font-medium"
                  >
                    {category.display_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 Quebrada 1914. Todos os direitos reservados.</div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <span>Desenvolvido com ❤️ na quebrada</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
