'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ImageUpload from '../../../components/ImageUpload'

const Editor = dynamic(() => import('../../../components/Editor'), { ssr: false })

export default function UpravitClanek() {
  const { slug } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [article, setArticle] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    cover_url: '',
    category: 'novinky',
    content: '',
  })

  const categoryLabel: any = {
    tipy: 'Tipy na traily',
    novinky: 'Novinky',
    navody: 'Návody',
    reportaze: 'Reportáže',
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/login'); return }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      if (!profileData || !['moderator', 'admin', 'superadmin'].includes(profileData.role)) {
        router.push('/'); return
      }

      const { data: articleData } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!articleData) { router.push('/clanky'); return }

      // Moderátor může upravovat jen své články
      if (profileData.role === 'moderator' && articleData.created_by !== userData.user.id) {
        router.push('/'); return
      }

      setUser(userData.user)
      setProfile(profileData)
      setArticle(articleData)
      setForm({
        title: articleData.title || '',
        excerpt: articleData.excerpt || '',
        cover_url: articleData.cover_url || '',
        category: articleData.category || 'novinky',
        content: articleData.content || '',
      })
      setLoading(false)
    }

    if (slug) fetchData()
  }, [slug])

  const handleSave = async (status?: string) => {
    setSaving(true)
    setMessage('')

    const updateData: any = {
      title: form.title,
      excerpt: form.excerpt,
      cover_url: form.cover_url || null,
      category: form.category,
      content: form.content,
    }

    if (status) {
      updateData.status = status
      if (status === 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', article.id)

    if (error) {
      setMessage('Chyba: ' + error.message)
    } else {
      setMessage('Článek byl uložen! ✅')
      setTimeout(() => router.push('/clanky'), 1500)
    }

    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-orange-500 text-xl">Načítám...</p>
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

        <h1 className="text-3xl font-bold text-white mb-2">Upravit článek</h1>
        <p className="text-gray-400 mb-8">Editace: <span className="text-white">{article?.title}</span></p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Název článku</label>
            <input
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Název článku"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Perex</label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm({...form, excerpt: e.target.value})}
              rows={2}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Krátký popis článku..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Titulní obrázek</label>
            {form.cover_url && (
              <div className="mb-3">
                <img
                  src={form.cover_url}
                  alt="Titulní obrázek"
                  className="w-full h-48 object-cover rounded-xl mb-2"
                />
                <button
                  onClick={() => setForm({...form, cover_url: ''})}
                  className="text-red-400 text-xs hover:text-red-300 transition"
                >
                  Odstranit obrázek
                </button>
              </div>
            )}
            <ImageUpload
              label="Nahrát nový titulní obrázek"
              onUpload={url => setForm({...form, cover_url: url})}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Kategorie</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            >
              {Object.entries(categoryLabel).map(([key, val]) => (
                <option key={key} value={key}>{val as string}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Obsah článku</label>
            <Editor
              content={form.content}
              onChange={content => setForm({...form, content})}
            />
          </div>

          {message && (
            <p className={`text-sm ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition disabled:opacity-50"
            >
              {saving ? 'Ukládám...' : '💾 Uložit'}
            </button>
            <button
              onClick={() => handleSave('pending')}
              disabled={saving}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {saving ? 'Ukládám...' : '📤 Odeslat ke schválení'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}