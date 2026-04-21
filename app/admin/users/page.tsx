'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'dalibor.pasek@gmail.com'

export default function AdminUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      fetchUsers()
    }
    getUser()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setUsers(data || [])
    setLoading(false)
  }

  const toggleBan = async (id: string, is_banned: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !is_banned })
      .eq('id', id)
    if (error) alert('Chyba: ' + error.message)
    else fetchUsers()
  }

  const changeRole = async (id: string, role: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
    if (error) alert('Chyba při změně role: ' + error.message)
    else fetchUsers()
  }

  const toggleUnofficial = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ can_see_unofficial: !current })
      .eq('id', id)
    if (error) alert('Chyba: ' + error.message)
    else fetchUsers()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Opravdu chceš smazat tohoto uživatele? Tato akce je nevratná.')) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) alert('Chyba: ' + error.message)
    else fetchUsers()
  }

  const riderLevelLabel: any = {
    beginner: 'Začátečník',
    intermediate: 'Pokročilý',
    advanced: 'Zdatný',
    expert: 'Expert'
  }

  const bikeTypeLabel: any = {
    xc: 'XC',
    trail: 'Trail',
    enduro: 'Enduro',
    dh: 'DH',
    ebike: 'E-bike',
    other: 'Jiné'
  }

  const roleLabel: any = {
    user: 'Uživatel',
    member: 'BIKER',
    moderator: 'Moderátor',
    editor: 'Editor',
    admin: 'Admin',
    superadmin: 'Superadmin'
  }

  const roleColor: any = {
    user: 'bg-gray-700 text-gray-300',
    member: 'bg-green-900 text-green-300',
    moderator: 'bg-blue-900 text-blue-300',
    editor: 'bg-purple-900 text-purple-300',
    admin: 'bg-orange-900 text-orange-300',
    superadmin: 'bg-red-900 text-red-300',
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Správa uživatelů</h1>
            <p className="text-gray-400">
              Celkem: {users.length} uživatelů
              <span className="ml-3 text-blue-400">Moderátorů: {users.filter(u => u.role === 'moderator').length}</span>
              <span className="ml-3 text-green-400">Členů: {users.filter(u => u.role === 'member').length}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-orange-500 hover:text-orange-400 transition"
          >
            Zpět do adminu
          </button>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Hledat podle emailu, username nebo jména..."
          />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <p className="text-gray-400">Žádní uživatelé nenalezeni.</p>
          )}
          {filtered.map((u) => (
            <div
              key={u.id}
              className={`rounded-2xl p-6 ${u.is_banned ? 'bg-red-950 border border-red-800' : 'bg-gray-900'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-white font-bold text-lg">
                      {u.username || u.email?.split('@')[0]}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColor[u.role] || roleColor.user}`}>
                      {roleLabel[u.role] || 'Uživatel'}
                    </span>
                    {u.is_banned && (
                      <span className="text-xs bg-red-800 text-red-300 px-2 py-0.5 rounded-full">
                        Zablokovaný
                      </span>
                    )}
                    {u.can_see_unofficial && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        ☠️ Vidí neoficiální
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                </div>
                <p className="text-gray-600 text-xs">Registrace: {formatDate(u.created_at)}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Jméno a příjmení</p>
                  <p className="text-white text-sm">{u.full_name || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Odkud</p>
                  <p className="text-white text-sm">{u.city || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Rok narození</p>
                  <p className="text-white text-sm">{u.birth_year || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Úroveň</p>
                  <p className="text-white text-sm">{riderLevelLabel[u.rider_level] || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Typ kola</p>
                  <p className="text-white text-sm">{bikeTypeLabel[u.bike_type] || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Sociální sítě</p>
                  <p className="text-white text-sm">
                    {u.strava_url ? 'Strava ' : ''}
                    {u.instagram_url ? 'Instagram' : ''}
                    {!u.strava_url && !u.instagram_url ? '-' : ''}
                  </p>
                </div>
              </div>

              {u.bio && (
                <div className="bg-gray-800 rounded-xl p-3 mb-4">
                  <p className="text-gray-500 text-xs mb-1">Bio</p>
                  <p className="text-white text-sm">{u.bio}</p>
                </div>
              )}

              {/* Role */}
              <div className="bg-gray-800 rounded-xl p-4 mb-3">
                <p className="text-gray-400 text-sm mb-3">Změnit roli uživatele</p>
                <div className="flex gap-2 flex-wrap">
                  {['user', 'member', 'moderator', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => changeRole(u.id, role)}
                      className={`px-4 py-2 rounded-xl text-sm transition ${
                        u.role === role
                          ? `${roleColor[role]} font-bold`
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {roleLabel[role]}
                    </button>
                  ))}
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  Člen vidí neoficiální traily (pokud má povoleno). Moderátor schvaluje traily a recenze. Admin má plný přístup.
                </p>
              </div>

              {/* Neoficiální traily */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-semibold">☠️ Přístup k neoficiálním trailům</p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {u.can_see_unofficial ? 'Uživatel vidí neoficiální traily' : 'Uživatel nevidí neoficiální traily'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleUnofficial(u.id, u.can_see_unofficial)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      u.can_see_unofficial
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {u.can_see_unofficial ? 'Deaktivovat' : 'Aktivovat'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => toggleBan(u.id, u.is_banned)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    u.is_banned
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {u.is_banned ? 'Odblokovat' : 'Zablokovat'}
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition"
                >
                  Smazat uživatele
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

