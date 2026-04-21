'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  points: [number, number][]
  onChange: (points: [number, number][], region?: string) => void
}

export default function RouteMap({ points, onChange }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const fetchRegion = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=cs`,
        { headers: { 'User-Agent': 'TrailsForAll/1.0' } }
      )
      const data = await res.json()
      const state = data.address?.state || ''
      return state
    } catch {
      return ''
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView([49.75, 13.38], 10)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]
      const region = await fetchRegion(e.latlng.lat, e.latlng.lng)
      onChange([newPoint], region)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (points.length === 0) return

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 18px;
        height: 18px;
        background: #22c55e;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    markerRef.current = L.marker(points[0], { icon }).addTo(map)
  }, [points])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.off('click')
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng]
      const region = await fetchRegion(e.latlng.lat, e.latlng.lng)
      onChange([newPoint], region)
    })
  }, [points, onChange])

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        style={{ height: '380px', borderRadius: '12px', overflow: 'hidden' }}
      />
      <button
        type="button"
        onClick={() => onChange([])}
        className="w-full bg-gray-800 text-red-400 text-sm py-2 rounded-xl hover:bg-gray-700 transition"
      >
        🗑 Zrušit výběr
      </button>
      <p className="text-gray-600 text-xs">
        📍 Klikni na mapu pro umístění startu trailu
      </p>
    </div>
  )
}

