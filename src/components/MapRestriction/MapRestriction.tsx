import { useEffect, useMemo } from 'react';

import { useMap } from '../GoogleMap/MapContext';
import { usePolygon } from '../../hooks/usePolygon';

export interface MapRestrictionProps {
  polygon: google.maps.LatLngLiteral[];
  overlayColor?: string;
  overlayOpacity?: number;
  overlayPadding?: number;
}


function toClockwise(polygon: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral[] {
  let area = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += polygon[j].lng * polygon[i].lat;
    area -= polygon[i].lng * polygon[j].lat;
  }
  return area > 0 ? [...polygon].reverse() : polygon;
}

export function MapRestriction(props: MapRestrictionProps) {
  const map = useMap();

  const lats = props.polygon.map(p => p.lat);
  const lngs = props.polygon.map(p => p.lng);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);

  useEffect(() => {
    map.setOptions({
      restriction: {
        latLngBounds: { north, south, east, west },
        strictBounds: false,
      },
    });
    map.fitBounds({ north, south, east, west }, 0);
    return () => {
      map.setOptions({ restriction: null });
    };
  }, [map, north, south, east, west]);

  const paths = useMemo(() => {
    const pad = props.overlayPadding ?? 60;
    const outerRing = [
      { lat: Math.max(south - pad, -85), lng: Math.max(west - pad, -180) },
      { lat: Math.max(south - pad, -85), lng: Math.min(east + pad, 180) },
      { lat: Math.min(north + pad, 85), lng: Math.min(east + pad, 180) },
      { lat: Math.min(north + pad, 85), lng: Math.max(west - pad, -180) },
    ];
    return [outerRing, toClockwise(props.polygon)];
  }, [north, south, east, west, props.polygon, props.overlayPadding]);

  const overlayOptions = useMemo(
    () => ({
      fillColor: props.overlayColor ?? '#000000',
      fillOpacity: props.overlayOpacity ?? 0.8,
      strokeWeight: 0,
      clickable: false,
    }),
    [props.overlayColor, props.overlayOpacity],
  );

  usePolygon(map, paths, overlayOptions);

  return null;
}
