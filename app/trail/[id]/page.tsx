'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function TrailDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [trail, setTrail] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: trailData } = await supabase
        .from('trails_with_profiles')
        .select('*')
        .eq('id', id)
        .single()

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('trail_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const { data: userData } = await supabase.auth.getUser()

      setTrail(trailData)
      setReviews(reviewsData || [])
      setUser(userData.user)
      setLoading(false)
    }

    if (id) fetchData()
  }, [id])

  const handleReview = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('reviews').insert({
      trail_id: id,
      user_id: user.id,
      rating,
      comment,
      status: 'pending'
    })

    if (error) setMessage('Chyba: ' + error.message)
    else setMessage('Recenze odeslána ke schválení!')
    setComment('')
  }

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

  if (!trail) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white text-xl">Trail nenalezen.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-20 px-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => router.back()}
          className="text-orange-500 hover:text-orange-400 mb-6 flex items-center gap-2"
        >
          ← Zpět
        </button>

        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg mb-6">
          <img
            src={trail.photo_url || '/logo.png'}
            alt={trail.name}
            className="w-full h-56 object-cover bg-gray-800"
          />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-1">{trail.name}</h1>
            <p className="text-gray-400 mb-6">{trail.location_name}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Náročnost</p>
                <p className="text-white font-semibold mt-1">
                  {difficultyLabel[trail.difficulty]}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Délka</p>
                <p className="text-white font-semibold mt-1">{trail.length_km} km</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Popis</p>
              <p className="text-white">{trail.description}</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Poloha</p>
              <p className="text-white">{trail.lat}, {trail.lng}</p>
            </div>

            <div className="flex flex-col gap-1 mb-4">
              <p className="text-gray-600 text-xs">
                Přidal: {trail.created_by_username || 'Neznámý'} · {formatDate(trail.created_at)}
              </p>
              {trail.approved_at && (
                <p className="text-gray-600 text-xs">
                  Schválil: {trail.approved_by_username || 'Admin'} · {formatDate(trail.approved_at)}
                </p>
              )}
              {trail.updated_at && (
                <p className="text-gray-600 text-xs">
                  Upravil: {trail.updated_by_username || 'Admin'} · {formatDate(trail.updated_at)}
                </p>
              )}
            </div>

            {trail.maps_url && (
              <button
                onClick={() => window.open(trail.maps_url, '_blank')}
                className="flex items-center justify-center gap-2 w-full bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition"
              >
                🗺️ Zobrazit na Mapy.com
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Recenze</h2>

          {reviews.length === 0 && (
            <p className="text-gray-400 mb-4">Zatím žádné recenze.</p>
          )}

          <div className="flex flex-col gap-4 mb-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-500 font-semibold">
                    {'⭐'.repeat(review.rating)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(review.created_at).toLocaleDateString('cs-CZ')}
                  </span>
                </div>
                <p className="text-white text-sm">{review.comment}</p>
              </div>
            ))}
          </div>

          <h3 className="text-white font-semibold mb-3">Přidat recenzi</h3>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Hodnocení</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{'⭐'.repeat(r)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Komentář</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Popiš nám svůj zážitek..."
              />
            </div>

            {message && (
              <p className="text-orange-400 text-sm">{message}</p>
            )}

            <button
              onClick={handleReview}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              {user ? 'Odeslat recenzi' : 'Přihlaš se pro přidání recenze'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}