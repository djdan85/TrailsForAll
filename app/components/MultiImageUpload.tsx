'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

export interface UploadedPhoto {
  url: string
  is_primary: boolean
  display_order: number
}

interface MultiImageUploadProps {
  value: UploadedPhoto[]
  onChange: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
}

export default function MultiImageUpload({
  value,
  onChange,
  maxPhotos = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img')
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width)
            width = MAX
          } else {
            width = Math.round((width * MAX) / height)
            height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas error'))
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Blob error'))
            resolve(blob)
          },
          'image/jpeg',
          0.8
        )
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (value.length + files.length > maxPhotos) {
        setError(`Maximálně ${maxPhotos} fotek`)
        return
      }
      setError(null)
      setUploading(true)
      try {
        const newPhotos: UploadedPhoto[] = []
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          if (file.size > 20 * 1024 * 1024) {
            setError(`Soubor ${file.name} je příliš velký (max 20 MB)`)
            continue
          }
          const compressed = await compressImage(file)
          const formData = new FormData()
          formData.append('file', compressed, file.name)
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) throw new Error('Upload selhal')
          const data = await res.json()
          newPhotos.push({
            url: data.url,
            is_primary: value.length === 0 && i === 0,
            display_order: value.length + i,
          })
        }
        onChange([...value, ...newPhotos])
      } catch (err) {
        setError('Chyba při nahrávání, zkus to znovu')
        console.error(err)
      } finally {
        setUploading(false)
      }
    },
    [value, onChange, maxPhotos]
  )

  const setPrimary = (index: number) => {
    const updated = value.map((p, i) => ({ ...p, is_primary: i === index }))
    onChange(updated)
  }

  const removePhoto = (index: number) => {
    const updated = value
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, display_order: i }))
    if (value[index].is_primary && updated.length > 0) {
      updated[0].is_primary = true
    }
    onChange(updated)
  }

  const movePhoto = (from: number, to: number) => {
    const updated = [...value]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(updated.map((p, i) => ({ ...p, display_order: i })))
  }

  return (
    <div className="space-y-4">
      <label
        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading || value.length >= maxPhotos
            ? 'border-gray-600 bg-gray-700 cursor-not-allowed'
            : 'border-orange-500 bg-gray-800 hover:bg-gray-700'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading || value.length >= maxPhotos}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Nahrávám...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-orange-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">
              Klikni nebo přetáhni fotky ({value.length}/{maxPhotos})
            </span>
            <span className="text-xs text-gray-400">JPG, PNG, WEBP — max 20 MB každá</span>
          </div>
        )}
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((photo, index) => (
            <div
              key={photo.url}
              className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                photo.is_primary ? 'border-orange-500' : 'border-gray-700'
              }`}
            >
              <div className="relative w-full h-24">
                <Image
                  src={photo.url}
                  alt={`Fotka ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              {photo.is_primary && (
                <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  Hlavní
                </div>
              )}

              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  title="Smazat"
                >
                  ×
                </button>
              </div>

              <div className="bg-black/60 flex items-center justify-between px-1.5 py-1 gap-1">
                {!photo.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    className="text-white text-xs hover:text-orange-400"
                    title="Nastavit jako hlavní"
                  >
                    ★ Hlavní
                  </button>
                )}
                <div className="flex gap-1 ml-auto">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => movePhoto(index, index - 1)}
                      className="text-white text-xs hover:text-orange-400"
                      title="Posunout vlevo"
                    >
                      ←
                    </button>
                  )}
                  {index < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => movePhoto(index, index + 1)}
                      className="text-white text-xs hover:text-orange-400"
                      title="Posunout vpravo"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}