'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface ImageUploadProps {
  onUpload: (url: string) => void
  label?: string
}

const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement('img')
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => resolve(blob as Blob),
          'image/jpeg',
          quality
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function ImageUpload({ onUpload, label = 'Nahrát obrázek' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      alert('Obrázek je příliš velký. Maximální velikost je 20 MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Nahraj prosím obrázek.')
      return
    }

    setUploading(true)

    const originalSize = (file.size / 1024).toFixed(0)

    const compressed = await compressImage(file)
    const compressedSize = (compressed.size / 1024).toFixed(0)
    setFileInfo(`Původní: ${originalSize} KB → Komprimováno: ${compressedSize} KB`)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id || 'anonymous'
    const fileName = `${userId}/${Date.now()}.jpg`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, compressed, {
        contentType: 'image/jpeg',
        upsert: true
      })

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
              setFileInfo(null)
              onUpload('')
            }}
            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-red-700 transition"
          >
            Odstranit
          </button>
        </div>
      )}

      {fileInfo && (
        <p className="text-green-400 text-xs">{fileInfo}</p>
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
        {uploading ? 'Komprimuji a nahrávám...' : preview ? 'Změnit obrázek' : 'Klikni nebo přetáhni obrázek'}
      </label>

      <p className="text-gray-600 text-xs">Obrázek bude automaticky zkomprimován. Max. 20 MB.</p>
    </div>
  )
}