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
    await supabase
      .from('profiles')
      .update({ is_banned: !is_banned })
      .eq('id', id)
    fetchUsers()
  }

  const changeRole = async (id: string, role: string) => {
    await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
    fetchUsers()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Opravdu chces smazat tohoto uzivatele? Tato akce je nevratna.')) return
    await supabase.from('profiles').delete().eq('id', id)
    fetchUsers()
  }

  const riderLevelLabel: any = {
    beginner: 'Zacatecnik',
    intermediate: 'Pokrocily',
    advanced: 'Zdatny',
    expert: 'Expert'
  }

  const bikeTypeLabel: any = {
    xc: 'XC',
    trail: 'Trail',
    enduro: 'Enduro',
    dh: 'DH',
    ebike: 'E-bike',
    other: 'Jine'
  }

  const roleLabel: any = {
    user: 'Uzivatel',
    moderator: 'Moderator',
    admin: 'Admin'
  }

  const roleColor: any = {
    user: 'bg-gray-700 text-gray-300',
    moderator: 'bg-blue-900 text-blue-300',
    admin: 'bg-orange-900 text-orange-300'
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
      <p className="text-orange-500 text-xl">Nacitam...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Sprava uzivatelu</h1>
            <p className="text-gray-400">
              Celkem: {users.length} uzivatelu
              <span className="ml-3 text-blue-400">Moderatoru: {users.filter(u => u.role === 'moderator').length}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-orange-500 hover:text-orange-400 transition"
          >
            Zpet do adminu
          </button>
        </div>

        <div className="mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Hledat podle emailu, username nebo jmena..."
          />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <p className="text-gray-400">Zadni uzivatele nenalezeni.</p>
          )}
          {filtered.map((user) => (
            <div
              key={user.id}
              className={`rounded-2xl p-6 ${user.is_banned ? 'bg-red-950 border border-red-800' : 'bg-gray-900'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-white font-bold text-lg">
                      {user.username || 'Bez username'}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleColor[user.role] || roleColor.user}`}>
                      {roleLabel[user.role] || 'Uzivatel'}
                    </span>
                    {user.is_banned && (
                      <span className="text-xs bg-red-800 text-red-300 px-2 py-0.5 rounded-full">
                        Zablokovany
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <p className="text-gray-600 text-xs">Registrace: {formatDate(user.created_at)}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Jmeno a prijmeni</p>
                  <p className="text-white text-sm">{user.full_name || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Odkud</p>
                  <p className="text-white text-sm">{user.city || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Rok narozeni</p>
                  <p className="text-white text-sm">{user.birth_year || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Uroven</p>
                  <p className="text-white text-sm">{riderLevelLabel[user.rider_level] || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Typ kola</p>
                  <p className="text-white text-sm">{bikeTypeLabel[user.bike_type] || '-'}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-3">
                  <p className="text-gray-500 text-xs mb-1">Socialni site</p>
                  <p className="text-white text-sm">
                    {user.strava_url ? 'Strava ' : ''}
                    {user.instagram_url ? 'Instagram' : ''}
                    {!user.strava_url && !user.instagram_url ? '-' : ''}
                  </p>
                </div>
              </div>

              {user.bio && (
                <div className="bg-gray-800 rounded-xl p-3 mb-4">
                  <p className="text-gray-500 text-xs mb-1">Bio</p>
                  <p className="text-white text-sm">{user.bio}</p>
                </div>
              )}

              {/* Role */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <p className="text-gray-400 text-sm mb-3">Zmenit roli uzivatele</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => changeRole(user.id, 'user')}
                    className={`px-4 py-2 rounded-xl text-sm transition ${user.role === 'user' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                  >
                    Uzivatel
                  </button>
                  <button
                    onClick={() => changeRole(user.id, 'moderator')}
                    className={`px-4 py-2 rounded-xl text-sm transition ${user.role === 'moderator' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-blue-800'}`}
                  >
                    Moderator
                  </button>
                  <button
                    onClick={() => changeRole(user.id, 'admin')}
                    className={`px-4 py-2 rounded-xl text-sm transition ${user.role === 'admin' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-orange-900'}`}
                  >
                    Admin
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-2">
                  Moderator muze schvalovat traily a recenze. Admin ma plny pristup.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => toggleBan(user.id, user.is_banned)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    user.is_banned
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {user.is_banned ? 'Odblokovat' : 'Zablokovat'}
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition"
                >
                  Smazat uzivatele
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}