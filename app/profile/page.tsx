'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
    else setMessage('Profil byl uložen!')

    setSaving(false)
  }

  const handleExport = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: trails } = await supabase
      .from('trails')
      .select('*')
      .eq('created_by', user.id)

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)

    const exportData = {
      profil: profile,
      traily: trails,
      recenze: reviews,
      exportovano: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'moje-data-trails-for-all.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    setDeleting(true)

    await supabase.from('reviews').delete().eq('user_id', user.id)
    await supabase.from('trails').delete().eq('created_by', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()

    router.push('/')
  }

  const riderLevelLabel: any = {
    beginner: 'Začátečník',
    intermediate: 'Pokročilý',
    advanced: 'Zdatný',
    expert: 'Expert'
  }

  const bikeTypeLabel: any = {
    xc: 'XC',
    trail: 'Trail',
    enduro: 'Enduro',
    dh: 'DH / Downhill',
    ebike: 'E-bike',
    other: 'Jiné'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Můj profil</h1>
        <p className="text-gray-400 mb-8">Spravuj své údaje a bikerský profil.</p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          <h2 className="text-orange-500 font-semibold text-lg">Základní údaje</h2>

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
              <span className="text-gray-600 ml-1">(viditelné veřejně)</span>
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
              Jméno a příjmení
              <span className="text-gray-600 ml-1">(vidí jen admin a ty)</span>
            </label>
            <input
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Jan Novák"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Odkud jsi</label>
            <input
              value={form.city}
              onChange={e => setForm({...form, city: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="napr. Plzeň, Plzeňský kraj"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Rok narození
              <span className="text-gray-600 ml-1">(vidí jen admin a ty)</span>
            </label>
            <input
              value={form.birth_year}
              onChange={e => setForm({...form, birth_year: e.target.value})}
              type="number"
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="1990"
            />
          </div>

          <h2 className="text-orange-500 font-semibold text-lg mt-2">Bikerský profil</h2>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Úroveň jezdce</label>
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
              <span className="text-gray-600 ml-1">(viditelné veřejně)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              rows={3}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Jsem biker z Plzně, jezdím trail a enduro..."
            />
          </div>

          <h2 className="text-orange-500 font-semibold text-lg mt-2">Sociální sítě</h2>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Strava</label>
            <input
              value={form.strava_url}
              onChange={e => setForm({...form, strava_url: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://www.strava.com/athletes/..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Instagram</label>
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
            {saving ? 'Ukládám...' : 'Uložit profil'}
          </button>

        </div>

        {/* GDPR sekce */}
        <div className="bg-gray-900 rounded-2xl p-6 mt-6 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-lg">Správa dat</h2>
          <p className="text-gray-400 text-sm">
            Dle GDPR máš právo na export a smazání svých dat.
          </p>

          <button
            onClick={handleExport}
            className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
          >
            Exportovat moje data
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-900 text-red-300 py-3 rounded-xl font-semibold hover:bg-red-800 transition"
            >
              Smazat účet a všechna data
            </button>
          ) : (
            <div className="bg-red-950 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-red-300 text-sm font-semibold">
                Opravdu chceš smazat účet? Tato akce je nevratná. Budou smazány všechny tvoje traily, recenze a profil.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Mažu...' : 'Ano, smazat'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-600 transition"
                >
                  Zrušit
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}