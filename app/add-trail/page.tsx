'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AddTrail() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    difficulty: 'easy',
    length_km: '',
    location_name: '',
    lat: '',
    lng: '',
    coords: '',
    photo_url: '',
    maps_url: '',
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

  const handleCoords = (e: any) => {
    const val = e.target.value
    const parts = val.replace(/[NSns]/g, '').replace(/[EWew]/g, '').split(',')
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim())
      const lng = parseFloat(parts[1].trim())
      if (!isNaN(lat) && !isNaN(lng)) {
        setForm(prev => ({ ...prev, coords: val, lat: lat.toString(), lng: lng.toString() }))
        return
      }
    }
    setForm(prev => ({ ...prev, coords: val }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('trails').insert({
      name: form.name,
      description: form.description,
      difficulty: form.difficulty,
      length_km: parseFloat(form.length_km),
      location_name: form.location_name,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      photo_url: form.photo_url || null,
      maps_url: form.maps_url || null,
      created_by: user.id,
      status: 'pending'
    })

    if (error) setMessage('Chyba: ' + error.message)
    else setMessage('Trail byl odeslan ke schvaleni!')

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Pridat trail</h1>
        <p className="text-gray-400 mb-8">Trail bude po odeslani cekat na schvaleni adminem.</p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Nazev trailu</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nazev trailu"
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
              placeholder="Popis trailu..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Narocnost</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="easy">Lehka</option>
              <option value="medium">Stredni</option>
              <option value="hard">Tezka</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Delka (km)</label>
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
              placeholder="Mesto, Region"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Souradnice
              <span className="text-gray-600 ml-1">(zkopiruj z Google Maps, napr. 49.7890581, 13.4054814)</span>
            </label>
            <input
              name="coords"
              value={form.coords}
              onChange={handleCoords}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="49.7890581, 13.4054814"
            />
            {form.lat && form.lng && (
              <p className="text-gray-600 text-xs mt-1">Lat: {form.lat} / Lng: {form.lng}</p>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Fotografie
              <span className="text-gray-600 ml-1">(URL odkaz na foto, nepovinne)</span>
            </label>
            <input
              name="photo_url"
              value={form.photo_url}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Google Maps odkaz
              <span className="text-gray-600 ml-1">(nepovinne)</span>
            </label>
            <input
              name="maps_url"
              value={form.maps_url}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://maps.google.com/..."
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
            {loading ? 'Odesilam...' : 'Odeslat ke schvaleni'}
          </button>

        </div>
      </div>
    </div>
  )
}