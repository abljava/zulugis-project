import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView() {
  const center = useMemo(() => ({ lat: 55.79395355381227, lng: 38.43277215957642 }), []);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}