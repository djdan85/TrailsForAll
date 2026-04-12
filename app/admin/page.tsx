'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'dalibor.pasek@gmail.com'

export default function Admin() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [trails, setTrails] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tab, setTab] = useState<'trails' | 'reviews'>('trails')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [loading, setLoading] = useState(true)
  const [editingTrail, setEditingTrail] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (!profileData || (profileData.role !== 'moderator' && profileData.role !== 'admin' && data.user.email !== ADMIN_EMAIL)) {
        router.push('/')
        return
      }

      setUser(data.user)
      setProfile(profileData)
      fetchAll()
    }
    getUser()
  }, [])

  const fetchAll = async () => {
    const { data: trailsData } = await supabase
      .from('trails')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    setTrails(trailsData || [])
    setReviews(reviewsData || [])
    setUsers(usersData || [])
    setLoading(false)
  }

  const updateTrailStatus = async (id: string, status: string) => {
    const updateData: any = { status }
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString()
    }
    await supabase.from('trails').update(updateData).eq('id', id)
    fetchAll()
  }

  const updateReviewStatus = async (id: string, status: string) => {
    await supabase.from('reviews').update({ status }).eq('id', id)
    fetchAll()
  }

  const handleCoords = (val: string) => {
    const parts = val.replace(/[NSns]/g, '').replace(/[EWew]/g, '').split(',')
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim())
      const lng = parseFloat(parts[1].trim())
      if (!isNaN(lat) && !isNaN(lng)) {
        setEditingTrail((prev: any) => ({ ...prev, coords: val, lat: lat.toString(), lng: lng.toString() }))
        return
      }
    }
    setEditingTrail((prev: any) => ({ ...prev, coords: val }))
  }

  const saveTrailEdit = async () => {
    const { error } = await supabase
      .from('trails')
      .update({
        name: editingTrail.name,
        description: editingTrail.description,
        difficulty: editingTrail.difficulty,
        length_km: parseFloat(editingTrail.length_km),
        location_name: editingTrail.location_name,
        lat: parseFloat(editingTrail.lat),
        lng: parseFloat(editingTrail.lng),
        photo_url: editingTrail.photo_url || null,
        maps_url: editingTrail.maps_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingTrail.id)

    if (!error) {
      setEditingTrail(null)
      fetchAll()
    }
  }

  const isSuper = user?.email === ADMIN_EMAIL || profile?.role === 'admin'
  const isModerator = profile?.role === 'moderator'

  const filteredTrails = filter === 'all'
    ? trails
    : trails.filter(t => t.status === filter)

  const statusLabel: any = {
    pending: 'Ceka na schvaleni',
    approved: 'Schvaleno',
    rejected: 'Zamitnuto'
  }

  const difficultyLabel: any = {
    easy: 'Lehka',
    medium: 'Stredni',
    hard: 'Tezka',
    expert: 'Expert'
  }

  const formatDate = (date: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Nacitam...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Admin panel</h1>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${isSuper ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
            {isSuper ? 'Super Admin' : 'Moderator'}
          </span>
        </div>
        <p className="text-gray-400 mb-4">Sprava trailu a recenzi.</p>

        {isSuper && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-gray-800 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
            >
              Sprava uzivatelu ({users.length})
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('trails')}
            className={`px-6 py-2 rounded-xl font-semibold transition ${tab === 'trails' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Traily ({trails.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setTab('reviews')}
            className={`px-6 py-2 rounded-xl font-semibold transition ${tab === 'reviews' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Recenze ({reviews.filter(r => r.status === 'pending').length})
          </button>
        </div>

        {tab === 'trails' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {f === 'all' ? 'Vsechny' : f === 'pending' ? `Ke schvaleni (${trails.filter(t => t.status === 'pending').length})` : f === 'approved' ? 'Schvalene' : 'Zamitnute'}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {filteredTrails.length === 0 && <p className="text-gray-400">Zadne traily.</p>}
              {filteredTrails.map((trail) => (
                <div key={trail.id} className="bg-gray-900 rounded-2xl p-6">
                  {editingTrail?.id === trail.id ? (
                    <div className="flex flex-col gap-3">
                      <h2 className="text-orange-500 font-bold text-lg mb-1">Editace trailu</h2>
                      <input
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        value={editingTrail.name}
                        onChange={e => setEditingTrail({...editingTrail, name: e.target.value})}
                        placeholder="Nazev"
                      />
                      <textarea
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        value={editingTrail.description}
                        onChange={e => setEditingTrail({...editingTrail, description: e.target.value})}
                        placeholder="Popis"
                      />
                      <select
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        value={editingTrail.difficulty}
                        onChange={e => setEditingTrail({...editingTrail, difficulty: e.target.value})}
                      >
                        <option value="easy">Lehka</option>
                        <option value="medium">Stredni</option>
                        <option value="hard">Tezka</option>
                        <option value="expert">Expert</option>
                      </select>
                      <input
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        value={editingTrail.length_km}
                        onChange={e => setEditingTrail({...editingTrail, length_km: e.target.value})}
                        placeholder="Delka (km)"
                        type="number"
                      />
                      <input
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        value={editingTrail.location_name}
                        onChange={e => setEditingTrail({...editingTrail, location_name: e.target.value})}
                        placeholder="Lokalita"
                      />
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">
                          Souradnice
                          <span className="text-gray-600 ml-1">(napr. 49.7890581, 13.4054814)</span>
                        </label>
                        <input
                          className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 w-full"
                          value={editingTrail.coords || `${editingTrail.lat}, ${editingTrail.lng}`}
                          onChange={e => handleCoords(e.target.value)}
                          placeholder="49.7890581, 13.4054814"
                        />
                        {editingTrail.lat && editingTrail.lng && (
                          <p className="text-gray-600 text-xs mt-1">Lat: {editingTrail.lat} / Lng: {editingTrail.lng}</p>
                        )}
                      </div>
                      <input
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        value={editingTrail.photo_url || ''}
                        onChange={e => setEditingTrail({...editingTrail, photo_url: e.target.value})}
                        placeholder="URL fotografie"
                      />
                      <input
                        className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                        value={editingTrail.maps_url || ''}
                        onChange={e => setEditingTrail({...editingTrail, maps_url: e.target.value})}
                        placeholder="Odkaz na Google Maps"
                      />
                      <div className="flex gap-3 mt-2">
                        <button onClick={saveTrailEdit} className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm hover:bg-orange-600 transition">
                          Ulozit
                        </button>
                        <button onClick={() => setEditingTrail(null)} className="bg-gray-700 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-600 transition">
                          Zrusit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-white font-bold text-xl">{trail.name}</h2>
                          <p className="text-gray-400 text-sm">{trail.location_name}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          trail.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                          trail.status === 'approved' ? 'bg-green-900 text-green-400' :
                          'bg-red-900 text-red-400'
                        }`}>
                          {statusLabel[trail.status]}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{trail.description}</p>
                      <div className="flex gap-3 text-sm text-gray-400 mb-3 flex-wrap">
                        <span>{difficultyLabel[trail.difficulty]}</span>
                        <span>·</span>
                        <span>{trail.length_km} km</span>
                        {trail.photo_url && <span>· Foto</span>}
                        {trail.maps_url && <span>· Maps</span>}
                      </div>
                      <div className="flex flex-col gap-1 mb-4">
                        <p className="text-gray-600 text-xs">Pridano: {formatDate(trail.created_at)}</p>
                        {trail.approved_at && <p className="text-gray-600 text-xs">Schvaleno: {formatDate(trail.approved_at)}</p>}
                        {trail.updated_at && <p className="text-gray-600 text-xs">Upraveno: {formatDate(trail.updated_at)}</p>}
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {trail.status !== 'approved' && (
                          <button onClick={() => updateTrailStatus(trail.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">
                            Schvalit
                          </button>
                        )}
                        {trail.status !== 'rejected' && (
                          <button onClick={() => updateTrailStatus(trail.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition">
                            Zamítnout
                          </button>
                        )}
                        {trail.status !== 'pending' && (
                          <button onClick={() => updateTrailStatus(trail.id, 'pending')} className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-600 transition">
                            Vratit cekani
                          </button>
                        )}
                        <button onClick={() => setEditingTrail({...trail, coords: `${trail.lat}, ${trail.lng}`})} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition">
                          Upravit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'reviews' && (
          <div className="flex flex-col gap-4">
            {reviews.length === 0 && <p className="text-gray-400">Zadne recenze.</p>}
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-900 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-orange-500 font-semibold">{review.rating} hvezdicky</span>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(review.created_at)}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    review.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                    review.status === 'approved' ? 'bg-green-900 text-green-400' :
                    'bg-red-900 text-red-400'
                  }`}>
                    {statusLabel[review.status]}
                  </span>
                </div>
                <p className="text-white text-sm mb-4">{review.comment}</p>
                <div className="flex gap-3">
                  {review.status !== 'approved' && (
                    <button onClick={() => updateReviewStatus(review.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">
                      Schvalit
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button onClick={() => updateReviewStatus(review.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition">
                      Zamítnout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}