import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LAYER_VIEWS } from '../config';

export function CenterOnLayer({ layer }: { layer: string }) {
  const map = useMap();
  useEffect(() => {
    try {
      const preset = LAYER_VIEWS[layer];
      if (preset && preset.center && preset.zoom) {
        // Проверяем валидность координат
        const [lat, lng] = preset.center;
        if (typeof lat === 'number' && typeof lng === 'number' && 
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          map.setView({ lat, lng }, preset.zoom, {
            animate: true,
          });
        } else {
          console.warn(`Invalid coordinates for layer ${layer}:`, preset.center);
        }
      } else {
        console.warn(`No preset found for layer: ${layer}`);
      }
    } catch (error) {
      console.error('Error centering on layer:', error);
    }
  }, [layer, map]);
  return null;
}
