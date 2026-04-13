'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const [trails, setTrails] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: trailsData } = await supabase
        .from('trails')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3)

      setTrails(trailsData || [])
      setReviews(reviewsData || [])
    }

    fetchData()
  }, [])

  const difficultyLabel: any = {
    easy: '🟢 Lehká',
    medium: '🟡 Střední',
    hard: '🔴 Těžká',
    expert: '⚫ Expert'
  }

  const popularTrails = trails.slice(0, 3)

  return (
    <main className="w-full flex flex-col">

      {/* Mapa */}
      <div className="w-full mt-16" style={{ height: '500px', position: 'relative', zIndex: 0 }}>
        <Map trails={trails} />
      </div>

      {/* Populární traily */}
      <div className="bg-gray-950 px-4 py-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Populární traily</h2>
          <p className="text-gray-400 mb-6">Nejnovější schválené traily v databázi.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularTrails.map((trail) => (
              <div
                key={trail.id}
                onClick={() => router.push(`/trail/${trail.id}`)}
                className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-800 transition"
              >
                {trail.photo_url && (
                  <img
                    src={trail.photo_url}
                    alt={trail.name}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{trail.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{trail.location_name}</p>
                  <div className="flex gap-3 text-sm">
                    <span className="text-orange-500 font-semibold">
                      {difficultyLabel[trail.difficulty]}
                    </span>
                    <span className="text-gray-400">{trail.length_km} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/trails')}
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              Zobrazit všechny traily →
            </button>
          </div>
        </div>
      </div>

      {/* Nejlepší recenze */}
      <div className="bg-gray-900 px-4 py-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Nejnovější recenze</h2>
          <p className="text-gray-400 mb-6">Co říkají bikeři o trailech.</p>

          {reviews.length === 0 && (
            <p className="text-gray-400">Zatím žádné recenze.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-orange-500 font-semibold text-lg">
                    {'⭐'.repeat(review.rating)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(review.created_at).toLocaleDateString('cs-CZ')}
                  </span>
                </div>
                <p className="text-white text-sm line-clamp-3">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA sekce */}
      <div className="bg-gray-950 px-4 py-12 text-center" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Znáš skvělý trail?
          </h2>
          <p className="text-gray-400 mb-8">
            Přidej ho do naší databáze a sdílej ho s komunitou bikerů.
          </p>
          <button
            onClick={() => router.push('/add-trail')}
            className="bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition"
          >
            Přidat trail
          </button>
        </div>
      </div>

    </main>
  )
}