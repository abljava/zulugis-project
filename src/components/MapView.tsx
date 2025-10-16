import React from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMapEvent, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';
import L from 'leaflet';
import { DEFAULT_WMS_LAYER } from '../config';

type ClickInfo = { latlng: L.LatLng } | null;

export default function MapView() {
  const [clickInfo, setClickInfo] = useState<ClickInfo>(null);

  function ClickHandler() {
    useMapEvent('click', (e) => setClickInfo({ latlng: e.latlng }));
    return null;
  }

  const center = useMemo(() => ({ lat: 56.8, lng: 51.1 }), []);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <WMSTileLayer
          url={'/ws'}
          params={{
            service: 'WMS',
            version: '1.3.0',
            request: 'GetMap',
            layers: DEFAULT_WMS_LAYER,
            styles: '',
            format: 'image/png',
            transparent: true,
          }}
          crossOrigin="anonymous"
        />

        <ClickHandler />
        {clickInfo && (
          <Popup position={clickInfo.latlng} eventHandlers={{ remove: () => setClickInfo(null) }}>
            <div>
              <div>Координаты: {clickInfo.latlng.lat.toFixed(6)}, {clickInfo.latlng.lng.toFixed(6)}</div>
              <div>Слой: {DEFAULT_WMS_LAYER}</div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}


