'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import RiderIcon, { riderDisciplineLabels, riderDisciplines, type RiderDiscipline } from '../components/RiderIcon'

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
    primary_discipline: 'mtb' as RiderDiscipline,
    equipment_text: '',
    bio: '',
    strava_url: '',
    instagram_url: '',
    show_in_community: false,
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
          primary_discipline: (profile.primary_discipline || 'mtb') as RiderDiscipline,
          equipment_text: profile.equipment_text || '',
          bio: profile.bio || '',
          strava_url: profile.strava_url || '',
          instagram_url: profile.instagram_url || '',
          show_in_community: profile.show_in_community === true,
        })
      }

      setLoading(false)
    }

    getData()
  }, [router])

  const handleSave = async () => {
    if (!form.username.trim()) {
      setMessage('Vyplň prosím přezdívku. Bez ní nelze profil uložit.')
      return
    }

    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        username: form.username.trim(),
        full_name: form.full_name.trim() || null,
        city: form.city.trim() || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        rider_level: form.rider_level,
        primary_discipline: form.primary_discipline,
        equipment_text: form.equipment_text.trim() || null,
        bio: form.bio.trim() || null,
        strava_url: form.strava_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        show_in_community: form.show_in_community,
      })

    if (error) setMessage('Chyba: ' + error.message)
    else setMessage('Profil byl uložen.')

    setSaving(false)
  }

  const handleExport = async () => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: trails } = await supabase.from('trails').select('*').eq('created_by', user.id)
    const { data: reviews } = await supabase.from('reviews').select('*').eq('user_id', user.id)

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

  const riderLevelLabel: Record<string, string> = {
    beginner: 'Začátečník',
    intermediate: 'Pokročilý',
    advanced: 'Zdatný',
    expert: 'Expert'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-orange-500 text-xl">Načítám...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-2">Profil ridera</p>
          <h1 className="text-4xl font-bold text-white mb-2">Můj profil</h1>
          <p className="text-gray-400">Ukaž komunitě, co jezdíš a co tě baví. Zveřejnění profilu máš stále plně pod kontrolou.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-7 flex flex-col gap-5 shadow-2xl shadow-black/20">
          <h2 className="text-orange-400 font-semibold text-lg">Soukromí profilu</h2>

          <label className="flex items-start gap-3 bg-gray-800/80 border border-gray-700 rounded-2xl p-4 cursor-pointer hover:border-orange-500/50 transition">
            <input
              type="checkbox"
              checked={form.show_in_community}
              onChange={event => setForm({ ...form, show_in_community: event.target.checked })}
              className="mt-1 h-5 w-5 accent-orange-500"
            />
            <span>
              <span className="block text-white font-semibold">Zobrazovat můj profil v komunitě</span>
              <span className="block text-gray-400 text-sm mt-1">
                Veřejně se zobrazí jen přezdívka a údaje, které dobrovolně vyplníš. E-mail ani celé jméno se nezveřejní.
              </span>
            </span>
          </label>

          <h2 className="text-orange-400 font-semibold text-lg mt-2">Základní údaje</h2>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">E-mail</label>
            <input value={user?.email || ''} disabled className="w-full bg-gray-800 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed" />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Přezdívka <span className="text-orange-400">(povinná)</span></label>
            <input
              value={form.username}
              onChange={event => setForm({ ...form, username: event.target.value })}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="např. rider_plzen"
              maxLength={40}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Jméno a příjmení <span className="text-gray-600">(neveřejné)</span></label>
            <input value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Město <span className="text-gray-600">(veřejné)</span></label>
              <input value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="např. Plzeň" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Rok narození <span className="text-gray-600">(neveřejné)</span></label>
              <input value={form.birth_year} onChange={event => setForm({ ...form, birth_year: event.target.value })} type="number" className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="1990" />
            </div>
          </div>

          <h2 className="text-orange-400 font-semibold text-lg mt-2">Jezdecký profil</h2>

          <div>
            <label className="text-gray-300 text-sm mb-3 block">Hlavní disciplína</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {riderDisciplines.map(discipline => {
                const selected = form.primary_discipline === discipline
                return (
                  <button
                    type="button"
                    key={discipline}
                    onClick={() => setForm({ ...form, primary_discipline: discipline })}
                    className={`min-h-28 rounded-2xl border p-3 flex flex-col items-center justify-center gap-2 transition ${selected ? 'bg-orange-500/15 border-orange-500 text-orange-400 shadow-lg shadow-orange-950/40' : 'bg-gray-800/70 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}
                  >
                    <RiderIcon discipline={discipline} className="w-10 h-10" />
                    <span className="text-sm font-semibold text-center">{riderDisciplineLabels[discipline]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Úroveň jezdce</label>
            <select value={form.rider_level} onChange={event => setForm({ ...form, rider_level: event.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500">
              {Object.entries(riderLevelLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Na čem jezdím</label>
            <p className="text-gray-500 text-xs mb-2">Napiš si vybavení úplně po svém. Každou položku můžeš dát na nový řádek.</p>
            <textarea
              value={form.equipment_text}
              onChange={event => setForm({ ...form, equipment_text: event.target.value })}
              rows={5}
              maxLength={500}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              placeholder={'Trek Roscoe 8\nSkateboard 8.25"\nBMX Wethepeople\nFreestyle koloběžka'}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">O mně</label>
            <textarea value={form.bio} onChange={event => setForm({ ...form, bio: event.target.value })} rows={3} maxLength={300} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Napiš pár vět o sobě a svém ježdění." />
          </div>

          <h2 className="text-orange-400 font-semibold text-lg mt-2">Sociální sítě</h2>

          <input value={form.strava_url} onChange={event => setForm({ ...form, strava_url: event.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Odkaz na Stravu" />
          <input value={form.instagram_url} onChange={event => setForm({ ...form, instagram_url: event.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" placeholder="Odkaz na Instagram" />

          {message && <p className="text-orange-400 text-sm">{message}</p>}

          <button onClick={handleSave} disabled={saving} className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50">
            {saving ? 'Ukládám...' : 'Uložit profil'}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mt-6 flex flex-col gap-4">
          <h2 className="text-white font-semibold text-lg">Správa dat</h2>
          <p className="text-gray-400 text-sm">Můžeš si stáhnout kopii údajů uložených k tvému účtu nebo požádat o jejich odstranění.</p>

          <button onClick={handleExport} className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition">Exportovat moje data</button>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-red-900 text-red-300 py-3 rounded-xl font-semibold hover:bg-red-800 transition">Smazat účet a všechna data</button>
          ) : (
            <div className="bg-red-950 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-red-300 text-sm font-semibold">Opravdu chceš smazat účet? Tato akce je nevratná.</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50">{deleting ? 'Mažu...' : 'Ano, smazat'}</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-700 text-white py-2 rounded-xl text-sm font-semibold">Zrušit</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
