export function polygonBounds(
  polygon: google.maps.LatLngLiteral[],
): google.maps.LatLngBoundsLiteral {
  const lats = polygon.map((p) => p.lat);
  const lngs = polygon.map((p) => p.lng);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}
