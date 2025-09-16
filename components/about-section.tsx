export default function AboutSection() {
  return (
    <div className="pt-20">
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 tracking-wide">
            NOSSA <span className="text-red-500">QUEBRADA</span>
          </h2>
          <div className="bg-gray-900/50 rounded-lg p-8 md:p-12 border border-gray-800">
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              A <strong className="text-white">Quebrada 1914</strong> nasceu nas ruas, cresceu na arquibancada e vive no
              coração de quem tem atitude. Somos mais que uma loja - somos um movimento que representa a cultura
              periférica, a paixão clubística e o estilo urbano autêntico.
            </p>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Cada peça carrega a energia das torcidas organizadas, o suor da luta diária e o orgulho de quem não abaixa
              a cabeça. <strong className="text-red-500">Da quebrada, para a quebrada.</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl mb-4">⚽</div>
                <h4 className="font-bold mb-2 text-xl tracking-wide">PAIXÃO CLUBÍSTICA</h4>
                <p className="text-gray-400">Roupas que respiram futebol e torcida organizada</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏙️</div>
                <h4 className="font-bold mb-2 text-xl tracking-wide">ESTILO URBANO</h4>
                <p className="text-gray-400">Direto das ruas para o seu guarda-roupa</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">✊</div>
                <h4 className="font-bold mb-2 text-xl tracking-wide">ATITUDE REAL</h4>
                <p className="text-gray-400">Para quem tem personalidade e não esconde</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
