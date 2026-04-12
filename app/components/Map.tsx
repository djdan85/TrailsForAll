'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useRouter } from 'next/navigation'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function Map({ trails }: { trails: any[] }) {
  const router = useRouter()

  const difficultyLabel: any = {
    easy: 'Lehka',
    medium: 'Stredni',
    hard: 'Tezka',
    expert: 'Expert'
  }

  return (
    <MapContainer
      center={[49.8175, 15.4730]}
      zoom={8}
      style={{ height: '100vh', width: '100%' }}
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
              <h3>{trail.name}</h3>
              <p>{trail.location_name}</p>
              <p>{difficultyLabel[trail.difficulty]} - {trail.length_km} km</p>
              <button
                onClick={() => router.push(`/trail/${trail.id}`)}
                style={{ background: 'orange', color: 'white', padding: '4px 8px', borderRadius: '6px', marginTop: '8px', cursor: 'pointer' }}
              >
                Zobrazit detail
              </button>
            </div>
           </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}