'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
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

function LocateButton({ onLocate }: { onLocate: (pos: [number, number]) => void }) {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        map.flyTo(coords, 13, { animate: true, duration: 1.5 })
        onLocate(coords)
        setLocating(false)
      },
      () => {
        alert('Nepodařilo se získat polohu. Zkontroluj oprávnění v prohlížeči.')
        setLocating(false)
      }
    )
  }

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '10px',
        zIndex: 1000,
        background: locating ? '#555' : '#f97316',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '10px 16px',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: locating ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {locating ? '📡 Hledám...' : '📍 Moje poloha'}
    </button>
  )
}

export default function Map({ trails }: { trails: any[] }) {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  const difficultyLabel: any = {
    easy: 'Lehká',
    medium: 'Střední',
    hard: 'Těžká',
    expert: 'Expert'
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[49.8175, 15.4730]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trails.map((trail) => (
          <Marker
            key={trail.id}
            position={[trail.lat, trail.lng]}
            icon={icon}
          >
            <Popup>
              <div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{trail.name}</h3>
                <p style={{ color: '#888', fontSize: '12px' }}>{trail.location_name}</p>
                <p style={{ fontSize: '12px' }}>{difficultyLabel[trail.difficulty]} — {trail.length_km} km</p>
                <button
                  onClick={() => router.push(`/trail/${trail.id}`)}
                  style={{ background: '#f97316', color: 'white', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', cursor: 'pointer', border: 'none' }}
                >
                  Zobrazit detail
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={userLocation} icon={locationIcon}>
            <Popup>
              <p style={{ fontWeight: 'bold' }}>Tvoje poloha</p>
            </Popup>
          </Marker>
        )}
        <LocateButton onLocate={setUserLocation} />
      </MapContainer>
    </div>
  )
}