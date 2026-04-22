'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import GpxUpload from '../../components/GpxUpload'

const TrailMap = dynamic(() => import('../../components/TrailMap'), { ssr: false })

const trailTypeLabel: { [key: string]: string } = {
  singltrek: '🚵 Singltrek / Trail',
  pumptrack: '🔁 Pumptrack',
  skatepark: '🛹 Skatepark',
  bikepark: '🏔️ Bikepark',
  crosscountry: '🛤️ Cross-country',
}

const skillLevelLabel: { [key: string]: string } = {
  zacatecnik: '🟢 Začátečník',
  pokrocily: '🔵 Pokročilý biker',
  zkuseny: '🟠 Zkušený biker',
  zabijak: '⚫ Zabijácký BIKER',
  easy: '🟢 Lehká',
  medium: '🟡 Střední',
  hard: '🔴 Těžká',
  expert: '⚫ Expert',
}

export default function TrailDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [trail, setTrail] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [reviews, setReviews] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [gpxMessage, setGpxMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: trailData } = await supabase
        .from('trails_with_profiles')
        .select('*')
        .eq('id', id)
        .single()

      const { data: photosData } = await supabase
        .from('trail_photos')
        .select('*')
        .eq('trail_id', id)
        .order('display_order', { ascending: true })

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('trail_id', id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, can_see_unofficial')
          .eq('id', userData.user.id)
          .single()
        setProfile(profileData)
      }

      setTrail(trailData)
      setPhotos(photosData || [])
      setReviews(reviewsData || [])
      setUser(userData.user)
      setLoading(false)
    }

    if (id) fetchData()
  }, [id])

  const handleReview = async () => {
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('reviews').insert({
      trail_id: id,
      user_id: user.id,
      rating,
      comment,
      status: 'pending',
    })
    if (error) setMessage('Chyba: ' + error.message)
    else { setMessage('Recenze odeslána ke schválení! ✅'); setComment('') }
  }

  const handleGpxUpload = async (url: string) => {
    const { error } = await supabase
      .from('trails')
      .update({ gpx_url: url })
      .eq('id', id)
    if (error) setGpxMessage('Chyba při ukládání GPX: ' + error.message)
    else {
      setGpxMessage('GPX soubor byl úspěšně nahrán!')
      setTrail((prev: any) => ({ ...prev, gpx_url: url }))
    }
  }

  const canAccessGpx = profile?.role &&
    ['member', 'moderator', 'editor', 'admin', 'superadmin'].includes(profile.role)

  const formatDate = (date: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  const mainPhotoUrl = photos.length > 0
    ? photos[activePhoto]?.url
    : trail?.photo_url || '/logo.png'

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
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => router.back()}
          className="text-orange-500 hover:text-orange-400 mb-6 flex items-center gap-2"
        >
          ← Zpět
        </button>

        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg mb-6">

          {/* Fotogalerie */}
          <div className="relative">
            <img
              src={mainPhotoUrl}
              alt={trail.name}
              className="w-full h-56 object-cover bg-gray-800"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhoto(p => Math.max(0, p - 1))}
                  disabled={activePhoto === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActivePhoto(p => Math.min(photos.length - 1, p + 1))}
                  disabled={activePhoto === photos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/70 transition disabled:opacity-30"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`w-2 h-2 rounded-full transition ${i === activePhoto ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {activePhoto + 1} / {photos.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturky */}
          {photos.length > 1 && (
            <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    i === activePhoto ? 'border-orange-500' : 'border-transparent'
                  }`}
                >
                  <img src={photo.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{trail.name}</h1>
              {!trail.is_official && (
                <span className="text-xs px-2 py-0.5 rounded-lg border border-orange-400/30 text-orange-400 bg-gray-800">
                  ☠️ Neoficiální
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-6">
              {trail.location_name}{trail.region ? ` · ${trail.region}` : ''}
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Typ místa</p>
                <p className="text-white font-semibold mt-1 text-sm">
                  {trailTypeLabel[trail.trail_type] || '🚵 Singltrek'}
                </p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Pro koho</p>
                <p className="text-white font-semibold mt-1 text-sm">
                  {skillLevelLabel[trail.skill_level] || '🟢 Začátečník'}
                </p>
              </div>
              {trail.length_km && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Délka</p>
                  <p className="text-white font-semibold mt-1">{trail.length_km} km</p>
                </div>
              )}
              {trail.region && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-sm">Kraj</p>
                  <p className="text-white font-semibold mt-1 text-sm">{trail.region}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Popis</p>
              <p className="text-white">{trail.description}</p>
            </div>

            {/* Mapa */}
            {trail.lat && trail.lng && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Poloha startu</p>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => window.open(`https://www.google.com/maps?q=${trail.lat},${trail.lng}`, '_blank')}
                      className="text-orange-500 hover:text-orange-400 text-xs transition"
                    >
                      Google Maps
                    </button>
                    <span className="text-gray-600 text-xs">|</span>
                    <button
                      onClick={() => window.open(`https://mapy.com/zakladni?x=${trail.lng}&y=${trail.lat}&z=15`, '_blank')}
                      className="text-orange-500 hover:text-orange-400 text-xs transition"
                    >
                      Mapy.com
                    </button>
                  </div>
                </div>
                <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                  <TrailMap
                    lat={parseFloat(trail.lat)}
                    lng={parseFloat(trail.lng)}
                    name={trail.name}
                    isOfficial={trail.is_official}
                    gpxUrl={trail.gpx_url || undefined}
                  />
                </div>
              </div>
            )}

            {/* GPX sekce */}
            {canAccessGpx && (
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <p className="text-gray-400 text-sm mb-3">GPX soubor</p>
                {trail.gpx_url ? (
                  <button
                    onClick={() => window.open(trail.gpx_url, '_blank')}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition font-semibold"
                  >
                    📥 Stáhnout GPX
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-white font-bold text-sm">GPX soubor není k dispozici. Máš ho? Nahraj ho!</p>
                    <GpxUpload onUpload={(url) => handleGpxUpload(url)} />
                    {gpxMessage && <p className="text-orange-400 text-xs">{gpxMessage}</p>}
                  </div>
                )}
              </div>
            )}

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

            {/* Tlačítka odkazů */}
            <div className="flex gap-3 flex-wrap">
              {trail.maps_url && (
                <button
                  onClick={() => window.open(trail.maps_url, '_blank')}
                  className="flex items-center justify-center gap-2 flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition"
                >
                  🗺️ Mapy.com
                </button>
              )}
              {trail.website_url && (
                <button
                  onClick={() => window.open(trail.website_url, '_blank')}
                  className="flex items-center justify-center gap-2 flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition"
                >
                  🌐 Web místa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recenze */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Recenze
            {reviews.length > 0 && (
              <span className="text-gray-400 font-normal text-base ml-2">({reviews.length})</span>
            )}
          </h2>

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
              <p className={`text-sm ${message.includes('✅') ? 'text-green-400' : 'text-orange-400'}`}>
                {message}
              </p>
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