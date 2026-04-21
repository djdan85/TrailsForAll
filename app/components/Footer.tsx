'use client'

import Link from 'next/link'

export default function Footer() {
  const handleResetCookies = () => {
    localStorage.removeItem('cookie-consent')
    window.location.reload()
  }

  return (
    <footer className="bg-black border-t border-gray-800 px-4 py-10">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          <div>
            <h3 className="text-orange-500 font-bold text-xl mb-3">Trails For All</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Komunitní mapa trailů pro všechny generace bikerů. Testovací provoz ZDARMA.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Navigace</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-400 text-sm hover:text-orange-500 transition">
                Mapa
              </Link>
              <Link href="/trails" className="text-gray-400 text-sm hover:text-orange-500 transition">
                Traily
              </Link>
              <Link href="/add-trail" className="text-gray-400 text-sm hover:text-orange-500 transition">
                Přidat trail
              </Link>
              <Link href="/o-nas" className="text-gray-400 text-sm hover:text-orange-500 transition">
                O nás
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Právní informace</h4>
            <div className="flex flex-col gap-2">
              <Link href="/zasady-ochrany" className="text-gray-400 text-sm hover:text-orange-500 transition">
                Zásady ochrany osobních údajů
              </Link>
              <Link href="/cookies" className="text-gray-400 text-sm hover:text-orange-500 transition">
                Zásady cookies
              </Link>
              <button
                onClick={handleResetCookies}
                className="text-gray-400 text-sm hover:text-orange-500 transition text-left"
              >
                Odvolat souhlas s cookies
              </button>
              <button
                onClick={() => window.location.href = 'mailto:info@pasek-art.cz'}
                className="text-gray-400 text-sm hover:text-orange-500 transition text-left"
              >
                info@pasek-art.cz
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">
            2025 Trails For All. Vytvořeno pro správné BIKERY.
          </p>
          <p className="text-gray-600 text-xs">
            Dalibor Pašek — info@pasek-art.cz
          </p>
        </div>

      </div>
    </footer>
  )
}

