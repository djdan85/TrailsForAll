'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function ClanekDetail() {
  const { slug } = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: articleData } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, id')
          .eq('id', userData.user.id)
          .single()
        setProfile(profileData)
      }

      setArticle(articleData)
      setLoading(false)
    }

    if (slug) fetchData()
  }, [slug])

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

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  const canEdit = profile && (
    profile.id === article?.created_by ||
    ['admin', 'superadmin'].includes(profile.role)
  )

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
    </div>
  )

  if (!article) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white text-xl">Článek nenalezen.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-10">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => router.back()}
          className="text-orange-500 hover:text-orange-400 mb-6 flex items-center gap-2"
        >
          ← Zpět
        </button>

        {article.cover_url && (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-64 object-cover rounded-2xl mb-8"
          />
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${categoryColor[article.category]}`}>
            {categoryLabel[article.category]}
          </span>
          <span className="text-gray-600 text-xs">
            {formatDate(article.published_at || article.created_at)}
          </span>
          {canEdit && (
            <button
              onClick={() => router.push(`/clanky/edit/${article.id}`)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition ml-auto"
            >
              Upravit
            </button>
          )}
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>

        {article.excerpt && (
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">{article.excerpt}</p>
        )}

        <div
          className="prose prose-invert max-w-none text-gray-300"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

      </div>
    </div>
  )
}