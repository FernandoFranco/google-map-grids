import { useEffect, useRef } from 'react';

import { useMap } from '../GoogleMap/MapContext';

export interface PolygonItem {
  id: string;
  paths: google.maps.LatLngLiteral[][];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
}

export interface PolygonLayerProps {
  areas: PolygonItem[];
  interactive?: boolean;
  onClick?: (item: PolygonItem) => void;
  onRightClick?: (item: PolygonItem, x: number, y: number) => void;
}

function toLLPaths(paths: google.maps.LatLngLiteral[][]): google.maps.LatLng[][] {
  return paths.map(ring => ring.map(p => new google.maps.LatLng(p.lat, p.lng)));
}

function itemOptions(item: PolygonItem, interactive: boolean): google.maps.PolygonOptions {
  return {
    strokeColor: item.strokeColor ?? '#FFFFFF',
    strokeOpacity: item.strokeOpacity ?? 0.8,
    strokeWeight: item.strokeWeight ?? 2,
    fillColor: item.fillColor ?? '#FFFFFF',
    fillOpacity: item.fillOpacity ?? 0.2,
    clickable: interactive,
  };
}

export function PolygonLayer(props: PolygonLayerProps) {
  const map = useMap();

  type Entry = { polygon: google.maps.Polygon; listeners: google.maps.MapsEventListener[] };
  const registryRef = useRef(new Map<string, Entry>());
  const areasRef = useRef(props.areas);

  useEffect(() => {
    areasRef.current = props.areas;
  });

  useEffect(() => {
    const registry = registryRef.current;
    const incomingIds = new Set(props.areas.map(a => a.id));

    for (const [id, entry] of registry) {
      if (!incomingIds.has(id)) {
        entry.listeners.forEach(l => google.maps.event.removeListener(l));
        entry.polygon.setMap(null);
        registry.delete(id);
      }
    }

    const interactive = props.interactive ?? true;

    for (const item of props.areas) {
      const llPaths = toLLPaths(item.paths);
      const existing = registry.get(item.id);
      if (existing) {
        existing.polygon.setPaths(llPaths);
        existing.polygon.setOptions(itemOptions(item, interactive));
      } else {
        const polygon = new google.maps.Polygon({
          map,
          paths: llPaths,
          ...itemOptions(item, interactive),
        });
        const listeners: google.maps.MapsEventListener[] = [];

        listeners.push(
          polygon.addListener('click', () => {
            props.onClick?.(item);
          }),
        );

        listeners.push(
          polygon.addListener('rightclick', (e: google.maps.MapMouseEvent) => {
            const de = e.domEvent as MouseEvent;
            props.onRightClick?.(item, de.clientX, de.clientY);
          }),
        );

        registry.set(item.id, { polygon, listeners });
      }
    }
  }, [map, props, props.areas]);

  useEffect(() => {
    const registry = registryRef.current;
    return () => {
      registry.clear();
    };
  }, []);

  return null;
}
