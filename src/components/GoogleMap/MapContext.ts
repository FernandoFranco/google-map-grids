import { createContext, useContext } from 'react';

export const MapContext = createContext<google.maps.Map | null>(null);

export function useMap(): google.maps.Map {
  const map = useContext(MapContext);
  if (!map) throw new Error('useMap must be used within a GoogleMap');
  return map;
}
