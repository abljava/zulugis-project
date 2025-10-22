import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ZULU_WMS_URL } from '../config';
import { CenterOnLayer } from './CenterOnLayer';
import { ClickHandler } from './ClickHandler';

type ClickInfo = { latlng: L.LatLng; data: any } | null;

export default function MapView({ layers }: { layers: string[] }) {
  const [clickInfo, setClickInfo] = useState<ClickInfo>(null);
  const [wmsError, setWmsError] = useState<string | null>(null);

  const center = useMemo(() => ({ lat: 42.3, lng: 69.5 }), []); // Координаты для центра слоя

  const wmsParams = useMemo(() => {
    try {
      if (!layers || layers.length === 0) {
        console.warn('No layers provided to MapView');
        return {
          service: 'WMS',
          version: '1.3.0',
          request: 'GetMap',
          layers: 'example:demo',
          styles: '',
          format: 'image/png',
          transparent: true,
          TILED: true,
        } as any;
      }

      return {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        layers: layers.join(','),
        styles: '',
        format: 'image/png',
        transparent: true,
        TILED: true,
      } as any;
    } catch (error) {
      console.error('Error creating WMS params:', error);
      setWmsError('Ошибка настройки слоёв');
      return {
        service: 'WMS',
        version: '1.3.0',
        request: 'GetMap',
        layers: 'example:demo',
        styles: '',
        format: 'image/png',
        transparent: true,
        TILED: true,
      } as any;
    }
  }, [layers]);

  return (
    <div className='h-[90vh] w-full'>
      <MapContainer center={center} zoom={10} className='h-full w-full'>
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <WMSTileLayer
          url={ZULU_WMS_URL}
          uppercase={true}
          params={wmsParams}
          crossOrigin='anonymous'
          eventHandlers={{
            loading: () => setWmsError(null),
            load: () => setWmsError(null),
            tileerror: (e) => {
              console.error('WMS tile error:', e);
              setWmsError('Ошибка загрузки слоя');
            },
          }}
        />

        <CenterOnLayer layer={layers[layers.length - 1] || 'example:demo'} />

        <ClickHandler
          onObjectClick={setClickInfo}
          layer={layers[layers.length - 1] || 'example:demo'}
        />

        {wmsError && (
          <div className='absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-[1000]'>
            <strong>Ошибка:</strong> {wmsError}
          </div>
        )}

        {clickInfo && (
          <Popup
            position={clickInfo.latlng}
            eventHandlers={{ remove: () => setClickInfo(null) }}
          >
            <div
              className='max-w-sm max-h-[70vh] overflow-y-auto'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6',
              }}
            >
              <h4 className='text-lg font-semibold mb-2'>
                Информация об объекте
              </h4>
              {clickInfo.data ? (
                <div>
                  {Object.keys(clickInfo.data.attributes).length > 0 && (
                      <table className='w-full text-xs border-collapse'>
                        <tbody>
                          {Object.entries(clickInfo.data.attributes).map(
                            ([key, attrData]: [string, any]) => (
                              <tr
                                key={key}
                                className='border-b border-gray-200'
                              >
                                <td className='px-2 py-1 font-bold align-top w-1/2 bg-gray-50'>
                                  {key}:
                                </td>
                                <td className='px-2 py-1 align-top w-1/2'>
                                  {attrData.value}{' '}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
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
