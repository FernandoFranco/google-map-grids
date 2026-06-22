import { createContext, useContext } from 'react';

interface MapContextValue {
  map: google.maps.Map;
  mapId: string;
}

export const MapContext = createContext<MapContextValue | null>(null);

export function useMap(): google.maps.Map {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a GoogleMap');
  return ctx.map;
}

export function useMapId(): string {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapId must be used within a GoogleMap');
  return ctx.mapId;
}
