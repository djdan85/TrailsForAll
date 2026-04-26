'use client'

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useState, useEffect } from 'react'

const createTrailIcon = (type: string, isOfficial: boolean) => {
  const color = isOfficial ? '#22c55e' : '#6b7280'

  const icons: { [key: string]: string } = {
    singltrek: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18">🚵</text>
    </svg>`,
    pumptrack: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18">🔁</text>
    </svg>`,
    skatepark: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18">🛹</text>
    </svg>`,
    bikepark: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18">🏔️</text>
    </svg>`,
    crosscountry: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="17" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="24" text-anchor="middle" font-size="18">🛤️</text>
    </svg>`,
  }

  const svg = icons[type] || icons.singltrek

  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount()

  return L.divIcon({
    html: `
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        background: #f97316;
        color: white;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 15px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      ">
        ${count}
      </div>
    `,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

const locationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const trailTypeLabel: { [key: string]: string } = {
  singltrek: '🚵 Singltrek',
  pumptrack: '🔁 Pumptrack',
  skatepark: '🛹 Skatepark',
  bikepark: '🏔️ Bikepark',
  crosscountry: '🛤️ Cross-country',
}

const skillLevelLabel: { [key: string]: string } = {
  zacatecnik: '🟢 Začátečník',
  pokrocily: '🔵 Pokročilý biker',
  zkuseny: '🟠 Zkušený biker',
  zabijak: '⚫ Zabijácký BIKER',
  easy: '🟢 Lehká',
  medium: '🟡 Střední',
  hard: '🔴 Těžká',
  expert: '⚫ Expert',
}

const parseGpx = (text: string): [number, number][] => {
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'application/xml')
  const points: [number, number][] = []

  const selectors = ['trkpt', 'rtept', 'wpt']

  for (const selector of selectors) {
    const nodes = xml.querySelectorAll(selector)

    if (nodes.length > 0) {
      nodes.forEach((pt) => {
        const lat = parseFloat(pt.getAttribute('lat') || '')
        const lon = parseFloat(pt.getAttribute('lon') || '')

        if (!isNaN(lat) && !isNaN(lon)) {
          points.push([lat, lon])
        }
      })

      if (points.length > 0) break
    }
  }

  return points
}

const escapeHtml = (value: any) => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function ZoomControl() {
  const map = useMap()

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '140px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <button
        onClick={() => map.zoomIn()}
        style={{
          background: 'white',
          border: '2px solid rgba(0,0,0,0.2)',
          borderRadius: '8px 8px 0 0',
          width: '34px',
          height: '34px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          color: '#333',
        }}
      >
        +
      </button>

      <button
        onClick={() => map.zoomOut()}
        style={{
          background: 'white',
          border: '2px solid rgba(0,0,0,0.2)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          width: '34px',
          height: '34px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          color: '#333',
        }}
      >
        −
      </button>
    </div>
  )
}

function FlyToLocation({ coords }: { coords: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, { animate: true, duration: 1.5 })
    }
  }, [coords, map])

  return null
}

function UserLocationMarker({ coords }: { coords: [number, number] | null }) {
  const map = useMap()

  useEffect(() => {
    if (!coords) return

    const marker = L.marker(coords, { icon: locationIcon })
      .addTo(map)
      .bindPopup('<p style="font-weight:bold">Tvoje poloha</p>')

    return () => {
      marker.remove()
    }
  }, [coords, map])

  return null
}

function TrailMarkerCluster({
  trails,
  gpxRoutes,
}: {
  trails: any[]
  gpxRoutes: { [trailId: string]: [number, number][] }
}) {
  const map = useMap()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 15,
      maxClusterRadius: 55,
      iconCreateFunction: createClusterIcon,
    })

    trails.forEach((trail) => {
      if (!trail.lat || !trail.lng) return

      const lat = parseFloat(trail.lat)
      const lng = parseFloat(trail.lng)

      if (isNaN(lat) || isNaN(lng)) return

      const marker = L.marker([lat, lng], {
        icon: createTrailIcon(trail.trail_type || 'singltrek', trail.is_official),
      })

      const trailName = escapeHtml(trail.name)
      const locationName = escapeHtml(trail.location_name)
      const typeLabel = trailTypeLabel[trail.trail_type] || '🚵 Singltrek'
      const skillLabel = skillLevelLabel[trail.skill_level || trail.difficulty] || '🟢 Začátečník'
      const length = trail.length_km ? `${escapeHtml(trail.length_km)} km` : 'Délka neuvedena'
      const gpxLoaded = Boolean(gpxRoutes[trail.id])
      const gpxColor = trail.gpx_color || '#f97316'

      marker.bindPopup(`
        <div style="min-width: 180px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${trailName}</h3>
          <p style="color: #888; font-size: 12px; margin: 0 0 4px;">${locationName}</p>
          <p style="font-size: 12px; margin: 0 0 4px;">${typeLabel}</p>
          <p style="font-size: 12px; margin: 0 0 4px;">${skillLabel} — ${length}</p>

          ${
            !trail.is_official
              ? '<p style="font-size: 11px; color: #aaa; margin: 2px 0;">☠️ Neoficiální trail</p>'
              : ''
          }

          ${
            gpxLoaded
              ? `<p style="font-size: 11px; color: ${gpxColor}; margin: 2px 0;">● GPX trasa načtena</p>`
              : ''
          }

          <a
            href="/trail/${trail.id}"
            style="
              display: inline-block;
              background: #f97316;
              color: white;
              padding: 5px 9px;
              border-radius: 6px;
              margin-top: 8px;
              cursor: pointer;
              border: none;
              text-decoration: none;
              font-size: 12px;
              font-weight: 700;
            "
          >
            Zobrazit detail
          </a>
        </div>
      `)

      clusterGroup.addLayer(marker)
    })

    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
    }
  }, [map, trails, gpxRoutes])

  return null
}

export default function Map({ trails }: { trails: any[] }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [gpxRoutes, setGpxRoutes] = useState<{ [trailId: string]: [number, number][] }>({})

  useEffect(() => {
    trails.forEach((trail) => {
      if (trail.gpx_url && !gpxRoutes[trail.id]) {
        fetch(trail.gpx_url)
          .then((res) => res.text())
          .then((text) => {
            const points = parseGpx(text)

            if (points.length > 0) {
              setGpxRoutes((prev) => ({ ...prev, [trail.id]: points }))
            }
          })
          .catch(() => {})
      }
    })
  }, [trails, gpxRoutes])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Tvůj prohlížeč nepodporuje geolokaci.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        setLocating(false)
      },
      (err) => {
        if (err.code === 1) {
          alert('Přístup k poloze byl zamítnut. Povol polohu v nastavení prohlížeče.')
        } else if (err.code === 2) {
          alert('Polohu se nepodařilo zjistit. Zkus to znovu.')
        } else {
          alert('Vypršel čas pro zjištění polohy. Zkus to znovu.')
        }

        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[49.8175, 15.4730]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* GPX trasy */}
        {trails.map((trail) =>
          gpxRoutes[trail.id] ? (
            <Polyline
              key={`gpx-${trail.id}`}
              positions={gpxRoutes[trail.id]}
              pathOptions={{
                color: trail.gpx_color || (trail.is_official ? '#f97316' : '#6b7280'),
                weight: 3,
                opacity: 0.9,
              }}
            />
          ) : null
        )}

        {/* Shlukované markery trailů */}
        <TrailMarkerCluster trails={trails} gpxRoutes={gpxRoutes} />

        <UserLocationMarker coords={userLocation} />

        <ZoomControl />
        <FlyToLocation coords={userLocation} />
      </MapContainer>

      {/* Legenda */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          borderRadius: '10px',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p style={{ fontWeight: 'bold', marginBottom: '2px', color: '#f97316' }}>Typy míst</p>
        <p>🚵 Singltrek</p>
        <p>🔁 Pumptrack</p>
        <p>🛹 Skatepark</p>
        <p>🏔️ Bikepark</p>
        <p>🛤️ Cross-country</p>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '4px', paddingTop: '4px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '2px', color: '#f97316' }}>Barvy tras</p>
          <p><span style={{ color: '#22c55e' }}>━</span> Zelená</p>
          <p><span style={{ color: '#3b82f6' }}>━</span> Modrá</p>
          <p><span style={{ color: '#ef4444' }}>━</span> Červená</p>
          <p><span style={{ color: '#9ca3af' }}>━</span> Černá</p>
          <p><span style={{ color: '#eab308' }}>━</span> Žlutá</p>
          <p><span style={{ color: '#f97316' }}>━</span> Oranžová</p>
          <p><span style={{ color: '#ffffff' }}>━</span> Bílá</p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '4px', paddingTop: '4px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '2px', color: '#f97316' }}>Mapa</p>
          <p>Oranžové číslo = více trailů v oblasti</p>
        </div>
      </div>

      <button
        onTouchEnd={(e) => {
          e.preventDefault()
          handleLocate()
        }}
        onClick={handleLocate}
        disabled={locating}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '10px',
          zIndex: 9999,
          background: locating ? '#555' : '#f97316',
          color: 'white',
          border: '2px solid rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: locating ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {locating ? '📡 Hledám...' : '📍 Moje poloha'}
      </button>
    </div>
  )
}