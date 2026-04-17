'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'

const ADMIN_EMAIL = 'dalibor.pasek@gmail.com'

export default function Admin() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [trails, setTrails] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [newMembers, setNewMembers] = useState<any[]>([])
  const [tab, setTab] = useState<'trails' | 'reviews' | 'members'>('trails')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'deleted'>('pending')
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

      if (!profileData || (!['moderator', 'admin', 'superadmin'].includes(profileData.role) && data.user.email !== ADMIN_EMAIL)) {
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
      .from('trails_with_profiles')
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

    const today = new Date()
    today.setDate(today.getDate() - 7)
    const { data: membersData } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    setTrails(trailsData || [])
    setReviews(reviewsData || [])
    setUsers(usersData || [])
    setNewMembers(membersData || [])
    setLoading(false)
  }

  const updateTrailStatus = async (id: string, status: string) => {
    const updateData: any = { status }
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = user.id
    }
    await supabase.from('trails').update(updateData).eq('id', id)
    fetchAll()
  }

  const updateReviewStatus = async (id: string, status: string) => {
    await supabase.from('reviews').update({ status }).eq('id', id)
    fetchAll()
  }

  const deleteTrailPermanently = async (id: string) => {
    if (!confirm('Opravdu chceš trvale smazat tento trail? Tato akce je nevratná.')) return
    await supabase.from('trails').delete().eq('id', id)
    fetchAll()
  }

  const deleteReviewPermanently = async (id: string) => {
    if (!confirm('Opravdu chceš trvale smazat tuto recenzi? Tato akce je nevratná.')) return
    await supabase.from('reviews').delete().eq('id', id)
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
        is_official: editingTrail.is_official,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', editingTrail.id)

    if (!error) {
      setEditingTrail(null)
      fetchAll()
    }
  }

  const isSuper = user?.email === ADMIN_EMAIL || profile?.role === 'admin' || profile?.role === 'superadmin'

  const filteredTrails = filter === 'all'
    ? trails.filter(t => t.status !== 'deleted')
    : trails.filter(t => t.status === filter)

  const statusLabel: any = {
    pending: 'Čeká na schválení',
    approved: 'Schváleno',
    rejected: 'Zamítnuto',
    deleted: 'Smazáno'
  }

  const difficultyLabel: any = {
    easy: 'Lehká',
    medium: 'Střední',
    hard: 'Těžká',
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
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Admin panel</h1>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${isSuper ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'}`}>
            {isSuper ? 'Admin' : 'Moderátor'}
          </span>
        </div>
        <p className="text-gray-400 mb-4">Správa trailů, recenzí a členů.</p>

        {isSuper && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-gray-800 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
            >
              Správa uživatelů ({users.length})
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setTab('trails')} className={`px-6 py-2 rounded-xl font-semibold transition ${tab === 'trails' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Traily ({trails.filter(t => t.status === 'pending').length})
          </button>
          <button onClick={() => setTab('reviews')} className={`px-6 py-2 rounded-xl font-semibold transition ${tab === 'reviews' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Recenze ({reviews.filter(r => r.status === 'pending').length})
          </button>
          <button onClick={() => setTab('members')} className={`px-6 py-2 rounded-xl font-semibold transition ${tab === 'members' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Noví členové ({newMembers.length})
          </button>
        </div>

        {tab === 'members' && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-400 text-sm">Bikeři registrovaní v posledních 7 dnech.</p>
            {newMembers.length === 0 && <p className="text-gray-400">Žádní noví členové.</p>}
            {newMembers.map((member) => (
              <div key={member.id} className="bg-gray-900 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">{member.username || member.email?.split('@')[0]}</h3>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                    {member.city && <p className="text-gray-400 text-sm">{member.city}</p>}
                  </div>
                  <p className="text-gray-600 text-xs">{formatDate(member.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'trails' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['pending', 'all', 'approved', 'rejected', 'deleted'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {f === 'all' ? 'Všechny' :
                   f === 'pending' ? `Ke schválení (${trails.filter(t => t.status === 'pending').length})` :
                   f === 'approved' ? 'Schválené' :
                   f === 'rejected' ? 'Zamítnuté' :
                   `Koš (${trails.filter(t => t.status === 'deleted').length})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {filteredTrails.length === 0 && <p className="text-gray-400">Žádné traily.</p>}
              {filteredTrails.map((trail) => (
                <div key={trail.id} className={`rounded-2xl p-6 ${trail.status === 'deleted' ? 'bg-red-950 border border-red-900' : 'bg-gray-900'}`}>
                  {editingTrail?.id === trail.id ? (
                    <div className="flex flex-col gap-3">
                      <h2 className="text-orange-500 font-bold text-lg mb-1">Editace trailu</h2>
                      <input className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" value={editingTrail.name} onChange={e => setEditingTrail({...editingTrail, name: e.target.value})} placeholder="Název" />
                      <textarea className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" rows={3} value={editingTrail.description} onChange={e => setEditingTrail({...editingTrail, description: e.target.value})} placeholder="Popis" />
                      <select className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" value={editingTrail.difficulty} onChange={e => setEditingTrail({...editingTrail, difficulty: e.target.value})}>
                        <option value="easy">Lehká</option>
                        <option value="medium">Střední</option>
                        <option value="hard">Těžká</option>
                        <option value="expert">Expert</option>
                      </select>
                      <input className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" value={editingTrail.length_km} onChange={e => setEditingTrail({...editingTrail, length_km: e.target.value})} placeholder="Délka (km)" type="number" />
                      <input className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" value={editingTrail.location_name} onChange={e => setEditingTrail({...editingTrail, location_name: e.target.value})} placeholder="Lokalita" />
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">Souřadnice</label>
                        <input className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 w-full" value={editingTrail.coords || `${editingTrail.lat}, ${editingTrail.lng}`} onChange={e => handleCoords(e.target.value)} placeholder="49.7890581, 13.4054814" />
                      </div>

                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Typ trailu</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingTrail({...editingTrail, is_official: true})}
                            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${editingTrail.is_official ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                          >
                            ✅ Oficiální
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTrail({...editingTrail, is_official: false})}
                            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${!editingTrail.is_official ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                          >
                            ☠️ Neoficiální
                          </button>
                        </div>
                      </div>

                      <ImageUpload label="Fotografie trailu" onUpload={url => setEditingTrail({...editingTrail, photo_url: url})} />
                      <input className="bg-gray-800 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500" value={editingTrail.maps_url || ''} onChange={e => setEditingTrail({...editingTrail, maps_url: e.target.value})} placeholder="Odkaz na Mapy.com" />
                      <div className="flex gap-3 mt-2">
                        <button onClick={saveTrailEdit} className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm hover:bg-orange-600 transition">Uložit</button>
                        <button onClick={() => setEditingTrail(null)} className="bg-gray-700 text-white px-6 py-2 rounded-xl text-sm hover:bg-gray-600 transition">Zrušit</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h2 className="text-white font-bold text-xl">{trail.name}</h2>
                            {trail.is_official ? (
                              <span className="text-xs px-2 py-0.5 rounded-lg border border-green-400/30 text-green-400 bg-gray-800">
                                ✅ Oficiální
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-lg border border-orange-400/30 text-orange-400 bg-gray-800">
                                ☠️ Neoficiální
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{trail.location_name}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          trail.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                          trail.status === 'approved' ? 'bg-green-900 text-green-400' :
                          trail.status === 'deleted' ? 'bg-red-900 text-red-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {statusLabel[trail.status]}
                        </span>
                      </div>
                      {trail.photo_url && (
                        <img src={trail.photo_url} alt={trail.name} className="w-full h-40 object-cover rounded-xl mb-3" />
                      )}
                      <p className="text-gray-300 text-sm mb-3">{trail.description}</p>
                      <div className="flex gap-3 text-sm text-gray-400 mb-3 flex-wrap">
                        <span>{difficultyLabel[trail.difficulty]}</span>
                        <span>·</span>
                        <span>{trail.length_km} km</span>
                      </div>
                      <div className="flex flex-col gap-1 mb-4">
                        <p className="text-gray-600 text-xs">Přidal: {trail.created_by_username || 'Neznámý'} — {formatDate(trail.created_at)}</p>
                        {trail.approved_at && <p className="text-gray-600 text-xs">Schválil: {trail.approved_by_username || 'Admin'} — {formatDate(trail.approved_at)}</p>}
                        {trail.updated_at && <p className="text-gray-600 text-xs">Upravil: {trail.updated_by_username || 'Admin'} — {formatDate(trail.updated_at)}</p>}
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {trail.status === 'deleted' ? (
                          <>
                            <button onClick={() => updateTrailStatus(trail.id, 'pending')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">Obnovit</button>
                            {isSuper && <button onClick={() => deleteTrailPermanently(trail.id)} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition">Trvale smazat</button>}
                          </>
                        ) : (
                          <>
                            {trail.status !== 'approved' && <button onClick={() => updateTrailStatus(trail.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">Schválit</button>}
                            {trail.status !== 'rejected' && <button onClick={() => updateTrailStatus(trail.id, 'rejected')} className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-700 transition">Zamítnout</button>}
                            <button onClick={() => setEditingTrail({...trail, coords: `${trail.lat}, ${trail.lng}`})} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition">Upravit</button>
                            <button onClick={() => updateTrailStatus(trail.id, 'deleted')} className="bg-red-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-900 transition">Do koše</button>
                          </>
                        )}
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
            {reviews.filter(r => r.status !== 'deleted').length === 0 && <p className="text-gray-400">Žádné recenze.</p>}
            {reviews.map((review) => (
              <div key={review.id} className={`rounded-2xl p-6 ${review.status === 'deleted' ? 'bg-red-950 border border-red-900' : 'bg-gray-900'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-orange-500 font-semibold">{review.rating} hvězdičky</span>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(review.created_at)}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    review.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                    review.status === 'approved' ? 'bg-green-900 text-green-400' :
                    review.status === 'deleted' ? 'bg-red-900 text-red-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {statusLabel[review.status]}
                  </span>
                </div>
                <p className="text-white text-sm mb-4">{review.comment}</p>
                <div className="flex gap-3 flex-wrap">
                  {review.status === 'deleted' ? (
                    <>
                      <button onClick={() => updateReviewStatus(review.id, 'pending')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">Obnovit</button>
                      {isSuper && <button onClick={() => deleteReviewPermanently(review.id)} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition">Trvale smazat</button>}
                    </>
                  ) : (
                    <>
                      {review.status !== 'approved' && <button onClick={() => updateReviewStatus(review.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition">Schválit</button>}
                      {review.status !== 'rejected' && <button onClick={() => updateReviewStatus(review.id, 'rejected')} className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-700 transition">Zamítnout</button>}
                      <button onClick={() => updateReviewStatus(review.id, 'deleted')} className="bg-red-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-900 transition">Do koše</button>
                    </>
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