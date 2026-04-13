'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Trails() {
  const router = useRouter()
  const [trails, setTrails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchTrails = async () => {
      const { data, error } = await supabase
        .from('trails_with_profiles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setTrails(data)
      setLoading(false)
    }
    fetchTrails()
  }, [])

  const filtered = filter === 'all'
    ? trails
    : trails.filter((t) => t.difficulty === filter)

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Traily</h1>
        <p className="text-gray-400 mb-6">Všechny schválené traily v databázi.</p>

        <div className="flex gap-2 mb-8 flex-wrap">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 && (
            <p className="text-gray-400 col-span-2">Žádné traily nenalezeny.</p>
          )}
          {filtered.map((trail) => (
            <div
              key={trail.id}
              onClick={() => router.push(`/trail/${trail.id}`)}
              className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-800 transition"
            >
               <img
                  src={trail.photo_url || '/logo.png'}
                  alt={trail.name}
                  className="w-full h-36 object-cover bg-gray-800"
                />
              <div className="p-6">
                <h2 className="text-white font-bold text-xl mb-1">{trail.name}</h2>
                <p className="text-gray-400 text-sm mb-3">{trail.location_name}</p>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{trail.description}</p>

                <div className="flex gap-4 text-sm flex-wrap items-center mb-3">
                  <span className="text-orange-500 font-semibold">
                    {difficultyLabel[trail.difficulty]}
                  </span>
                  <span className="text-gray-400">{trail.length_km} km</span>
                  {trail.maps_url && (
                    <span className="text-gray-600">Maps</span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 border-t border-gray-800 pt-3">
                  <p className="text-gray-600 text-xs">
                    Přidal: {trail.created_by_username || 'Neznámý'} · {formatDate(trail.created_at)}
                  </p>
                  {trail.approved_at && (
                    <p className="text-gray-600 text-xs">
                      Schváleno: {formatDate(trail.approved_at)}
                    </p>
                  )}
                  {trail.updated_at && (
                    <p className="text-gray-600 text-xs">
                      Upraveno: {formatDate(trail.updated_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}