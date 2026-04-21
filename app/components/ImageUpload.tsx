'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onUpload: (url: string) => void
  label?: string
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

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Chyba při nahrávání: ' + data.error)
        setUploading(false)
        return
      }

      setFileInfo(`Původní: ${originalSize} KB → Nahráno a optimalizováno`)
      setPreview(data.url)
      onUpload(data.url)
    } catch (error) {
      alert('Chyba při nahrávání.')
    }

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
        {uploading ? 'Nahrávám na Cloudinary...' : preview ? 'Změnit obrázek' : 'Klikni nebo přetáhni obrázek'}
      </label>

      <p className="text-gray-600 text-xs">Obrázek bude automaticky optimalizován. Max. 20 MB.</p>
    </div>
  )
}

