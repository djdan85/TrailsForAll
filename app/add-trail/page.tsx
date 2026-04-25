'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import MultiImageUpload, { UploadedPhoto } from '../components/MultiImageUpload'
import GpxUpload from '../components/GpxUpload'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('../components/RouteMap'), { ssr: false })
const TrailMap = dynamic(() => import('../components/TrailMap'), { ssr: false })

const colorOptions = [
  { label: 'Zelená', value: '#22c55e' },
  { label: 'Modrá', value: '#3b82f6' },
  { label: 'Červená', value: '#ef4444' },
  { label: 'Černá', value: '#111827' },
  { label: 'Žlutá', value: '#eab308' },
  { label: 'Oranžová', value: '#f97316' },
  { label: 'Bílá', value: '#ffffff' },
]

export default function AddTrail() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])
  const [gpxUrl, setGpxUrl] = useState('')
  const [gpxColor, setGpxColor] = useState('#22c55e')
  const [gpxPoints, setGpxPoints] = useState<[number, number][]>([])
  const [region, setRegion] = useState('')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [previewKey, setPreviewKey] = useState(0)

  const [form, setForm] = useState({
    name: '',
    description: '',
    trail_type: 'singltrek',
    skill_level: 'zacatecnik',
    length_km: '',
    location_name: '',
    maps_url: '',
    website_url: '',
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
    setGpxPoints(points)

    if (points.length > 0) {
      setRoutePoints([points[0]])
    }

    setPreviewKey(k => k + 1)
  }

  const handleSubmit = async () => {
    if (routePoints.length === 0) {
      setMessage('Označ start trailu na mapě nebo nahraj GPX soubor.')
      return
    }

    setLoading(true)
    setMessage('')

    const startPoint = routePoints[0]
    const primaryPhoto = photos.find(p => p.is_primary) || photos[0] || null

    const { data: trailData, error } = await supabase
      .from('trails')
      .insert({
        name: form.name,
        description: form.description,
        trail_type: form.trail_type,
        skill_level: form.skill_level,
        length_km: form.length_km ? parseFloat(form.length_km) : null,
        location_name: form.location_name,
        lat: startPoint[0],
        lng: startPoint[1],
        gpx_url: gpxUrl || null,
        gpx_color: gpxColor, // 🔥 TADY JE KLÍČ
        photo_url: primaryPhoto?.url || null,
        maps_url: form.maps_url || null,
        website_url: form.website_url || null,
        is_official: form.is_official,
        region: region || null,
        created_by: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      setMessage('Chyba: ' + error.message)
      setLoading(false)
      return
    }

    setMessage('Místo bylo odesláno ke schválení! ✅')
    setLoading(false)
    setTimeout(() => router.push('/trails'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Přidat místo</h1>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-6">

          {/* GPX upload */}
          <GpxUpload onUpload={handleGpxUpload} />

          {/* 🔥 NOVĚ: BARVA JE VŽDY VIDITELNÁ */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Barva trasy na mapě
            </label>

            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    setGpxColor(color.value)
                    setPreviewKey(k => k + 1)
                  }}
                  title={color.label}
                  style={{ backgroundColor: color.value }}
                  className={`w-10 h-10 rounded-full border-4 transition ${
                    gpxColor === color.value
                      ? 'border-orange-500 scale-110'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-500 text-xs mt-1">
              Vybraná: {colorOptions.find(c => c.value === gpxColor)?.label}
            </p>
          </div>

          {/* MAPA */}
          <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden' }}>
            {gpxUrl && gpxPoints.length > 0 ? (
              <TrailMap
                key={previewKey}
                lat={routePoints[0]?.[0] || 50}
                lng={routePoints[0]?.[1] || 14}
                name={form.name || 'Nový trail'}
                isOfficial={form.is_official}
                gpxUrl={gpxUrl}
                gpxColor={gpxColor}
              />
            ) : (
              <RouteMap
                points={routePoints}
                onChange={(pts, reg) => {
                  setRoutePoints(pts)
                  if (reg) setRegion(reg)
                }}
              />
            )}
          </div>

          {message && (
            <p className="text-sm text-orange-400">{message}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? 'Odesílám...' : 'Odeslat ke schválení'}
          </button>

        </div>
      </div>
    </div>
  )
}