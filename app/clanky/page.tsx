'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Clanky() {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single()
        setProfile(profileData)
      }

      setArticles(articlesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const categoryLabel: any = {
    tipy: 'Tipy na traily',
    novinky: 'Novinky',
    navody: 'Návody',
    reportaze: 'Reportáže',
  }

  const categoryColor: any = {
    tipy: 'bg-green-900 text-green-400',
    novinky: 'bg-blue-900 text-blue-400',
    navody: 'bg-purple-900 text-purple-400',
    reportaze: 'bg-orange-900 text-orange-400',
  }

  const filtered = filter === 'all'
    ? articles
    : articles.filter(a => a.category === filter)

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  const canWrite = profile?.role && ['editor', 'admin', 'superadmin'].includes(profile.role)

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">Články</h1>
          {canWrite && (
            <button
              onClick={() => router.push('/clanky/novy')}
              className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
            >
              Napsat článek
            </button>
          )}
        </div>
        <p className="text-gray-400 mb-6">Tipy, novinky a reportáže z bikerského světa.</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'tipy', 'novinky', 'navody', 'reportaze'].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === c
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {c === 'all' ? 'Vše' : categoryLabel[c]}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">Zatím žádné články.</p>
            {canWrite && (
              <button
                onClick={() => router.push('/clanky/novy')}
                className="text-orange-500 hover:text-orange-400 transition"
              >
                Napiš první článek →
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((article) => (
            <div
              key={article.id}
              onClick={() => router.push(`/clanky/${article.slug}`)}
              className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-800 transition"
            >
              {article.cover_url && (
                <img
                  src={article.cover_url}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${categoryColor[article.category]}`}>
                    {categoryLabel[article.category]}
                  </span>
                  <span className="text-gray-600 text-xs">{formatDate(article.published_at || article.created_at)}</span>
                </div>
                <h2 className="text-white font-bold text-xl mb-2">{article.title}</h2>
                {article.excerpt && (
                  <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
