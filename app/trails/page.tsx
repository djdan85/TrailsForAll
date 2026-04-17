'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Trails() {
  const router = useRouter()
  const [trails, setTrails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [canSeeUnofficial, setCanSeeUnofficial] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('can_see_unofficial')
          .eq('id', userData.user.id)
          .single()
        setCanSeeUnofficial(profileData?.can_see_unofficial || false)
      }

      const { data, error } = await supabase
        .from('trails_with_profiles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setTrails(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Unikátní kraje z načtených trailů
  const regions = ['all', ...Array.from(new Set(trails.map(t => t.region).filter(Boolean))).sort()]

  const filtered = trails.filter((t) => {
    const diffMatch = filter === 'all' || t.difficulty === filter
    const typeMatch = typeFilter === 'all'
      || (typeFilter === 'official' && t.is_official)
      || (typeFilter === 'unofficial' && !t.is_official)
    const regionMatch = regionFilter === 'all' || t.region === regionFilter
    return diffMatch && typeMatch && regionMatch
  })

  const difficultyLabel: any = {
    easy: '🟢 Lehká',
    medium: '🟡 Střední',
    hard: '🔴 Těžká',
    expert: '⚫ Expert'
  }

  const formatDate = (date: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Traily</h1>
        <p className="text-gray-400 mb-6">Všechny schválené traily v databázi.</p>

        {/* Filtr náročnosti */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {['all', 'easy', 'medium', 'hard', 'expert'].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === d
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {d === 'all' ? 'Všechny' : difficultyLabel[d]}
            </button>
          ))}
        </div>

        {/* Filtr krajů */}
        {regions.length > 1 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  regionFilter === r
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {r === 'all' ? '🗺️ Všechny kraje' : r}
              </button>
            ))}
          </div>
        )}

        {/* Filtr typu — jen pro uživatele s přístupem */}
        {canSeeUnofficial && (
          <div className="flex gap-2 mb-8 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                typeFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Všechny typy
            </button>
            <button
              onClick={() => setTypeFilter('official')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                typeFilter === 'official' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ✅ Pouze oficiální
            </button>
            <button
              onClick={() => setTypeFilter('unofficial')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                typeFilter === 'unofficial' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ☠️ Pouze neoficiální
            </button>
          </div>
        )}

        {!canSeeUnofficial && <div className="mb-5" />}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.length === 0 && (
            <p className="text-gray-400 col-span-4">Žádné traily nenalezeny.</p>
          )}
          {filtered.map((trail) => (
            <div
              key={trail.id}
              onClick={() => router.push(`/trail/${trail.id}`)}
              className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-800 transition"
            >
              <div className="relative">
                <img
                  src={trail.photo_url || '/logo.png'}
                  alt={trail.name}
                  className="w-full h-28 object-cover bg-gray-800"
                />
                {!trail.is_official && (
                  <span className="absolute top-2 left-2 bg-gray-900 text-orange-400 text-xs font-semibold px-2 py-1 rounded-lg border border-orange-400/30">
                    ☠️
                  </span>
                )}
              </div>
              <div className="p-3">
                <h2 className="text-white font-bold text-sm mb-1 line-clamp-1">{trail.name}</h2>
                <p className="text-gray-400 text-xs mb-2 line-clamp-1">{trail.location_name}</p>
                <div className="flex gap-2 text-xs flex-wrap items-center mb-2">
                  <span className="text-orange-500 font-semibold">
                    {difficultyLabel[trail.difficulty]}
                  </span>
                  <span className="text-gray-400">{trail.length_km} km</span>
                </div>
                {trail.region && (
                  <p className="text-gray-600 text-xs">{trail.region}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}