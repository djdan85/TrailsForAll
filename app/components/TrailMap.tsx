'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  lat: number
  lng: number
  name: string
  isOfficial: boolean
  gpxUrl?: string
}

export default function TrailMap({ lat, lng, name, isOfficial, gpxUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const [locating, setLocating] = useState(false)

  const parseGpx = (text: string): [number, number][] => {
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'application/xml')
    const trkpts = xml.querySelectorAll('trkpt')
    const points: [number, number][] = []
    trkpts.forEach(pt => {
      const lat = parseFloat(pt.getAttribute('lat') || '')
      const lon = parseFloat(pt.getAttribute('lon') || '')
      if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon])
    })
    return points
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: false }).setView([lat, lng], 14)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const trailColor = isOfficial ? '#22c55e' : '#111827'

    const icon = L.icon({
      iconUrl: isOfficial
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
      iconRetinaUrl: isOfficial
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
        : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    })

    // Pokud máme GPX, stáhneme a zobrazíme trasu
    if (gpxUrl) {
      fetch(gpxUrl)
        .then(res => res.text())
        .then(text => {
          const points = parseGpx(text)
          if (points.length > 0) {
            // Polyline trasy
            const polyline = L.polyline(points, {
              color: isOfficial ? '#f97316' : '#6b7280',
              weight: 4,
              opacity: 0.9
            }).addTo(map)

            // Pin na startu
            L.marker(points[0], { icon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>Start trasy`)

            // Přizpůsob mapu trase
            map.fitBounds(polyline.getBounds(), { padding: [20, 20] })
          }
        })
        .catch(() => {
          // Fallback na pin pokud GPX nejde stáhnout
          L.marker([lat, lng], { icon })
            .addTo(map)
            .bindPopup(`<strong>${name}</strong>`)
            .openPopup()
        })
    } else {
      // Jen pin
      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${name}</strong>`)
        .openPopup()
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng, name, isOfficial, gpxUrl])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Tvůj prohlížeč nepodporuje geolokaci.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        const map = mapRef.current
        if (!map) return

        if (userMarkerRef.current) {
          userMarkerRef.current.remove()
        }

        const userIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })

        userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Tvoje poloha')
          .openPopup()

        map.flyTo([userLat, userLng], 14, { animate: true, duration: 1.5 })
        setLocating(false)
      },
      (err) => {
        if (err.code === 1) alert('Přístup k poloze byl zamítnut.')
        else alert('Polohu se nepodařilo zjistit.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      <button
        onClick={handleLocate}
        disabled={locating}
        onTouchEnd={(e) => { e.preventDefault(); handleLocate() }}
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 9999,
          background: locating ? '#555' : '#f97316',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontWeight: 'bold',
          fontSize: '13px',
          cursor: locating ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
          touchAction: 'manipulation',
        }}
      >
        {locating ? '📡 Hledám...' : '📍 Moje poloha'}
      </button>
    </div>
  )
}