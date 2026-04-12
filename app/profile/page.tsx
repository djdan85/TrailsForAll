'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    city: '',
    birth_year: '',
    rider_level: 'beginner',
    bike_type: 'trail',
    bio: '',
    strava_url: '',
    instagram_url: '',
  })

  useEffect(() => {
    const getData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setUser(userData.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      if (profile) {
        setForm({
          username: profile.username || '',
          full_name: profile.full_name || '',
          city: profile.city || '',
          birth_year: profile.birth_year || '',
          rider_level: profile.rider_level || 'beginner',
          bike_type: profile.bike_type || 'trail',
          bio: profile.bio || '',
          strava_url: profile.strava_url || '',
          instagram_url: profile.instagram_url || '',
        })
      }
      setLoading(false)
    }
    getData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        username: form.username,
        full_name: form.full_name,
        city: form.city,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        rider_level: form.rider_level,
        bike_type: form.bike_type,
        bio: form.bio,
        strava_url: form.strava_url || null,
        instagram_url: form.instagram_url || null,
      })

    if (error) setMessage('Chyba: ' + error.message)
    else setMessage('Profil byl ulozen!')

    setSaving(false)
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
    dh: 'DH / Downhill',
    ebike: 'E-bike',
    other: 'Jine'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Nacitam...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Muj profil</h1>
        <p className="text-gray-400 mb-8">Spravuj sve udaje a bikersky profil.</p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          {/* Zakladni udaje */}
          <h2 className="text-orange-500 font-semibold text-lg">Zakladni udaje</h2>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-800 text-gray-500 rounded-xl px-4 py-3 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Username
              <span className="text-gray-600 ml-1">(viditelne verejne)</span>
            </label>
            <input
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="napr. biker_plzen"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Jmeno a prijmeni
              <span className="text-gray-600 ml-1">(vidi jen admin a ty)</span>
            </label>
            <input
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Jan Novak"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Odkud jsi
              <span className="text-gray-600 ml-1">(mesto, kraj)</span>
            </label>
            <input
              value={form.city}
              onChange={e => setForm({...form, city: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="napr. Plzen, Plzensky kraj"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Rok narozeni
              <span className="text-gray-600 ml-1">(vidi jen admin a ty)</span>
            </label>
            <input
              value={form.birth_year}
              onChange={e => setForm({...form, birth_year: e.target.value})}
              type="number"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="1990"
            />
          </div>

          {/* Bikersky profil */}
          <h2 className="text-orange-500 font-semibold text-lg mt-2">Bikersky profil</h2>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Uroven jezdce</label>
            <select
              value={form.rider_level}
              onChange={e => setForm({...form, rider_level: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.entries(riderLevelLabel).map(([key, val]) => (
                <option key={key} value={key}>{val as string}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Typ kola</label>
            <select
              value={form.bike_type}
              onChange={e => setForm({...form, bike_type: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.entries(bikeTypeLabel).map(([key, val]) => (
                <option key={key} value={key}>{val as string}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Bio
              <span className="text-gray-600 ml-1">(par vět o sobě, viditelné veřejné)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              rows={3}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Jsem biker z Plzně, jezdím traily a enduro..."
            />
          </div>

          {/* Socialni site */}
          <h2 className="text-orange-500 font-semibold text-lg mt-2">Socialni site</h2>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Strava
              <span className="text-gray-600 ml-1">(nepovinne)</span>
            </label>
            <input
              value={form.strava_url}
              onChange={e => setForm({...form, strava_url: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://www.strava.com/athletes/..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Instagram
              <span className="text-gray-600 ml-1">(nepovinne)</span>
            </label>
            <input
              value={form.instagram_url}
              onChange={e => setForm({...form, instagram_url: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://www.instagram.com/..."
            />
          </div>

          {message && (
            <p className="text-orange-400 text-sm">{message}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
          >
            {saving ? 'Ukladam...' : 'Ulozit profil'}
          </button>

        </div>
      </div>
    </div>
  )
}