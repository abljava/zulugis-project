<!-- c6cc3b7a-0664-482c-8227-557d7a3380d8 c62625b8-a527-4084-8aa5-66a1161de95b -->
# План: мини‑приложение «Карта + ZuluServer (WMS/WFS/ZWS)»

## Технологии

- React + Vite (уже есть)
- Leaflet + react-leaflet
- Работа с HTTP: fetch/axios

## Источники данных

- WMS/WFS/ZWS базовый URL: `http://zs.zulugis.ru:6473/ws`
- Базовый слой WMS: `mo:vo` (из GetCapabilities [`GetCapabilities ZuluServer`](http://zs.zulugis.ru:6473/ws?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities))

## Функциональные блоки

1) Карта

- Инициализировать карту Leaflet, CRS по выбору (EPSG:3857 или EPSG:4326)
- Подключить базовый подложечный тайл (OSM) для ориентира
- Добавить WMS слой из ZuluServer (`L.tileLayer.wms`) с прозрачностью

2) Каталог слоев (из WMS Capabilities)

- Запросить и распарсить XML Capabilities
- Показать выпадающий список слоев (имя: `mo:vo`, `world:piter`, и т.д.)
- Переключение активного WMS слоя

3) GetFeatureInfo (popup по клику)

- Обработчик клика по карте
- Сформировать WMS GetFeatureInfo (VERSION 1.3.0, INFO_FORMAT `application/json` если доступно, иначе `text/html`/`text/plain`)
- Показать всплывающее окно Leaflet popup со свойствами

4) Подсветка объекта

- Если ответ содержит геометрию (через WFS) — запросить WFS GetFeature в окрестности клика (BBOX точечный с толерансом)
- Отобразить контур `L.geoJSON` поверх WMS слоя с стилем выделения

5) Базовая интеграция ZWS

- Подготовить модуль `zwsClient.ts` с функциями: получить список слоев, запрос семантики по идентификатору (если доступно)
- Параметризовать базовый URL и опциональную Basic-авторизацию

6) UI/UX

- Панель управления: выбор слоя, переключение CRS, прозрачность WMS, переключатель «Показывать выделение через WFS»
- Индикация загрузки/ошибок

7) Конфигурация

- `.env` переменные: `VITE_ZULU_BASE_URL`, `VITE_DEFAULT_LAYER`, `VITE_AUTH_BASIC` (опционально)

8) Тестирование

- Smoke‑тест: загрузка Capabilities, отрисовка WMS, GetFeatureInfo в области `mo:vo`
- Проверка переключения слоев и popup

## Ключевые URL‑шаблоны

- WMS GetMap (Leaflet создаёт сам): `/ws?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS={layer}&CRS={crs}&BBOX=...&WIDTH=...&HEIGHT=...&FORMAT=image/png&TRANSPARENT=TRUE`
- WMS GetFeatureInfo: `/ws?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS={layer}&QUERY_LAYERS={layer}&CRS={crs}&BBOX=...&WIDTH={w}&HEIGHT={h}&I={i}&J={j}&INFO_FORMAT=application/json`
- WFS GetFeature (в окне вокруг клика, если нужно): `/ws?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME={layer}&BBOX={bbox},{crs}&OUTPUTFORMAT=application/json`
- ZWS (заглушка): `/zws/...` по документации, обернуть в клиент

## Структура файлов

- `src/components/MapView.tsx` — карта, WMS слой, клики
- `src/components/LayerPicker.tsx` — выбор слоя из Capabilities
- `src/lib/wms.ts` — генераторы URL GetFeatureInfo
- `src/lib/wfs.ts` — генераторы URL, парсинг GeoJSON/GML (если json недоступен)
- `src/lib/zws.ts` — клиент ZWS (опционально/заглушка)
- `src/types/ogc.ts` — типы для ответов WMS/WFS
- `src/config.ts` — чтение `.env`

## Ограничения и допущения

- Для подсветки предпочтём WFS с `OUTPUTFORMAT=application/json`; если сервер вернёт GML — добавим простой парсер/конвертер или временно ограничимся без контура
- Авторизация не используется, при необходимости — Basic Auth в заголовках

### To-dos

- [ ] Установить axios и xml2js для Capabilities парсинга
- [ ] Добавить .env с VITE_ZULU_BASE_URL и VITE_DEFAULT_LAYER=mo:vo
- [ ] Создать MapView с Leaflet, OSM подложкой, WMS слоем
- [ ] Загрузить и распарсить WMS GetCapabilities, заполнить список слоев
- [ ] Реализовать GetFeatureInfo и popup со свойствами
- [ ] Добавить выборочно WFS GetFeature для подсветки объекта
- [ ] Подготовить каркас клиента ZWS с примерами вызовов
- [ ] Сделать панель: выбор слоя, прозрачность, CRS, переключатель WFS
- [ ] Индикация загрузки и ошибок запросов
- [ ] Проверить на слое mo:vo: WMS, GetFeatureInfo, подсветка

