import { useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';
import { ZULU_ZWS_URL, getAuthHeaders } from '../config';

type ClickInfo = { latlng: L.LatLng; data: any } | null;

// Функция для создания XML запроса к ZWS сервису
function createZWSRequest(
  layerName: string,
  latlng: L.LatLng,
  zoom: number
): string {
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
export function ClickHandler({
  onObjectClick,
  layer,
}: {
  onObjectClick: (info: ClickInfo) => void;
  layer: string;
}) {
  const map = useMap();

  useMapEvent('click', async (e) => {
    const zoom = map.getZoom();
    const layerName = layer; // Используем переданный слой

    console.log('click layer: ', layer);

    try {
      const xmlRequest = createZWSRequest(layerName, e.latlng, zoom);
      console.log('Sending request:', xmlRequest);

      const response = await fetch(ZULU_ZWS_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: xmlRequest,
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
            recordElements.forEach((record) => {
              // В каждом Record ищем Field элементы
              const fields = record.querySelectorAll('Field');
              fields.forEach((field) => {
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
                    originalName: name,
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
              attributes,
            },
          });
        } else {
          onObjectClick({
            latlng: e.latlng,
            data: null,
          });
        }
      } else {
        console.error('ZWS request failed:', response.status);
        onObjectClick({
          latlng: e.latlng,
          data: null,
        });
      }
    } catch (error) {
      console.error('Error fetching object data:', error);
      onObjectClick({
        latlng: e.latlng,
        data: null,
      });
    }
  });

  return null;
}
