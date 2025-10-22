import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap, useMapEvent, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ZULU_WMS_URL, ZULU_ZWS_URL, AVAILABLE_LAYERS, getAuthHeaders } from '../config';

type ClickInfo = { latlng: L.LatLng, data: any } | null;

// Функция для создания XML запроса к ZWS сервису
function createZWSRequest(layerName: string, latlng: L.LatLng, zoom: number): string {
  // Конвертируем уровень зума Leaflet в масштабный коэффициент
  // Leaflet zoom 14 ≈ масштаб 1.19 (как в примере)
  const scale = Math.pow(2, 18 - zoom) * 0.0001; // Приблизительная формула
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<zulu-server service='zws' version='1.0.0'>
  <Command lang='ru'>
    <SelectElemByXY>
      <Layer>${layerName}</Layer>
      <X>${latlng.lat}</X>
      <Y>${latlng.lng}</Y>
      <Scale>${scale}</Scale>
      <CRS>'EPSG:4326'</CRS>
    </SelectElemByXY>
  </Command>
</zulu-server>`;
}

// Компонент для обработки кликов
function ClickHandler({ onObjectClick }: { onObjectClick: (info: ClickInfo) => void }) {
  const map = useMap();
  
  useMapEvent('click', async (e) => {
    const zoom = map.getZoom();
    const layerName = 'example:demo'; // Можно сделать выбор слоя
    
    try {
      const xmlRequest = createZWSRequest(layerName, e.latlng, zoom);
      console.log('Sending request:', xmlRequest);
      
      const response = await fetch(ZULU_ZWS_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: xmlRequest
      });
      
      if (response.ok) {
        const xmlText = await response.text();
        console.log('ZWS Response:', xmlText);
        
        // Парсим XML ответ
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
         const element = xmlDoc.querySelector('Element');
         if (element) {
           const elemId = element.querySelector('ElemID')?.textContent;
           const typeId = element.querySelector('TypeID')?.textContent;
           const graphType = element.querySelector('GraphType')?.textContent;
           
           // Получаем атрибуты из Records
           const records = element.querySelector('Records');
           const attributes: any = {};
           
           if (records) {
             // Ищем все Record элементы
             const recordElements = records.querySelectorAll('Record');
             recordElements.forEach(record => {
               // В каждом Record ищем Field элементы
               const fields = record.querySelectorAll('Field');
               fields.forEach(field => {
                 const name = field.querySelector('Name')?.textContent;
                 const userName = field.querySelector('UserName')?.textContent;
                 const value = field.querySelector('Value')?.textContent;
                 const fieldType = field.querySelector('Type')?.textContent;
                 
                 if (name && value) {
                   // Используем UserName как отображаемое имя, если есть
                   const displayName = userName || name;
                   attributes[displayName] = {
                     value: value,
                     type: fieldType,
                     originalName: name
                   };
                 }
               });
             });
           }
          
          onObjectClick({
            latlng: e.latlng,
            data: {
              elemId,
              typeId,
              graphType,
              attributes
            }
          });
        } else {
          onObjectClick({
            latlng: e.latlng,
            data: null
          });
        }
      } else {
        console.error('ZWS request failed:', response.status);
        onObjectClick({
          latlng: e.latlng,
          data: null
        });
      }
    } catch (error) {
      console.error('Error fetching object data:', error);
      onObjectClick({
        latlng: e.latlng,
        data: null
      });
    }
  });
  
  return null;
}

export default function MapView() {
  const [clickInfo, setClickInfo] = useState<ClickInfo>(null);
  const center = useMemo(() => ({ lat: 42.3, lng: 69.5 }), []); // Координаты для demo слоя

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <WMSTileLayer
          url={ZULU_WMS_URL}
          params={{
            service: 'WMS',
            version: '1.3.0',
            request: 'GetMap',
            layers: 'example:demo',
            styles: '',
            format: 'image/png',
            transparent: true,
          }}
          crossOrigin="anonymous"
        />
        
        <ClickHandler onObjectClick={setClickInfo} />
        
        {clickInfo && (
          <Popup position={clickInfo.latlng} eventHandlers={{ remove: () => setClickInfo(null) }}>
            <div style={{ maxWidth: 400, maxHeight: 300, overflow: 'auto' }}>
              <h4>Информация об объекте</h4>
              {clickInfo.data ? (
                <div>
                  <p><strong>ID объекта:</strong> {clickInfo.data.elemId}</p>
                  <p><strong>Тип:</strong> {clickInfo.data.typeId}</p>
                  <p><strong>Геометрия:</strong> {clickInfo.data.graphType}</p>
                  
                  {Object.keys(clickInfo.data.attributes).length > 0 && (
                    <div>
                      <h5>Характеристики:</h5>
                      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <tbody>
                          {Object.entries(clickInfo.data.attributes).map(([key, attrData]: [string, any]) => (
                            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ 
                                padding: '4px 8px', 
                                fontWeight: 'bold', 
                                verticalAlign: 'top',
                                width: '50%',
                                backgroundColor: '#f8f9fa'
                              }}>
                                {key}:
                              </td>
                              <td style={{ 
                                padding: '4px 8px', 
                                verticalAlign: 'top',
                                width: '50%'
                              }}>
                                {attrData.value} {/* выводим значение атрибута */}
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
                          ))}
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