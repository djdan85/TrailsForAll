'use client'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useEffect, useState } from 'react'

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

  let size = 44
  let fontSize = 15

  if (count >= 10) {
    size = 50
    fontSize = 16
  }

  if (count >= 50) {
    size = 58
    fontSize = 17
  }

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: #f97316;
        color: white;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: ${fontSize}px;
        box-shadow: 0 5px 16px rgba(0,0,0,0.4);
      ">
        ${count}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

const locationIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 26px;
      height: 26px;
      border-radius: 9999px;
      background: #ef4444;
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
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
        bottom: '128px',
        left: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <button
        type="button"
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
        type="button"
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

function MapResizeWatcher({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [fullscreen, map])

  return null
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

function TrailMarkerCluster({ trails }: { trails: any[] }) {
  const map = useMap()

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
      maxClusterRadius: 90,
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

      marker.bindPopup(`
        <div style="min-width: 180px;">
          <h3 style="font-weight: bold; margin: 0 0 4px;">${trailName}</h3>
          <p style="color: #888; font-size: 12px; margin: 0 0 4px;">${locationName}</p>
          <p style="font-size: 12px; margin: 0 0 4px;">${typeLabel}</p>
          <p style="font-size: 12px; margin: 0 0 4px;">${skillLabel} — ${length}</p>

          ${
            !trail.is_official
              ? '<p style="font-size: 11px; color: #aaa; margin: 2px 0;">☠️ Neoficiální trail</p>'
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
  }, [map, trails])

  return null
}

export default function Map({ trails }: { trails: any[] }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!fullscreen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [fullscreen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
    <div
      style={{
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : undefined,
        height: fullscreen ? '100dvh' : '100%',
        width: fullscreen ? '100vw' : '100%',
        zIndex: fullscreen ? 99999 : 'auto',
        background: '#020617',
      }}
    >
      <MapContainer
        center={[49.8175, 15.4730]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <TrailMarkerCluster trails={trails} />

        <UserLocationMarker coords={userLocation} />

        <ZoomControl />
        <FlyToLocation coords={userLocation} />
        <MapResizeWatcher fullscreen={fullscreen} />
      </MapContainer>

      {/* Tlačítko celá obrazovka / minimalizace */}
      <button
        type="button"
        onClick={() => setFullscreen((prev) => !prev)}
        title={fullscreen ? 'Zavřít celou obrazovku' : 'Zobrazit na celou obrazovku'}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 9999,
          width: fullscreen ? '42px' : '44px',
          height: fullscreen ? '42px' : '44px',
          borderRadius: '12px',
          background: fullscreen ? '#111827' : 'rgba(0,0,0,0.78)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.85)',
          fontSize: fullscreen ? '22px' : '20px',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {fullscreen ? '✕' : '⛶'}
      </button>

      {/* Sbalitelná legenda */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.78)',
          borderRadius: '12px',
          color: 'white',
          overflow: 'hidden',
          boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
          maxWidth: fullscreen ? '190px' : '170px',
        }}
      >
        <button
          type="button"
          onClick={() => setLegendOpen((prev) => !prev)}
          style={{
            width: '100%',
            background: 'transparent',
            color: 'white',
            border: 'none',
            padding: '8px 10px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span>Legenda</span>
          <span style={{ color: '#f97316' }}>{legendOpen ? '▲' : '▼'}</span>
        </button>

        {legendOpen && (
          <div
            style={{
              padding: '0 10px 9px',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            <p style={{ fontWeight: 'bold', marginTop: '2px', marginBottom: '2px', color: '#f97316' }}>
              Typy míst
            </p>
            <p>🚵 Singltrek</p>
            <p>🔁 Pumptrack</p>
            <p>🛹 Skatepark</p>
            <p>🏔️ Bikepark</p>
            <p>🛤️ Cross-country</p>

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.2)',
                marginTop: '5px',
                paddingTop: '5px',
              }}
            >
              <p style={{ fontWeight: 'bold', marginBottom: '2px', color: '#f97316' }}>Mapa</p>
              <p>Oranžové číslo = více trailů v oblasti</p>
              {fullscreen && <p>✕ = zavřít celou obrazovku</p>}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onTouchEnd={(e) => {
          e.preventDefault()
          handleLocate()
        }}
        onClick={handleLocate}
        disabled={locating}
        title="Moje poloha"
        style={{
          position: 'absolute',
          bottom: fullscreen ? '24px' : '78px',
          left: '10px',
          zIndex: 9999,
          width: '46px',
          height: '46px',
          borderRadius: '9999px',
          background: locating ? '#555' : '#f97316',
          color: 'white',
          border: '3px solid white',
          fontWeight: 'bold',
          fontSize: '20px',
          cursor: locating ? 'not-allowed' : 'pointer',
          boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {locating ? '…' : '📍'}
      </button>
    </div>
  )
}