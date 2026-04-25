'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function ArticleDetail() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchData = async () => {
      console.log('params:', params)
      console.log('slug:', slug)

      if (!slug) {
        setLoading(false)
        return
      }

      const { data: articleData, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()

      console.log('articleData:', articleData)
      console.log('error:', error)

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        setUserId(userData.user.id)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userData.user.id)
          .single()
        setProfile(profileData)
      }

      setArticle(articleData)
      setLoading(false)
    }

    fetchData()
  }, [slug])

  const canEditAll = profile?.role && ['admin', 'superadmin'].includes(profile.role)
  const canEdit = canEditAll || (profile?.role === 'moderator' && article?.created_by === userId)

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

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
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => router.back()}
          className="text-orange-500 hover:text-orange-400 mb-6 flex items-center gap-2 transition"
        >
          ← Zpět
        </button>

        {article.cover_url && (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-64 object-cover rounded-2xl mb-6"
          />
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {article.category && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${categoryColor[article.category]}`}>
              {categoryLabel[article.category]}
            </span>
          )}
          <span className="text-gray-500 text-sm">
            {formatDate(article.published_at || article.created_at)}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-6">{article.title}</h1>

        {article.excerpt && (
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">{article.excerpt}</p>
        )}

        <div
          className="prose prose-invert prose-orange max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        {canEdit && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={() => router.push(`/clanky/${article.slug}/upravit`)}
              className="bg-gray-800 text-gray-300 px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition font-medium"
            >
              ✏️ Upravit článek
            </button>
          </div>
        )}

      </div>
    </div>
  )
}