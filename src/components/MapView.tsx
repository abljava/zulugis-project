import React, { useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap, useMapEvent, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DEFAULT_WMS_LAYER } from '../config';

type ClickInfo = { latlng: L.LatLng, html: string } | null;
type WFSFeature = any | null;

function buildGetFeatureInfoUrl(map: L.Map, latlng: L.LatLng, layerName: string): string {
  const size = map.getSize();
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const point = map.latLngToContainerPoint(latlng);

  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetFeatureInfo',
    LAYERS: layerName,
    QUERY_LAYERS: layerName,
    CRS: 'EPSG:3857',
    BBOX: `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`,
    WIDTH: String(size.x),
    HEIGHT: String(size.y),
    I: String(Math.round(point.x)),
    J: String(Math.round(point.y)),
    INFO_FORMAT: 'text/html',
    FEATURE_COUNT: '10',
    STYLES: '',
  });

  return `/ws?${params.toString()}`;
}

function buildWFSGetFeatureUrl(map: L.Map, latlng: L.LatLng, layerName: string): string {
  // Создаем небольшой BBOX вокруг точки клика (примерно 100м)
  const tolerance = 0.001; // ~100 метров в градусах
  const sw = L.latLng(latlng.lat - tolerance, latlng.lng - tolerance);
  const ne = L.latLng(latlng.lat + tolerance, latlng.lng + tolerance);
  
  const params = new URLSearchParams({
    SERVICE: 'WFS',
    VERSION: '1.0.0',
    REQUEST: 'GetFeature',
    TYPENAME: layerName,
    OUTPUTFORMAT: 'application/json',
    BBOX: `${sw.lng},${sw.lat},${ne.lng},${ne.lat},EPSG:4326`,
    MAXFEATURES: '50',
  });

  return `/ws?${params.toString()}`;
}

export default function MapView() {
  const [clickInfo, setClickInfo] = useState<ClickInfo>(null);
  const [wfsFeatures, setWfsFeatures] = useState<WFSFeature>(null);

  function ClickHandler() {
    const map = useMap();
    useMapEvent('click', async (e) => {
      setClickInfo({ latlng: e.latlng, html: 'Загрузка…' });
      setWfsFeatures(null); // Очищаем предыдущие WFS объекты
      
      try {
        // GetFeatureInfo запрос
        const getFeatureInfoUrl = buildGetFeatureInfoUrl(map, e.latlng, DEFAULT_WMS_LAYER);
        console.log('GetFeatureInfo URL:', getFeatureInfoUrl);
        const res = await fetch(getFeatureInfoUrl, { credentials: 'omit' });
        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));
        
        const contentType = res.headers.get('content-type') || '';
        let html = '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          console.log('JSON response data:', data);
          html = `<pre style="max-width:420px; white-space:pre-wrap;">${
            escapeHtml(JSON.stringify(data, null, 2))
          }</pre>`;
        } else {
          html = await res.text();
          console.log('Text response:', html);
        }
        setClickInfo({ latlng: e.latlng, html });

        // WFS GetFeature запрос для подсветки объектов
        const wfsUrl = buildWFSGetFeatureUrl(map, e.latlng, DEFAULT_WMS_LAYER);
        console.log('WFS GetFeature URL:', wfsUrl);
        const wfsRes = await fetch(wfsUrl, { credentials: 'omit' });
        console.log('WFS Response status:', wfsRes.status);
        
        if (wfsRes.ok) {
          const wfsData = await wfsRes.json();
          console.log('WFS features:', wfsData);
          setWfsFeatures(wfsData);
        } else {
          console.log('WFS request failed:', wfsRes.status);
        }
        
      } catch (err: any) {
        setClickInfo({ latlng: e.latlng, html: `<div style="color:#b91c1c">Ошибка: ${escapeHtml(String(err))}</div>` });
      }
    });
    return null;
  }

  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
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
            <div style={{ maxWidth: 440 }}>
              <div style={{ marginBottom: 8 }}>Слой: {DEFAULT_WMS_LAYER}</div>
              <div dangerouslySetInnerHTML={{ __html: clickInfo.html }} />
            </div>
          </Popup>
        )}

        {wfsFeatures && (
          <GeoJSON 
            data={wfsFeatures} 
            style={{
              color: '#ff0000',
              weight: 3,
              opacity: 0.8,
              fillOpacity: 0.2,
              fillColor: '#ff0000'
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const props = Object.entries(feature.properties)
                  .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                  .join('<br/>');
                layer.bindPopup(`<div style="max-width: 300px;"><h4>WFS Feature</h4>${props}</div>`);
              }
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}


