'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '../components/ImageUpload'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('../components/RouteMap'), { ssr: false })
const TrailMap = dynamic(() => import('../components/TrailMap'), { ssr: false })

const ADMIN_EMAIL = 'dalibor.pasek@gmail.com'
const DEFAULT_TRAIL_COLOR = '#f97316'

const trailTypeOptions = [
  { value: 'singltrek', label: '🚵 Singltrek / Trail' },
  { value: 'pumptrack', label: '🔁 Pumptrack' },
  { value: 'skatepark', label: '🛹 Skatepark' },
  { value: 'bikepark', label: '🏔️ Bikepark' },
  { value: 'crosscountry', label: '🛤️ Cross-country' },
]

const skillLevelOptions = [
  { value: 'zacatecnik', label: '🟢 Začátečník' },
  { value: 'pokrocily', label: '🔵 Pokročilý biker' },
  { value: 'zkuseny', label: '🟠 Zkušený biker' },
  { value: 'zabijak', label: '⚫ Zabiják BIKER' },
]

const trailTypeLabel: { [key: string]: string } = {
  singltrek: '🚵 Singltrek',
  pumptrack: '🔁 Pumptrack',
  skatepark: '🛹 Skatepark',
  bikepark: '🏔️ Bikepark',
  crosscountry: '🛤️ Cross-country',
}

const skillLevelLabel: { [key: string]: string } = {
  zacatecnik: '🟢 Začátečník',
  pokrocily: '🔵 Pokročilý',
  zkuseny: '🟠 Zkušený',
  zabijak: '⚫ Zabiják',
  easy: '🟢 Lehká',
  medium: '🟡 Střední',
  hard: '🔴 Těžká',
  expert: '⚫ Expert',
}

const statusLabel: { [key: string]: string } = {
  pending: 'Čeká na schválení',
  approved: 'Schváleno',
  published: 'Publikováno',
  rejected: 'Zamítnuto',
  deleted: 'Smazáno',
  draft: 'Koncept',
}

const categoryLabel: { [key: string]: string } = {
  tipy: 'Tipy na traily',
  novinky: 'Novinky',
  navody: 'Návody',
  reportaze: 'Reportáže',
}

const categoryColor: { [key: string]: string } = {
  tipy: 'bg-green-900 text-green-400',
  novinky: 'bg-blue-900 text-blue-400',
  navody: 'bg-purple-900 text-purple-400',
  reportaze: 'bg-orange-900 text-orange-400',
}

const colorOptions = [
  { label: 'Zelená', value: '#22c55e' },
  { label: 'Modrá', value: '#3b82f6' },
  { label: 'Červená', value: '#ef4444' },
  { label: 'Černá', value: '#111827' },
  { label: 'Žlutá', value: '#eab308' },
  { label: 'Oranžová', value: '#f97316' },
  { label: 'Bílá', value: '#ffffff' },
]

export default function Admin() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [trails, setTrails] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [newMembers, setNewMembers] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [tab, setTab] = useState<'trails' | 'reviews' | 'articles' | 'members' | 'photos'>('trails')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'deleted'>('pending')
  const [loading, setLoading] = useState(true)
  const [editingTrail, setEditingTrail] = useState<any>(null)
  const [editRoutePoints, setEditRoutePoints] = useState<[number, number][]>([])
  const [gpxPreviewKey, setGpxPreviewKey] = useState(0)

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

      if (
        !profileData ||
        (!['moderator', 'admin', 'superadmin'].includes(profileData.role) &&
          data.user.email !== ADMIN_EMAIL)
      ) {
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

    const { data: articlesData } = await supabase
      .from('articles')
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

    const { data: photosData } = await supabase
      .from('trail_photos')
      .select('*, trails(name)')
      .order('created_at', { ascending: false })

    setTrails(trailsData || [])
    setReviews(reviewsData || [])
    setArticles(articlesData || [])
    setUsers(usersData || [])
    setNewMembers(membersData || [])
    setPhotos(photosData || [])
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

  const updateArticleStatus = async (id: string, status: string) => {
    const updateData: any = { status }

    if (status === 'published') {
      updateData.published_at = new Date().toISOString()
    }

    await supabase.from('articles').update(updateData).eq('id', id)
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

  const deleteArticlePermanently = async (id: string) => {
    if (!confirm('Opravdu chceš trvale smazat tento článek? Tato akce je nevratná.')) return
    await supabase.from('articles').delete().eq('id', id)
    fetchAll()
  }

  const deletePhoto = async (id: string) => {
    if (!confirm('Opravdu chceš smazat tuto fotku?')) return
    await supabase.from('trail_photos').delete().eq('id', id)
    fetchAll()
  }

  const setPrimaryPhoto = async (photo: any) => {
    await supabase.from('trail_photos').update({ is_primary: false }).eq('trail_id', photo.trail_id)
    await supabase.from('trail_photos').update({ is_primary: true }).eq('id', photo.id)
    await supabase.from('trails').update({ photo_url: photo.url }).eq('id', photo.trail_id)
    fetchAll()
  }

  const saveTrailEdit = async () => {
    const lat = editRoutePoints.length > 0 ? editRoutePoints[0][0] : parseFloat(editingTrail.lat)
    const lng = editRoutePoints.length > 0 ? editRoutePoints[0][1] : parseFloat(editingTrail.lng)

    const { error } = await supabase
      .from('trails')
      .update({
        name: editingTrail.name,
        description: editingTrail.description,
        trail_type: editingTrail.trail_type,
        skill_level: editingTrail.skill_level,
        length_km: parseFloat(editingTrail.length_km),
        location_name: editingTrail.location_name,
        lat,
        lng,
        photo_url: editingTrail.photo_url || null,
        maps_url: editingTrail.maps_url || null,
        website_url: editingTrail.website_url || null,
        is_official: editingTrail.is_official,
        gpx_color: editingTrail.gpx_color || DEFAULT_TRAIL_COLOR,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', editingTrail.id)

    if (!error) {
      setEditingTrail(null)
      setEditRoutePoints([])
      fetchAll()
    }
  }

  const isSuper =
    user?.email === ADMIN_EMAIL ||
    profile?.role === 'admin' ||
    profile?.role === 'superadmin'

  const filteredTrails =
    filter === 'all'
      ? trails.filter((t) => t.status !== 'deleted')
      : trails.filter((t) => t.status === filter)

  const pendingArticles = articles.filter((a) => a.status === 'pending')

  const formatDate = (date: string) => {
    if (!date) return null

    return new Date(date).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const photosByTrail = photos.reduce((acc: any, photo: any) => {
    const trailId = photo.trail_id

    if (!acc[trailId]) {
      acc[trailId] = {
        trailName: photo.trails?.name || 'Neznámý trail',
        trailId,
        photos: [],
      }
    }

    acc[trailId].photos.push(photo)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-orange-500 text-xl">Načítám...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin panel</h1>
            <p className="text-gray-400 text-sm mt-1">Správa trailů, recenzí a členů.</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                isSuper ? 'bg-orange-900 text-orange-300' : 'bg-blue-900 text-blue-300'
              }`}
            >
              {profile?.role === 'superadmin'
                ? 'Superadmin'
                : profile?.role === 'admin'
                  ? 'Admin'
                  : 'Moderátor'}
            </span>

            {isSuper && (
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
              >
                👥 Uživatelé ({users.length})
              </button>
            )}
          </div>
        </div>

        {/* Statistiky */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-orange-500">
              {trails.filter((t) => t.status === 'pending').length}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Ke schválení</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-green-400">
              {trails.filter((t) => t.status === 'approved').length}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Schválených</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-yellow-400">
              {reviews.filter((r) => r.status === 'pending').length}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Recenzí</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{photos.length}</p>
            <p className="text-gray-400 text-xs mt-0.5">Fotek</p>
          </div>
        </div>

        {/* Taby */}
        <div className="flex gap-2 mb-6 bg-gray-900 rounded-2xl p-1.5 overflow-x-auto">
          {[
            { key: 'trails', label: '🚵 Traily', count: trails.filter((t) => t.status === 'pending').length },
            { key: 'reviews', label: '⭐ Recenze', count: reviews.filter((r) => r.status === 'pending').length },
            { key: 'articles', label: '📝 Články', count: pendingArticles.length },
            { key: 'photos', label: '📷 Fotky', count: photos.length },
            { key: 'members', label: '👥 Noví členové', count: newMembers.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
                tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}

              {t.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    tab === t.key ? 'bg-orange-600' : 'bg-gray-700'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Články */}
        {tab === 'articles' && (
          <div className="flex flex-col gap-4">
            {articles.length === 0 && <p className="text-gray-400">Žádné články.</p>}

            {articles.map((article) => (
              <div
                key={article.id}
                className={`rounded-2xl p-5 ${
                  article.status === 'deleted' ? 'bg-red-950 border border-red-900' : 'bg-gray-900'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {article.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            categoryColor[article.category]
                          }`}
                        >
                          {categoryLabel[article.category]}
                        </span>
                      )}

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          article.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-400'
                            : article.status === 'published'
                              ? 'bg-green-900 text-green-400'
                              : article.status === 'draft'
                                ? 'bg-gray-700 text-gray-400'
                                : article.status === 'deleted'
                                  ? 'bg-red-900 text-red-400'
                                  : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {statusLabel[article.status]}
                      </span>
                    </div>

                    <h2 className="text-white font-bold text-lg">{article.title}</h2>

                    {article.excerpt && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>

                  {article.cover_url && (
                    <img
                      src={article.cover_url}
                      alt={article.title}
                      className="w-20 h-16 object-cover rounded-xl ml-4 flex-shrink-0"
                    />
                  )}
                </div>

                <p className="text-gray-600 text-xs mb-4">Vytvořeno: {formatDate(article.created_at)}</p>

                <div className="flex gap-2 flex-wrap">
                  {article.status === 'deleted' ? (
                    <>
                      <button
                        onClick={() => updateArticleStatus(article.id, 'draft')}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition"
                      >
                        ♻️ Obnovit
                      </button>

                      {isSuper && (
                        <button
                          onClick={() => deleteArticlePermanently(article.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition"
                        >
                          🗑 Trvale smazat
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {article.status !== 'published' && (
                        <button
                          onClick={() => updateArticleStatus(article.id, 'published')}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition"
                        >
                          ✅ Publikovat
                        </button>
                      )}

                      {article.status === 'published' && (
                        <button
                          onClick={() => updateArticleStatus(article.id, 'draft')}
                          className="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
                        >
                          📄 Vrátit do konceptu
                        </button>
                      )}

                      {article.status !== 'rejected' && (
                        <button
                          onClick={() => updateArticleStatus(article.id, 'rejected')}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-700 transition"
                        >
                          ❌ Zamítnout
                        </button>
                      )}

                      <button
                        onClick={() => router.push(`/clanky/${article.slug}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
                      >
                        👁 Zobrazit
                      </button>

                      <button
                        onClick={() => updateArticleStatus(article.id, 'deleted')}
                        className="bg-red-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-900 transition"
                      >
                        🗑 Do koše
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Fotky */}
        {tab === 'photos' && (
          <div className="flex flex-col gap-6">
            {Object.keys(photosByTrail).length === 0 && <p className="text-gray-400">Žádné fotky.</p>}

            {Object.values(photosByTrail).map((group: any) => (
              <div key={group.trailId} className="bg-gray-900 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold text-lg">{group.trailName}</h2>
                  <span className="text-gray-400 text-sm">{group.photos.length} fotek</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {group.photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className={`relative rounded-xl overflow-hidden border-2 transition ${
                        photo.is_primary ? 'border-orange-500' : 'border-gray-700'
                      }`}
                    >
                      <img src={photo.url} alt="Fotka" className="w-full h-28 object-cover" />

                      {photo.is_primary && (
                        <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          Hlavní
                        </div>
                      )}

                      <div className="absolute top-1 right-1">
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>

                      {!photo.is_primary ? (
                        <button
                          onClick={() => setPrimaryPhoto(photo)}
                          className="w-full bg-black/60 text-white text-xs py-1.5 hover:bg-orange-500/80 transition"
                        >
                          ★ Nastavit jako hlavní
                        </button>
                      ) : (
                        <div className="w-full bg-orange-500/20 text-orange-400 text-xs py-1.5 text-center">
                          ✓ Hlavní fotka
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Noví členové */}
        {tab === 'members' && (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-sm">Bikeři registrovaní v posledních 7 dnech.</p>

            {newMembers.length === 0 && <p className="text-gray-400">Žádní noví členové.</p>}

            {newMembers.map((member) => (
              <div key={member.id} className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold">{member.username || member.email?.split('@')[0]}</h3>
                  <p className="text-gray-400 text-sm">{member.email}</p>
                  {member.city && <p className="text-gray-500 text-xs">{member.city}</p>}
                </div>

                <p className="text-gray-600 text-xs">{formatDate(member.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Traily */}
        {tab === 'trails' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['pending', 'all', 'approved', 'rejected', 'deleted'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                    filter === f ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {f === 'all'
                    ? 'Všechny'
                    : f === 'pending'
                      ? `⏳ Ke schválení (${trails.filter((t) => t.status === 'pending').length})`
                      : f === 'approved'
                        ? '✅ Schválené'
                        : f === 'rejected'
                          ? '❌ Zamítnuté'
                          : `🗑 Koš (${trails.filter((t) => t.status === 'deleted').length})`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {filteredTrails.length === 0 && <p className="text-gray-400">Žádné traily.</p>}

              {filteredTrails.map((trail) => (
                <div
                  key={trail.id}
                  className={`rounded-2xl overflow-hidden ${
                    trail.status === 'deleted' ? 'bg-red-950 border border-red-900' : 'bg-gray-900'
                  }`}
                >
                  {editingTrail?.id === trail.id ? (
                    <div className="p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-orange-500 font-bold text-lg">✏️ Editace trailu</h2>

                        <button
                          onClick={() => {
                            setEditingTrail(null)
                            setEditRoutePoints([])
                          }}
                          className="text-gray-500 hover:text-white text-sm transition"
                        >
                          ✕ Zrušit
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Název</label>
                          <input
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            value={editingTrail.name}
                            onChange={(e) => setEditingTrail({ ...editingTrail, name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Lokalita</label>
                          <input
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            value={editingTrail.location_name}
                            onChange={(e) => setEditingTrail({ ...editingTrail, location_name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Popis</label>
                        <textarea
                          className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          rows={3}
                          value={editingTrail.description}
                          onChange={(e) => setEditingTrail({ ...editingTrail, description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Typ místa</label>
                          <select
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            value={editingTrail.trail_type || 'singltrek'}
                            onChange={(e) => setEditingTrail({ ...editingTrail, trail_type: e.target.value })}
                          >
                            {trailTypeOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Pro koho</label>
                          <select
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            value={editingTrail.skill_level || 'zacatecnik'}
                            onChange={(e) => setEditingTrail({ ...editingTrail, skill_level: e.target.value })}
                          >
                            {skillLevelOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Délka (km)</label>
                          <input
                            className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            type="number"
                            value={editingTrail.length_km}
                            onChange={(e) => setEditingTrail({ ...editingTrail, length_km: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-gray-400 text-xs mb-1 block">Viditelnost</label>
                          <div className="flex gap-2 h-[42px]">
                            <button
                              type="button"
                              onClick={() => setEditingTrail({ ...editingTrail, is_official: true })}
                              className={`flex-1 rounded-xl text-xs font-semibold transition ${
                                editingTrail.is_official
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              }`}
                            >
                              ✅ Oficiální
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingTrail({ ...editingTrail, is_official: false })}
                              className={`flex-1 rounded-xl text-xs font-semibold transition ${
                                !editingTrail.is_official
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                              }`}
                            >
                              ☠️ Neoficiální
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Barva GPX trasy — admin ji může upravit vždy */}
                      <div>
                        <label className="text-gray-400 text-xs mb-2 block">Barva GPX trasy na mapě</label>

                        <div className="flex gap-2 flex-wrap">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => {
                                setEditingTrail({ ...editingTrail, gpx_color: color.value })
                                setGpxPreviewKey((k) => k + 1)
                              }}
                              title={color.label}
                              style={{
                                backgroundColor: color.value,
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                border:
                                  (editingTrail.gpx_color || DEFAULT_TRAIL_COLOR) === color.value
                                    ? '4px solid #f97316'
                                    : '4px solid transparent',
                                outline: '2px solid #374151',
                                cursor: 'pointer',
                                transform:
                                  (editingTrail.gpx_color || DEFAULT_TRAIL_COLOR) === color.value
                                    ? 'scale(1.15)'
                                    : 'scale(1)',
                                transition: 'all 0.15s',
                              }}
                            />
                          ))}
                        </div>

                        <p className="text-gray-600 text-xs mt-1">
                          Vybraná:{' '}
                          {colorOptions.find((c) => c.value === (editingTrail.gpx_color || DEFAULT_TRAIL_COLOR))
                            ?.label || 'Oranžová'}
                        </p>

                        <p className="text-gray-600 text-xs mt-1">
                          Admin může barvu upravit kdykoliv. U ostatních typů tras je výchozí barva oranžová.
                        </p>
                      </div>

                      {/* Poloha */}
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Poloha startu — klikni na mapu</label>

                        <RouteMap
                          points={
                            editRoutePoints.length > 0
                              ? editRoutePoints
                              : editingTrail.lat && editingTrail.lng
                                ? [[parseFloat(editingTrail.lat), parseFloat(editingTrail.lng)]]
                                : []
                          }
                          onChange={setEditRoutePoints}
                        />

                        {editRoutePoints.length > 0 && (
                          <p className="text-gray-600 text-xs mt-1">
                            📍 {editRoutePoints[0][0].toFixed(5)}, {editRoutePoints[0][1].toFixed(5)}
                          </p>
                        )}
                      </div>

                      {/* GPX preview — jen když má trail GPX */}
                      {editingTrail.gpx_url && (
                        <div>
                          <label className="text-gray-400 text-xs mb-2 block">Preview GPX trasy</label>

                          <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                            <TrailMap
                              key={gpxPreviewKey}
                              lat={parseFloat(editingTrail.lat)}
                              lng={parseFloat(editingTrail.lng)}
                              name={editingTrail.name}
                              isOfficial={editingTrail.is_official}
                              gpxUrl={editingTrail.gpx_url}
                              gpxColor={editingTrail.gpx_color || DEFAULT_TRAIL_COLOR}
                            />
                          </div>
                        </div>
                      )}

                      <ImageUpload
                        label="Fotografie"
                        onUpload={(url) => setEditingTrail({ ...editingTrail, photo_url: url })}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          value={editingTrail.maps_url || ''}
                          onChange={(e) => setEditingTrail({ ...editingTrail, maps_url: e.target.value })}
                          placeholder="Odkaz na Mapy.com"
                        />

                        <input
                          className="bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          value={editingTrail.website_url || ''}
                          onChange={(e) => setEditingTrail({ ...editingTrail, website_url: e.target.value })}
                          placeholder="Web místa"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={saveTrailEdit}
                          className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
                        >
                          💾 Uložit změny
                        </button>

                        <button
                          onClick={() => {
                            setEditingTrail(null)
                            setEditRoutePoints([])
                          }}
                          className="bg-gray-700 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-gray-600 transition"
                        >
                          Zrušit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h2 className="text-white font-bold text-lg">{trail.name}</h2>

                            {trail.is_official ? (
                              <span className="text-xs px-2 py-0.5 rounded-lg border border-green-400/30 text-green-400 bg-gray-800">
                                ✅ Oficiální
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-lg border border-orange-400/30 text-orange-400 bg-gray-800">
                                ☠️ Neoficiální
                              </span>
                            )}

                            {trail.gpx_url && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <span
                                  style={{
                                    backgroundColor: trail.gpx_color || DEFAULT_TRAIL_COLOR,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                  }}
                                />
                                GPX
                              </span>
                            )}
                          </div>

                          <p className="text-gray-400 text-sm">{trail.location_name}</p>
                        </div>

                        <span
                          className={`ml-3 shrink-0 text-xs px-3 py-1 rounded-full font-semibold ${
                            trail.status === 'pending'
                              ? 'bg-yellow-900 text-yellow-400'
                              : trail.status === 'approved'
                                ? 'bg-green-900 text-green-400'
                                : trail.status === 'deleted'
                                  ? 'bg-red-900 text-red-400'
                                  : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {statusLabel[trail.status]}
                        </span>
                      </div>

                      {trail.photo_url && (
                        <img src={trail.photo_url} alt={trail.name} className="w-full h-36 object-cover rounded-xl mb-3" />
                      )}

                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{trail.description}</p>

                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg">
                          {trailTypeLabel[trail.trail_type] || '🚵 Singltrek'}
                        </span>

                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg">
                          {skillLevelLabel[trail.skill_level || trail.difficulty] || '🟢 Začátečník'}
                        </span>

                        <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg">
                          📏 {trail.length_km} km
                        </span>

                        {trail.region && (
                          <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-lg">
                            🗺️ {trail.region}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 mb-4">
                        <p className="text-gray-600 text-xs">
                          Přidal: {trail.created_by_username || 'Neznámý'} — {formatDate(trail.created_at)}
                        </p>

                        {trail.approved_at && (
                          <p className="text-gray-600 text-xs">
                            Schválil: {trail.approved_by_username || 'Admin'} — {formatDate(trail.approved_at)}
                          </p>
                        )}

                        {trail.updated_at && (
                          <p className="text-gray-600 text-xs">
                            Upravil: {trail.updated_by_username || 'Admin'} — {formatDate(trail.updated_at)}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {trail.status === 'deleted' ? (
                          <>
                            <button
                              onClick={() => updateTrailStatus(trail.id, 'pending')}
                              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition"
                            >
                              ♻️ Obnovit
                            </button>

                            {isSuper && (
                              <button
                                onClick={() => deleteTrailPermanently(trail.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition"
                              >
                                🗑 Trvale smazat
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {trail.status !== 'approved' && (
                              <button
                                onClick={() => updateTrailStatus(trail.id, 'approved')}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition"
                              >
                                ✅ Schválit
                              </button>
                            )}

                            {trail.status !== 'rejected' && (
                              <button
                                onClick={() => updateTrailStatus(trail.id, 'rejected')}
                                className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-700 transition"
                              >
                                ❌ Zamítnout
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingTrail({ ...trail, gpx_color: trail.gpx_color || DEFAULT_TRAIL_COLOR })
                                setEditRoutePoints(
                                  trail.lat && trail.lng ? [[parseFloat(trail.lat), parseFloat(trail.lng)]] : []
                                )
                                setGpxPreviewKey((k) => k + 1)
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
                            >
                              ✏️ Upravit
                            </button>

                            <button
                              onClick={() => updateTrailStatus(trail.id, 'deleted')}
                              className="bg-red-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-900 transition"
                            >
                              🗑 Do koše
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab: Recenze */}
        {tab === 'reviews' && (
          <div className="flex flex-col gap-4">
            {reviews.filter((r) => r.status !== 'deleted').length === 0 && (
              <p className="text-gray-400">Žádné recenze.</p>
            )}

            {reviews.map((review) => (
              <div
                key={review.id}
                className={`rounded-2xl p-5 ${
                  review.status === 'deleted' ? 'bg-red-950 border border-red-900' : 'bg-gray-900'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-orange-500 font-semibold">{'⭐'.repeat(review.rating)}</span>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(review.created_at)}</p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      review.status === 'pending'
                        ? 'bg-yellow-900 text-yellow-400'
                        : review.status === 'approved'
                          ? 'bg-green-900 text-green-400'
                          : review.status === 'deleted'
                            ? 'bg-red-900 text-red-400'
                            : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {statusLabel[review.status]}
                  </span>
                </div>

                <p className="text-white text-sm mb-4">{review.comment}</p>

                <div className="flex gap-2 flex-wrap">
                  {review.status === 'deleted' ? (
                    <>
                      <button
                        onClick={() => updateReviewStatus(review.id, 'pending')}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition"
                      >
                        ♻️ Obnovit
                      </button>

                      {isSuper && (
                        <button
                          onClick={() => deleteReviewPermanently(review.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-700 transition"
                        >
                          🗑 Trvale smazat
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition"
                        >
                          ✅ Schválit
                        </button>
                      )}

                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-yellow-700 transition"
                        >
                          ❌ Zamítnout
                        </button>
                      )}

                      <button
                        onClick={() => updateReviewStatus(review.id, 'deleted')}
                        className="bg-red-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-900 transition"
                      >
                        🗑 Do koše
                      </button>
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