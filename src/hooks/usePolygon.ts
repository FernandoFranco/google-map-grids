import { useEffect } from 'react';

export function usePolygon(
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[][],
  options?: google.maps.PolygonOptions,
): void {
  useEffect(() => {
    const latLngPaths = paths.map((ring) => ring.map((p) => new google.maps.LatLng(p.lat, p.lng)));
    const polygon = new google.maps.Polygon({ map, paths: latLngPaths, ...options });
    return () => {
      polygon.setMap(null);
    };
  }, [map, options, paths]);
}
