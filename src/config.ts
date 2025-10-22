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
  { name: 'mo:vp', title: 'Московская область (векторные данные)' },
  { name: 'mo:vo', title: 'Московская область (водные объекты)' },
  { name: 'mo:region', title: 'Московский регион' },
  { name: 'world:piter', title: 'Петербург' },
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