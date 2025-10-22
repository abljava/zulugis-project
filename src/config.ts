// Конфигурация для работы с Zulu сервером напрямую
// В dev окружении используем Vite-прокси через префикс /zulu
export const ZULU_BASE_URL = '';
export const ZULU_WMS_URL = `/zulu/ws`;
export const ZULU_ZWS_URL = `/zulu/zws`;
export const ZULU_WFS_URL = `/zulu/ws`;

// Учетные данные для авторизации
export const ZULU_USERNAME = 'mo';
export const ZULU_PASSWORD = 'mo';

// Доступные слои
export const AVAILABLE_LAYERS = [
  { name: 'example:demo', title: 'Demo слой' },
  { name: 'mo:vp', title: 'Водопровод' },
  { name: 'mo:vo', title: 'Водоотведение' },
  { name: 'openlayers:teploset', title: 'Теплосеть' }
];

// Функция для получения заголовков авторизации
export function getAuthHeaders(): HeadersInit {
  const credentials = `${ZULU_USERNAME}:${ZULU_PASSWORD}`;
  const token = btoa(credentials);
  return { 
    'Authorization': `Basic ${token}`,
    'Content-Type': 'text/plain;charset=UTF-8'
  };
}

// предустановленные центры и зумы слоев
export const LAYER_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  'example:demo': { center: [42.32, 69.58], zoom: 12 },
  'mo:vp': { center: [55.79576762359448, 38.43813748334245], zoom: 16 },
  'mo:vo': { center: [55.79576762359448, 38.43813748334245], zoom: 16 },
  'openlayers:teploset': { center: [64.55812910920382, 39.82297283375529], zoom: 16 },
};

