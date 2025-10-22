// Конфигурация для работы с Zulu сервером
export const ZULU_BASE_URL = 'http://zs.zulugis.ru:6473';
export const ZULU_WMS_URL = `${ZULU_BASE_URL}/ws`;
export const ZULU_ZWS_URL = `${ZULU_BASE_URL}/zws`;

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