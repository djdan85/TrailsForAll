'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Registrace proběhla! Zkontroluj email pro potvrzení.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 pt-16">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-lg">
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {isRegister ? 'Registrace' : 'Přihlášení'}
        </h1>
        <p className="text-gray-400 mb-6">
          {isRegister ? 'Vytvoř si účet zdarma' : 'Vítej zpět'}
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="tvuj@email.cz"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p className="text-orange-400 text-sm">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Načítám...' : isRegister ? 'Registrovat se' : 'Přihlásit se'}
          </button>

          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-400 text-sm hover:text-orange-500 transition"
          >
            {isRegister ? 'Už máš účet? Přihlás se' : 'Nemáš účet? Registruj se'}
          </button>
        </div>
      </div>
    </div>
  )
}