'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const officialIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const unofficialIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const locationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function ZoomControl() {
  const map = useMap()
  return (
    <div style={{
      position: 'absolute',
      bottom: '140px',
      left: '10px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    }}>
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
      >+</button>
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
      >−</button>
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

export default function Map({ trails }: { trails: any[] }) {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)

  const difficultyLabel: any = {
    easy: 'Lehká',
    medium: 'Střední',
    hard: 'Těžká',
    expert: 'Expert'
  }

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
        console.error('Geolocation error:', err)
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
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trails.map((trail) => (
          trail.lat && trail.lng ? (
            <Marker
              key={trail.id}
              position={[trail.lat, trail.lng]}
              icon={trail.is_official ? officialIcon : unofficialIcon}
            >
              <Popup>
                <div>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{trail.name}</h3>
                  <p style={{ color: '#888', fontSize: '12px' }}>{trail.location_name}</p>
                  <p style={{ fontSize: '12px' }}>{difficultyLabel[trail.difficulty]} — {trail.length_km} km</p>
                  {!trail.is_official && (
                    <p style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>☠️ Neoficiální trail</p>
                  )}
                  <button
                    onClick={() => router.push(`/trail/${trail.id}`)}
                    style={{ background: '#f97316', color: 'white', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', cursor: 'pointer', border: 'none' }}
                  >
                    Zobrazit detail
                  </button>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
        {userLocation && (
          <Marker position={userLocation} icon={locationIcon}>
            <Popup>
              <p style={{ fontWeight: 'bold' }}>Tvoje poloha</p>
            </Popup>
          </Marker>
        )}
        <ZoomControl />
        <FlyToLocation coords={userLocation} />
      </MapContainer>

      <button
        onTouchEnd={(e) => { e.preventDefault(); handleLocate() }}
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