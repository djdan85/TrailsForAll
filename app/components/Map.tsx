'use client'

import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const NAVBAR_HEIGHT_PX = 72
const MAP_OVERLAY_Z_INDEX = 999999
const CONTROL_Z_INDEX = 1000000

const difficultyColor: { [key: string]: string } = {
  zacatecnik: '#22c55e',
  easy: '#22c55e',
  pokrocily: '#2563eb',
  medium: '#2563eb',
  zkuseny: '#ef4444',
  hard: '#ef4444',
  zabijak: '#111827',
  expert: '#111827',
}

const getTrailLineColor = (trail: any) => {
  return difficultyColor[trail.skill_level || trail.difficulty] || '#f97316'
}

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
  zkuseny: '🔴 Zkušený biker',
  zabijak: '⚫ Zabijácký BIKER',
  easy: '🟢 Lehká',
  medium: '🔵 Střední',
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

const parseGpxToLatLngs = (gpxText: string): [number, number][] => {
  try {
    const parser = new DOMParser()
    const xml = parser.parseFromString(gpxText, 'application/xml')

    const points = Array.from(xml.querySelectorAll('trkpt, rtept'))

    return points
      .map((point) => {
        const lat = parseFloat(point.getAttribute('lat') || '')
        const lng = parseFloat(point.getAttribute('lon') || '')

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null

        return [lat, lng] as [number, number]
      })
      .filter(Boolean) as [number, number][]
  } catch {
    return []
  }
}

const parseGeoJsonToLatLngs = (geojson: any): [number, number][] => {
  try {
    const data = typeof geojson === 'string' ? JSON.parse(geojson) : geojson

    if (!data) return []

    if (data.type === 'FeatureCollection') {
      const firstLine = data.features?.find(
        (feature: any) =>
          feature.geometry?.type === 'LineString' ||
          feature.geometry?.type === 'MultiLineString'
      )

      return parseGeoJsonToLatLngs(firstLine)
    }

    if (data.type === 'Feature') {
      return parseGeoJsonToLatLngs(data.geometry)
    }

    if (data.type === 'LineString') {
      return data.coordinates
        .map((coord: any) => [coord[1], coord[0]] as [number, number])
        .filter((coord: any) => !Number.isNaN(coord[0]) && !Number.isNaN(coord[1]))
    }

    if (data.type === 'MultiLineString') {
      return data.coordinates
        .flat()
        .map((coord: any) => [coord[1], coord[0]] as [number, number])
        .filter((coord: any) => !Number.isNaN(coord[0]) && !Number.isNaN(coord[1]))
    }

    return []
  } catch {
    return []
  }
}

const parseCoordinatesToLatLngs = (coordinates: any): [number, number][] => {
  try {
    const data = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates

    if (!Array.isArray(data)) return []

    return data
      .map((coord: any) => {
        if (Array.isArray(coord)) {
          const first = parseFloat(coord[0])
          const second = parseFloat(coord[1])

          if (Number.isNaN(first) || Number.isNaN(second)) return null

          // Jestli jsou data ve formátu [lng, lat], otočíme je.
          if (Math.abs(first) > 50 && Math.abs(second) < 50) {
            return [second, first] as [number, number]
          }

          return [first, second] as [number, number]
        }

        if (coord?.lat && (coord.lng || coord.lon)) {
          const lat = parseFloat(coord.lat)
          const lng = parseFloat(coord.lng ?? coord.lon)

          if (Number.isNaN(lat) || Number.isNaN(lng)) return null

          return [lat, lng] as [number, number]
        }

        return null
      })
      .filter(Boolean) as [number, number][]
  } catch {
    return []
  }
}

const getTrailLatLngs = async (trail: any): Promise<[number, number][]> => {
  if (trail.route_geojson || trail.geojson) {
    const geoJsonPoints = parseGeoJsonToLatLngs(trail.route_geojson || trail.geojson)
    if (geoJsonPoints.length > 1) return geoJsonPoints
  }

  if (trail.coordinates || trail.route_coordinates) {
    const coordinatePoints = parseCoordinatesToLatLngs(trail.coordinates || trail.route_coordinates)
    if (coordinatePoints.length > 1) return coordinatePoints
  }

  if (trail.gpx_data || trail.gpx) {
    const gpxPoints = parseGpxToLatLngs(trail.gpx_data || trail.gpx)
    if (gpxPoints.length > 1) return gpxPoints
  }

  const gpxUrl = trail.gpx_url || trail.gpx_file_url || trail.gpx_file || trail.gpx_path

  if (gpxUrl) {
    try {
      const response = await fetch(gpxUrl)
      const text = await response.text()
      const gpxPoints = parseGpxToLatLngs(text)

      if (gpxPoints.length > 1) return gpxPoints
    } catch {
      return []
    }
  }

  return []
}

function TrailLines({ trails }: { trails: any[] }) {
  const map = useMap()

  useEffect(() => {
    let cancelled = false
    const lineGroup = L.layerGroup()

    const renderLines = async () => {
      for (const trail of trails) {
        const latLngs = await getTrailLatLngs(trail)

        if (cancelled) return
        if (latLngs.length < 2) continue

        const trailName = escapeHtml(trail.name)
        const locationName = escapeHtml(trail.location_name)
        const typeLabel = trailTypeLabel[trail.trail_type] || '🚵 Singltrek'
        const skillLabel = skillLevelLabel[trail.skill_level || trail.difficulty] || 'Obtížnost neuvedena'
        const length = trail.length_km ? `${escapeHtml(trail.length_km)} km` : 'Délka neuvedena'
        const lineColor = getTrailLineColor(trail)

        const polyline = L.polyline(latLngs, {
          color: lineColor,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        })

        polyline.bindPopup(`
          <div style="min-width: 180px;">
            <h3 style="font-weight: bold; margin: 0 0 4px;">${trailName}</h3>
            <p style="color: #888; font-size: 12px; margin: 0 0 4px;">${locationName}</p>
            <p style="font-size: 12px; margin: 0 0 4px;">${typeLabel}</p>
            <p style="font-size: 12px; margin: 0 0 4px;">${skillLabel} — ${length}</p>

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

        polyline.on('mouseover', () => {
          polyline.setStyle({
            weight: 7,
            opacity: 1,
          })
        })

        polyline.on('mouseout', () => {
          polyline.setStyle({
            weight: 5,
            opacity: 0.9,
          })
        })

        lineGroup.addLayer(polyline)
      }

      if (!cancelled) {
        lineGroup.addTo(map)
      }
    }

    renderLines()

    return () => {
      cancelled = true
      lineGroup.remove()
    }
  }, [map, trails])

  return null
}

function ZoomControl({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap()

  return (
    <div
      style={{
        position: 'absolute',
        bottom: fullscreen ? '136px' : '190px',
        left: '10px',
        zIndex: CONTROL_Z_INDEX,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        pointerEvents: 'auto',
      }}
    >
      <button type="button" onClick={() => map.zoomIn()} style={{
        background: 'white',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: '8px 8px 0 0',
        width: '34px',
        height: '34px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}>+</button>

      <button type="button" onClick={() => map.zoomOut()} style={{
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}>−</button>
    </div>
  )
}

function MapResizeWatcher({ fullscreen }: { fullscreen: boolean }) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 300)

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const mapContent = (
    <div
      style={{
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? `${NAVBAR_HEIGHT_PX}px` : undefined,
        left: fullscreen ? 0 : undefined,
        right: fullscreen ? 0 : undefined,
        bottom: fullscreen ? 0 : undefined,
        height: fullscreen ? `calc(100dvh - ${NAVBAR_HEIGHT_PX}px)` : '100%',
        width: fullscreen ? '100vw' : '100%',
        zIndex: fullscreen ? MAP_OVERLAY_Z_INDEX : 'auto',
        background: '#020617',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      <MapContainer
        center={[49.8175, 15.4730]}
        zoom={8}
        style={{
          height: '100%',
          width: '100%',
          zIndex: 1,
        }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <TrailLines trails={trails} />
        <TrailMarkerCluster trails={trails} />
        <UserLocationMarker coords={userLocation} />

        <ZoomControl fullscreen={fullscreen} />
        <FlyToLocation coords={userLocation} />
        <MapResizeWatcher fullscreen={fullscreen} />
      </MapContainer>

      <button
        type="button"
        onClick={() => setFullscreen((prev) => !prev)}
        title={fullscreen ? 'Zavřít celou obrazovku' : 'Zobrazit na celou obrazovku'}
        style={{
          position: 'absolute',
          bottom: fullscreen ? '78px' : '136px',
          left: '10px',
          zIndex: CONTROL_Z_INDEX,
          width: '46px',
          height: '46px',
          borderRadius: '9999px',
          background: fullscreen ? '#111827' : 'rgba(0,0,0,0.78)',
          color: 'white',
          border: '3px solid white',
          fontSize: fullscreen ? '22px' : '20px',
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 3px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: 'auto',
        }}
      >
        {fullscreen ? '✕' : '⛶'}
      </button>

      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: CONTROL_Z_INDEX,
          background: 'rgba(0,0,0,0.78)',
          borderRadius: '12px',
          color: 'white',
          overflow: 'hidden',
          boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
          maxWidth: fullscreen ? '190px' : '170px',
          pointerEvents: 'auto',
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
              <p style={{ fontWeight: 'bold', marginBottom: '2px', color: '#f97316' }}>Obtížnost tras</p>
              <p>🟢 Lehká / Začátečník</p>
              <p>🔵 Střední / Pokročilý</p>
              <p>🔴 Těžká / Zkušený</p>
              <p>⚫ Expert</p>
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
          bottom: fullscreen ? '20px' : '78px',
          left: '10px',
          zIndex: CONTROL_Z_INDEX,
          width: '46px',
          height: '46px',
          borderRadius: '9999px',
          background: locating ? '#e5e7eb' : 'white',
          color: locating ? '#6b7280' : '#111827',
          border: '2px solid rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          fontSize: '20px',
          cursor: locating ? 'not-allowed' : 'pointer',
          boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        {locating ? '…' : '📍'}
      </button>
    </div>
  )

  if (fullscreen && mounted) {
    return (
      <>
        <div style={{ height: '100%', width: '100%' }} />
        {createPortal(mapContent, document.body)}
      </>
    )
  }

  return mapContent
}