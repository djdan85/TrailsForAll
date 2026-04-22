'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import ImageUpload from '../../components/ImageUpload'

const Editor = dynamic(() => import('../../components/Editor'), { ssr: false })

export default function NovyClanek() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    cover_url: '',
    category: 'novinky',
    content: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || !['moderator', 'admin', 'superadmin'].includes(profile.role)) {
        router.push('/')
        return
      }
      setUser(data.user)
    }
    getUser()
  }, [])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now()
  }

  const handleSubmit = async (status: string) => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('articles').insert({
      title: form.title,
      slug: generateSlug(form.title),
      excerpt: form.excerpt,
      cover_url: form.cover_url || null,
      category: form.category,
      content: form.content,
      status,
      created_by: user.id,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })

    if (error) setMessage('Chyba: ' + error.message)
    else {
      setMessage(status === 'published' ? 'Článek byl publikován!' : 'Článek byl uložen.')
      setTimeout(() => router.push('/clanky'), 1500)
    }

    setLoading(false)
  }

  const categoryLabel: any = {
    tipy: 'Tipy na traily',
    novinky: 'Novinky',
    navody: 'Návody',
    reportaze: 'Reportáže',
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Nový článek</h1>
        <p className="text-gray-400 mb-8">Vytvoř nový článek pro komunitu.</p>

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

          <ImageUpload
            label="Titulní obrázek článku"
            onUpload={url => setForm(prev => ({ ...prev, cover_url: url }))}
          />

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
            <p className="text-orange-400 text-sm">{message}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition disabled:opacity-50"
            >
              Uložit jako koncept
            </button>
            <button
              onClick={() => handleSubmit('pending')}
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              Odeslat ke schválení
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

