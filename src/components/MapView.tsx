import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ZULU_WMS_URL, AVAILABLE_LAYERS } from '../config';
import { ClickHandler } from './ClickHandler';

type ClickInfo = { latlng: L.LatLng; data: any } | null;

export default function MapView({ layer }: { layer: string }) {
  const [clickInfo, setClickInfo] = useState<ClickInfo>(null);
  const center = useMemo(() => ({ lat: 42.3, lng: 69.5 }), []); // Координаты для центра слоя



  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <WMSTileLayer
          url={ZULU_WMS_URL}
          params={{
            service: 'WMS',
            version: '1.3.0',
            request: 'GetMap',
            layers: layer,
            styles: '',
            format: 'image/png',
            transparent: true,
          }}
          crossOrigin='anonymous'
        />

        <ClickHandler onObjectClick={setClickInfo} layer={layer} />

        {clickInfo && (
          <Popup
            position={clickInfo.latlng}
            eventHandlers={{ remove: () => setClickInfo(null) }}
          >
            <div style={{ maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
              <h4>Информация об объекте</h4>
              {clickInfo.data ? (
                <div>
                  <p>
                    <strong>ID объекта:</strong> {clickInfo.data.elemId}
                  </p>
                  <p>
                    <strong>Тип:</strong> {clickInfo.data.typeId}
                  </p>
                  <p>
                    <strong>Геометрия:</strong> {clickInfo.data.graphType}
                  </p>

                  {Object.keys(clickInfo.data.attributes).length > 0 && (
                    <div>
                      <h5>Характеристики:</h5>
                      <table
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          borderCollapse: 'collapse',
                        }}
                      >
                        <tbody>
                          {Object.entries(clickInfo.data.attributes).map(
                            ([key, attrData]: [string, any]) => (
                              <tr
                                key={key}
                                style={{ borderBottom: '1px solid #eee' }}
                              >
                                <td
                                  style={{
                                    padding: '4px 8px',
                                    fontWeight: 'bold',
                                    verticalAlign: 'top',
                                    width: '50%',
                                    backgroundColor: '#f8f9fa',
                                  }}
                                >
                                  {key}:
                                </td>
                                <td
                                  style={{
                                    padding: '4px 8px',
                                    verticalAlign: 'top',
                                    width: '50%',
                                  }}
                                >
                                  {attrData.value}{' '}
                                  {/* выводим значение атрибута */}
                                  {/* {attrData.type && (
                                  <span style={{ 
                                    fontSize: '10px', 
                                    color: '#666', 
                                    marginLeft: '5px',
                                    fontStyle: 'italic'
                                  }}>
                                    ({attrData.type})
                                  </span>
                                )} */}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <p>Объект не найден в данной точке</p>
              )}
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
