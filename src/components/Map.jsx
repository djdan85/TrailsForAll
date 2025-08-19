import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Map({ trails }) {
  return (
    <MapContainer center={[50.073658, 14.418540]} zoom={7} style={{ height: '400px', marginBottom: '20px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {trails.map((trail) => (
        <Marker key={trail.id} position={trail.coords}>
          <Popup>{trail.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;