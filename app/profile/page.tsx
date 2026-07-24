'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import DisciplineCard from '../components/DisciplineCard'
import { riderDisciplines, type RiderDiscipline } from '../components/RiderIcon'

const inputClass = 'w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none transition focus:ring-2 focus:ring-orange-500'

type ProfileForm = {
  username: string
  full_name: string
  city: string
  birth_year: string
  rider_level: string
  disciplines: RiderDiscipline[]
  equipment_text: string
  bio: string
  strava_url: string
  instagram_url: string
  show_in_community: boolean
}

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    username: '',
    full_name: '',
    city: '',
    birth_year: '',
    rider_level: 'beginner',
    disciplines: [],
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
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single()

      if (profile) {
        const savedDisciplines = Array.isArray(profile.disciplines)
          ? profile.disciplines.filter(
              (discipline: string): discipline is RiderDiscipline =>
                riderDisciplines.includes(discipline as RiderDiscipline),
            )
          : profile.primary_discipline && riderDisciplines.includes(profile.primary_discipline as RiderDiscipline)
            ? [profile.primary_discipline as RiderDiscipline]
            : []

        setForm({
          username: profile.username || '',
          full_name: profile.full_name || '',
          city: profile.city || '',
          birth_year: profile.birth_year ? String(profile.birth_year) : '',
          rider_level: profile.rider_level || 'beginner',
          disciplines: savedDisciplines,
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

  const toggleDiscipline = (discipline: RiderDiscipline) => {
    setForm(currentForm => ({
      ...currentForm,
      disciplines: currentForm.disciplines.includes(discipline)
        ? currentForm.disciplines.filter(item => item !== discipline)
        : [...currentForm.disciplines, discipline],
    }))
  }

  const handleSave = async () => {
    if (!form.username.trim()) {
      setMessage('Vyplň prosím přezdívku. Bez ní nelze profil uložit.')
      return
    }

    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      username: form.username.trim(),
      full_name: form.full_name.trim() || null,
      city: form.city.trim() || null,
      birth_year: form.birth_year ? parseInt(form.birth_year, 10) : null,
      rider_level: form.rider_level,
      disciplines: form.disciplines,
      primary_discipline: form.disciplines[0] || 'mtb',
      equipment_text: form.equipment_text.trim() || null,
      bio: form.bio.trim() || null,
      strava_url: form.strava_url.trim() || null,
      instagram_url: form.instagram_url.trim() || null,
      show_in_community: form.show_in_community,
    })

    setMessage(error ? `Chyba: ${error.message}` : 'Profil byl uložen.')
    setSaving(false)
  }

  const handleExport = async () => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: trails } = await supabase.from('trails').select('*').eq('created_by', user.id)
    const { data: reviews } = await supabase.from('reviews').select('*').eq('user_id', user.id)
    const blob = new Blob([JSON.stringify({ profil: profile, traily: trails, recenze: reviews, exportovano: new Date().toISOString() }, null, 2)], { type: 'application/json' })
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
    expert: 'Expert',
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-950"><p className="text-xl text-orange-500">Načítám...</p></div>

  return (
    <div className="min-h-screen bg-gray-950 px-4 pb-10 pt-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">Profil ridera</p>
          <h1 className="mb-2 text-4xl font-bold text-white">Můj profil</h1>
          <p className="text-gray-400">Ukaž komunitě, co jezdíš a co tě baví. Zveřejnění profilu máš stále plně pod kontrolou.</p>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl border border-gray-800 bg-gray-900 p-5 shadow-2xl shadow-black/20 sm:p-7">
          <h2 className="text-lg font-semibold text-orange-400">Soukromí profilu</h2>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-700 bg-gray-800/80 p-4 transition hover:border-orange-500/50">
            <input type="checkbox" checked={form.show_in_community} onChange={event => setForm({ ...form, show_in_community: event.target.checked })} className="mt-1 h-5 w-5 accent-orange-500" />
            <span><span className="block font-semibold text-white">Zobrazovat můj profil v komunitě</span><span className="mt-1 block text-sm text-gray-400">Veřejně se zobrazí jen přezdívka a údaje, které dobrovolně vyplníš. E-mail ani celé jméno se nezveřejní.</span></span>
          </label>

          <h2 className="mt-2 text-lg font-semibold text-orange-400">Základní údaje</h2>
          <div><label className="mb-1 block text-sm text-gray-400">E-mail</label><input value={user?.email || ''} disabled className="w-full cursor-not-allowed rounded-xl bg-gray-800 px-4 py-3 text-gray-500" /></div>
          <div><label className="mb-1 block text-sm text-gray-400">Přezdívka <span className="text-orange-400">(povinná)</span></label><input value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} className={inputClass} placeholder="např. rider_plzen" maxLength={40} /></div>
          <div><label className="mb-1 block text-sm text-gray-400">Jméno a příjmení <span className="text-gray-600">(neveřejné)</span></label><input value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} className={inputClass} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm text-gray-400">Město <span className="text-gray-600">(veřejné)</span></label><input value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} className={inputClass} placeholder="např. Plzeň" /></div>
            <div><label className="mb-1 block text-sm text-gray-400">Rok narození <span className="text-gray-600">(neveřejné)</span></label><input value={form.birth_year} onChange={event => setForm({ ...form, birth_year: event.target.value })} type="number" className={inputClass} placeholder="1990" /></div>
          </div>

          <div className="mt-3 rounded-3xl border border-slate-800 bg-slate-950/45 p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-white">Jezdecký profil</h2>
            <p className="mt-1 text-sm text-slate-400">Vyber všechny disciplíny, které jezdíš. Počet není omezen.</p>
            <p className="mt-2 text-sm font-medium text-orange-400">Vybráno: {form.disciplines.length}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {riderDisciplines.map(discipline => (
                <DisciplineCard
                  key={discipline}
                  discipline={discipline}
                  selected={form.disciplines.includes(discipline)}
                  onSelect={() => toggleDiscipline(discipline)}
                />
              ))}
            </div>
          </div>

          <div><label className="mb-1 block text-sm text-gray-400">Úroveň jezdce</label><select value={form.rider_level} onChange={event => setForm({ ...form, rider_level: event.target.value })} className={inputClass}>{Object.entries(riderLevelLabel).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></div>

          <div>
            <label className="mb-1 block text-lg font-semibold text-white">Na čem jezdím</label>
            <p className="mb-2 text-sm text-gray-500">Napiš vybavení úplně po svém. Každou položku dej na nový řádek.</p>
            <textarea value={form.equipment_text} onChange={event => setForm({ ...form, equipment_text: event.target.value })} rows={5} maxLength={500} className={`${inputClass} resize-y`} placeholder={'Trek Roscoe 8 M/L\nSanta Cruz Nomad\nSkateboard Element 8.25"\nBMX Wethepeople Reason\nFreestyle koloběžka Ethic Pandemonium'} />
            <div className="mt-1 flex justify-between text-xs text-gray-500"><span>Můžeš přidat libovolný počet položek.</span><span>{form.equipment_text.length} / 500</span></div>
          </div>

          <div><label className="mb-1 block text-sm text-gray-400">O mně</label><textarea value={form.bio} onChange={event => setForm({ ...form, bio: event.target.value })} rows={3} maxLength={300} className={inputClass} placeholder="Napiš pár vět o sobě a svém ježdění." /></div>
          <h2 className="mt-2 text-lg font-semibold text-orange-400">Sociální sítě</h2>
          <input value={form.strava_url} onChange={event => setForm({ ...form, strava_url: event.target.value })} className={inputClass} placeholder="Odkaz na Stravu" />
          <input value={form.instagram_url} onChange={event => setForm({ ...form, instagram_url: event.target.value })} className={inputClass} placeholder="Odkaz na Instagram" />
          {message && <p className="text-sm text-orange-400">{message}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">{saving ? 'Ukládám...' : 'Uložit profil'}</button>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white">Správa dat</h2>
          <p className="text-sm text-gray-400">Můžeš si stáhnout kopii údajů uložených k tvému účtu nebo požádat o jejich odstranění.</p>
          <button onClick={handleExport} className="w-full rounded-xl bg-gray-700 py-3 font-semibold text-white transition hover:bg-gray-600">Exportovat moje data</button>
          {!showDeleteConfirm ? <button onClick={() => setShowDeleteConfirm(true)} className="w-full rounded-xl bg-red-900 py-3 font-semibold text-red-300 transition hover:bg-red-800">Smazat účet a všechna data</button> : (
            <div className="flex flex-col gap-3 rounded-xl bg-red-950 p-4"><p className="text-sm font-semibold text-red-300">Opravdu chceš smazat účet? Tato akce je nevratná.</p><div className="flex gap-3"><button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white disabled:opacity-50">{deleting ? 'Mažu...' : 'Ano, smazat'}</button><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl bg-gray-700 py-2 text-sm font-semibold text-white">Zrušit</button></div></div>
          )}
        </div>
      </div>
    </div>
  )
}
