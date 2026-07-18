import { useEffect, useMemo } from 'react';

import { polygonBounds } from '../../hooks/polygonBounds';
import { useMap } from '../GoogleMap/MapContext';
import { usePolygon } from '../../hooks/usePolygon';

export interface MapRestrictionProps {
  polygon: google.maps.LatLngLiteral[];
  overlayColor?: string;
  overlayOpacity?: number;
  overlayPadding?: number;
  padded?: boolean;
}

const EDIT_BOUNDS_PADDING_FRACTION = 0.15;


function toClockwise(polygon: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral[] {
  let area = 0;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    area += polygon[j].lng * polygon[i].lat;
    area -= polygon[i].lng * polygon[j].lat;
  }
  return area > 0 ? [...polygon].reverse() : polygon;
}

function expandBounds(
  bounds: google.maps.LatLngBoundsLiteral,
  fraction: number,
): google.maps.LatLngBoundsLiteral {
  const latPad = (bounds.north - bounds.south) * fraction;
  const lngPad = (bounds.east - bounds.west) * fraction;
  return {
    north: Math.min(bounds.north + latPad, 85),
    south: Math.max(bounds.south - latPad, -85),
    east: Math.min(bounds.east + lngPad, 180),
    west: Math.max(bounds.west - lngPad, -180),
  };
}

export function MapRestriction(props: MapRestrictionProps) {
  const map = useMap();

  const rawBounds = polygonBounds(props.polygon);
  const { north, south, east, west } = props.padded
    ? expandBounds(rawBounds, EDIT_BOUNDS_PADDING_FRACTION)
    : rawBounds;

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
      { lat: Math.max(rawBounds.south - pad, -85), lng: Math.max(rawBounds.west - pad, -180) },
      { lat: Math.max(rawBounds.south - pad, -85), lng: Math.min(rawBounds.east + pad, 180) },
      { lat: Math.min(rawBounds.north + pad, 85), lng: Math.min(rawBounds.east + pad, 180) },
      { lat: Math.min(rawBounds.north + pad, 85), lng: Math.max(rawBounds.west - pad, -180) },
    ];
    return [outerRing, toClockwise(props.polygon)];
  }, [rawBounds.north, rawBounds.south, rawBounds.east, rawBounds.west, props.polygon, props.overlayPadding]);

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
