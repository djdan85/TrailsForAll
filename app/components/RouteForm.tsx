'use client'

import { useState } from 'react'
import GpxUpload from './GpxUpload'

export interface RouteData {
  id?: string
  name: string
  skill_level: string
  length_km: string
  surface: string
  gpx_url: string
  description: string
}

interface RouteFormProps {
  routes: RouteData[]
  onChange: (routes: RouteData[]) => void
}

const emptyRoute = (): RouteData => ({
  name: '',
  skill_level: 'zacatecnik',
  length_km: '',
  surface: '',
  gpx_url: '',
  description: '',
})

const skillLabels: Record<string, string> = {
  zacatecnik: '🟢 Začátečník',
  pokrocily: '🔵 Pokročilý',
  zkuseny: '🟠 Zkušený',
  zabijak: '⚫ Zabiják',
}

export default function RouteForm({ routes, onChange }: RouteFormProps) {
  const [expanded, setExpanded] = useState<number | null>(0)

  const addRoute = () => {
    const updated = [...routes, emptyRoute()]
    onChange(updated)
    setExpanded(updated.length - 1)
  }

  const removeRoute = (index: number) => {
    const updated = routes.filter((_, i) => i !== index)
    onChange(updated)
    setExpanded(null)
  }

  const updateRoute = (index: number, field: keyof RouteData, val: string) => {
    const updated = routes.map((r, i) =>
      i === index ? { ...r, [field]: val } : r
    )
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {routes.map((route, index) => (
        <div key={index} className="border border-gray-700 rounded-xl overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 bg-gray-700 cursor-pointer hover:bg-gray-600"
            onClick={() => setExpanded(expanded === index ? null : index)}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-white">
                {route.name || `Trasa ${index + 1}`}
              </span>
              {route.skill_level && (
                <span className="text-sm text-gray-400">
                  {skillLabels[route.skill_level]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeRoute(index)
                }}
                className="text-red-400 hover:text-red-300 text-sm px-2"
              >
                Smazat
              </button>
              <span className="text-gray-400">{expanded === index ? '▲' : '▼'}</span>
            </div>
          </div>

          {expanded === index && (
            <div className="p-4 space-y-4 bg-gray-800">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Název trasy *</label>
                <input
                  type="text"
                  value={route.name}
                  onChange={(e) => updateRoute(index, 'name', e.target.value)}
                  placeholder="např. Červená trasa, Flow trail..."
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Obtížnost *</label>
                  <select
                    value={route.skill_level}
                    onChange={(e) => updateRoute(index, 'skill_level', e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="zacatecnik">🟢 Začátečník</option>
                    <option value="pokrocily">🔵 Pokročilý</option>
                    <option value="zkuseny">🟠 Zkušený</option>
                    <option value="zabijak">⚫ Zabiják</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Délka (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={route.length_km}
                    onChange={(e) => updateRoute(index, 'length_km', e.target.value)}
                    placeholder="např. 3.5"
                    className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Povrch</label>
                <input
                  type="text"
                  value={route.surface}
                  onChange={(e) => updateRoute(index, 'surface', e.target.value)}
                  placeholder="např. hlína, štěrk, asfalt..."
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Popis trasy</label>
                <textarea
                  value={route.description}
                  onChange={(e) => updateRoute(index, 'description', e.target.value)}
                  placeholder="Popis trasy, technické sekce, co čekat..."
                  rows={3}
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">GPX soubor</label>
                {route.gpx_url ? (
                  <div className="flex items-center justify-between bg-gray-700 rounded-xl px-4 py-3">
                    <p className="text-green-400 text-sm">✓ GPX nahráno</p>
                    <button
                      type="button"
                      onClick={() => updateRoute(index, 'gpx_url', '')}
                      className="text-red-400 text-xs hover:text-red-300 transition"
                    >
                      Odstranit
                    </button>
                  </div>
                ) : (
                  <GpxUpload
                    onUpload={(url) => updateRoute(index, 'gpx_url', url)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addRoute}
        className="w-full py-3 border-2 border-dashed border-orange-500 text-orange-500 rounded-xl hover:bg-orange-500/10 transition text-sm font-medium flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span> Přidat trasu
      </button>
    </div>
  )
}