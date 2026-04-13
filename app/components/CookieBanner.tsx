'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] bg-gray-900 border-t border-gray-700 px-4 py-4 shadow-lg">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-300 text-sm text-center md:text-left">
          Tento web používá nezbytné cookies pro přihlášení a základní funkce.
          Více informací v{' '}
          <Link href="/cookies" className="text-orange-500 hover:underline">
            zásadách cookies
          </Link>
          {' '}a{' '}
          <Link href="/zasady-ochrany" className="text-orange-500 hover:underline">
            ochraně osobních údajů
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="bg-gray-700 text-white px-5 py-2 rounded-xl text-sm hover:bg-gray-600 transition"
          >
            Odmítnout
          </button>
          <button
            onClick={handleAccept}
            className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm hover:bg-orange-600 transition"
          >
            Přijmout
          </button>
        </div>
      </div>
    </div>
  )
}