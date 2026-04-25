'use client'

import { useState } from 'react'

interface Props {
  onUpload: (url: string, points: [number, number][]) => void
}

export default function GpxUpload({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const parseGpx = (text: string): [number, number][] => {
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'application/xml')
    const points: [number, number][] = []
    const selectors = ['trkpt', 'rtept', 'wpt']
    for (const selector of selectors) {
      const nodes = xml.querySelectorAll(selector)
      if (nodes.length > 0) {
        nodes.forEach(pt => {
          const lat = parseFloat(pt.getAttribute('lat') || '')
          const lon = parseFloat(pt.getAttribute('lon') || '')
          if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon])
        })
        if (points.length > 0) break
      }
    }
    return points
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.gpx')) {
      alert('Nahraj prosím soubor ve formátu .gpx')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('GPX soubor je příliš velký. Maximum je 5 MB.')
      return
    }

    setUploading(true)

    try {
      const text = await file.text()
      const points = parseGpx(text)

      if (points.length === 0) {
        alert('GPX soubor neobsahuje žádné body trasy. Zkontroluj formát souboru.')
        setUploading(false)
        return
      }

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

      setFileName(file.name)
      onUpload(data.url, points)
    } catch (err) {
      alert('Chyba při zpracování GPX souboru.')
      console.error(err)
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-gray-400 text-sm block">
        GPX soubor
        <span className="text-gray-600 ml-1">(nepovinné)</span>
      </label>

      {fileName && (
        <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">✓ {fileName}</p>
          <button
            onClick={() => {
              setFileName(null)
              onUpload('', [])
            }}
            className="text-red-400 text-xs hover:text-red-300 transition"
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
          accept=".gpx"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? 'Nahrávám GPX...' : fileName ? 'Změnit GPX soubor' : 'Klikni nebo přetáhni .gpx soubor'}
      </label>

      <p className="text-gray-600 text-xs">Max. 5 MB. Trasa se zobrazí na mapě.</p>
      <p className="text-gray-600 text-xs">
        Nemáš GPX? Vytvoř ho zdarma na{' '}
        <button
          type="button"
          onClick={() => window.open('https://gpx.studio', '_blank')}
          className="text-orange-500 hover:text-orange-400 transition"
        >
          gpx.studio
        </button>
      </p>
    </div>
  )
}