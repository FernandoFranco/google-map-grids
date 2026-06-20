import { useEffect, useRef } from 'react';

export function usePolygon(
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[][],
  options?: google.maps.PolygonOptions,
): google.maps.Polygon | null {
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    const latLngPaths = paths.map(ring =>
      ring.map(p => new google.maps.LatLng(p.lat, p.lng)),
    );
    const polygon = new google.maps.Polygon({ map, paths: latLngPaths, ...options });
    polygonRef.current = polygon;
    return () => {
      polygon.setMap(null);
      polygonRef.current = null;
    };
  }, [map, options, paths]);

  return polygonRef.current;
}
