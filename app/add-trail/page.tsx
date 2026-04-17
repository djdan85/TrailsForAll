'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'
import GpxUpload from '../components/GpxUpload'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('../components/RouteMap'), { ssr: false })

export default function AddTrail() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])
  const [gpxUrl, setGpxUrl] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    difficulty: 'easy',
    length_km: '',
    location_name: '',
    photo_url: '',
    maps_url: '',
    is_official: true,
  })

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.push('/login')
      else setUser(data.user)
    }
    getUser()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGpxUpload = (url: string, points: [number, number][]) => {
    setGpxUrl(url)
    if (points.length > 0) {
      setRoutePoints([points[0]])
    } else {
      setRoutePoints([])
    }
  }

  const handleSubmit = async () => {
    if (routePoints.length === 0) {
      setMessage('Označ start trailu na mapě nebo nahraj GPX soubor.')
      return
    }

    setLoading(true)
    setMessage('')

    const startPoint = routePoints[0]

    const { error } = await supabase.from('trails').insert({
      name: form.name,
      description: form.description,
      difficulty: form.difficulty,
      length_km: parseFloat(form.length_km),
      location_name: form.location_name,
      lat: startPoint[0],
      lng: startPoint[1],
      gpx_url: gpxUrl || null,
      photo_url: form.photo_url || null,
      maps_url: form.maps_url || null,
      is_official: form.is_official,
      created_by: user.id,
      status: 'pending'
    })

    if (error) setMessage('Chyba: ' + error.message)
    else setMessage('Trail byl odeslán ke schválení!')

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Přidat trail</h1>
        <p className="text-gray-400 mb-8">Trail bude po odeslání čekat na schválení adminem.</p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Název trailu</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Název trailu"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Popis</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Popiš trail..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Náročnost</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="easy">🟢 Lehká</option>
              <option value="medium">🟡 Střední</option>
              <option value="hard">🔴 Těžká</option>
              <option value="expert">⚫ Expert</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Délka (km)</label>
            <input
              name="length_km"
              value={form.length_km}
              onChange={handleChange}
              type="number"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="12.5"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Lokalita</label>
            <input
              name="location_name"
              value={form.location_name}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Město, Region"
            />
          </div>

          {/* Oficiální / Neoficiální */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Typ trailu</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, is_official: true }))}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                  form.is_official
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ✅ Oficiální
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, is_official: false }))}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${
                  !form.is_official
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                ☠️ Neoficiální
              </button>
            </div>
            {!form.is_official && (
              <p className="text-gray-600 text-xs mt-2">
                Neoficiální traily vidí pouze členové komunity s přístupem od admina.
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Start trailu
              <span className="text-gray-600 ml-1">— klikni na mapu, nebo se doplní z GPX</span>
            </label>
            <RouteMap points={routePoints} onChange={setRoutePoints} />
            {routePoints.length > 0 && (
              <p className="text-gray-600 text-xs mt-1">
                📍 {routePoints[0][0].toFixed(5)}, {routePoints[0][1].toFixed(5)}
              </p>
            )}
          </div>

          <GpxUpload onUpload={handleGpxUpload} />

          <ImageUpload
            label="Fotografie trailu (nepovinné)"
            onUpload={url => setForm(prev => ({ ...prev, photo_url: url }))}
          />

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Mapy.com odkaz
              <span className="text-gray-600 ml-1">(nepovinné)</span>
            </label>
            <input
              name="maps_url"
              value={form.maps_url}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://mapy.com/..."
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
            {loading ? 'Odesílám...' : 'Odeslat ke schválení'}
          </button>

        </div>
      </div>
    </div>
  )
}