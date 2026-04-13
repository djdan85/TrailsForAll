'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ImageUploadProps {
  onUpload: (url: string) => void
  label?: string
}

export default function ImageUpload({ onUpload, label = 'Nahrát obrázek' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Obrázek je příliš velký. Maximální velikost je 5 MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Nahraj prosím obrázek.')
      return
    }

    setUploading(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id || 'anonymous'
    const fileName = `${userId}/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, { upsert: true })

    if (error) {
      alert('Chyba při nahrávání: ' + error.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    setPreview(urlData.publicUrl)
    onUpload(urlData.publicUrl)
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-gray-400 text-sm block">{label}</label>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Náhled"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            onClick={() => {
              setPreview(null)
              onUpload('')
            }}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-red-700 transition"
          >
            Odstranit
          </button>
        </div>
      )}

      <label className={`flex items-center justify-center w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
        uploading
          ? 'border-gray-600 text-gray-600'
          : 'border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-500'
      }`}>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? 'Nahrávám...' : preview ? 'Změnit obrázek' : 'Klikni nebo přetáhni obrázek'}
      </label>

      <p className="text-gray-600 text-xs">Maximální velikost: 5 MB. Formáty: JPG, PNG, WebP.</p>
    </div>
  )
}