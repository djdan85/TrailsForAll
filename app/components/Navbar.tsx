'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser(data.user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', data.user.id)
          .single()
        setProfile(profileData)
      }
    }
    getData()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isAdmin = profile?.role && ['admin', 'superadmin', 'moderator'].includes(profile.role)

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">

        <Link href="/">
          <Image
            src="/logo.png"
            alt="Trails for All"
            width={120}
            height={50}
            className="object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-white hover:text-orange-500 transition">
            Mapa
          </Link>
          <Link href="/trails" className="text-white hover:text-orange-500 transition">
            Traily
          </Link>
          <Link href="/clanky" className="text-white hover:text-orange-500 transition">
            Články
          </Link>
          <Link href="/komunita" className="text-white hover:text-orange-500 transition">
            Komunita
          </Link>
          <Link href="/o-nas" className="text-white hover:text-orange-500 transition">
            O nás
          </Link>
          <Link href="/add-trail" className="text-white hover:text-orange-500 transition">
            Přidat trail
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-orange-500 hover:text-orange-400 transition font-semibold">
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-gray-400 hover:text-orange-500 transition text-sm">
                {profile?.username || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Odhlásit
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
              Přihlásit se
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-orange-500"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black border-t border-orange-500 px-4 py-3 flex flex-col gap-3">
          <Link href="/" className="text-white hover:text-orange-500" onClick={() => setMenuOpen(false)}>
            Mapa
          </Link>
          <Link href="/trails" className="text-white hover:text-orange-500" onClick={() => setMenuOpen(false)}>
            Traily
          </Link>
          <Link href="/clanky" className="text-white hover:text-orange-500" onClick={() => setMenuOpen(false)}>
            Články
          </Link>
          <Link href="/komunita" className="text-white hover:text-orange-500" onClick={() => setMenuOpen(false)}>
            Komunita
          </Link>
          <Link href="/o-nas" className="text-white hover:text-orange-500" onClick={() => setMenuOpen(false)}>
            O nás
          </Link>
          <Link href="/add-trail" className="text-white hover:text-orange-500" onClick={() => setMenuOpen(false)}>
            Přidat trail
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-orange-500 font-semibold" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className="text-gray-400 hover:text-orange-500 text-sm" onClick={() => setMenuOpen(false)}>
                {profile?.username || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-left"
              >
                Odhlásit
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center hover:bg-orange-600" onClick={() => setMenuOpen(false)}>
              Přihlásit se
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}