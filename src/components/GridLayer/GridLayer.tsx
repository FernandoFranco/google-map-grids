import { useEffect, useRef } from 'react';

import { polygonBounds } from '../../hooks/polygonBounds';
import { useMap } from '../GoogleMap/MapContext';

export interface GridLayerProps {
  polygon: google.maps.LatLngLiteral[];
  cellSize: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

function computeGrid(polygon: google.maps.LatLngLiteral[], cellSize: number) {
  const { north, south, east, west } = polygonBounds(polygon);
  const centerLat = (north + south) / 2;
  const cellDegLat = cellSize / 111320;
  const cellDegLng = cellSize / (111320 * Math.cos((centerLat * Math.PI) / 180));

  return {
    gridNorth: Math.ceil(north / cellDegLat) * cellDegLat,
    gridSouth: Math.floor(south / cellDegLat) * cellDegLat,
    gridEast: Math.ceil(east / cellDegLng) * cellDegLng,
    gridWest: Math.floor(west / cellDegLng) * cellDegLng,
    cellDegLat,
    cellDegLng,
  };
}

function columnLabel(index: number): string {
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export function GridLayer(props: GridLayerProps) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  useEffect(() => {
    if (props.polygon.length === 0) return;

    const { gridNorth, gridSouth, gridEast, gridWest, cellDegLat, cellDegLng } = computeGrid(
      props.polygon,
      props.cellSize,
    );
    const bounds = { north: gridNorth, south: gridSouth, east: gridEast, west: gridWest };

    map.setOptions({ restriction: { latLngBounds: bounds, strictBounds: false } });
    const fitBoundsTimer = setTimeout(() => {
      map.fitBounds(bounds, 4);
    }, 0);

    const strokeOpts = {
      strokeColor: props.strokeColor ?? '#FFFFFF',
      strokeOpacity: props.strokeOpacity ?? 0.8,
      strokeWeight: props.strokeWeight ?? 1,
      zIndex: 1,
      clickable: false,
    };

    const polylines: google.maps.Polyline[] = [];

    const latCount = Math.round((gridNorth - gridSouth) / cellDegLat) + 1;
    for (let i = 0; i < latCount; i++) {
      const lat = gridSouth + i * cellDegLat;
      polylines.push(
        new google.maps.Polyline({
          map,
          path: [
            { lat, lng: gridWest },
            { lat, lng: gridEast },
          ],
          ...strokeOpts,
        }),
      );
    }

    const lngCount = Math.round((gridEast - gridWest) / cellDegLng) + 1;
    for (let i = 0; i < lngCount; i++) {
      const lng = gridWest + i * cellDegLng;
      polylines.push(
        new google.maps.Polyline({
          map,
          path: [
            { lat: gridSouth, lng },
            { lat: gridNorth, lng },
          ],
          ...strokeOpts,
        }),
      );
    }

    polylinesRef.current = polylines;

    const colCount = Math.round((gridEast - gridWest) / cellDegLng);
    const rowCount = Math.round((gridNorth - gridSouth) / cellDegLat);

    const labelData: Array<{ lat: number; lng: number; text: string }> = [];
    for (let i = 0; i < colCount; i++) {
      labelData.push({
        lat: gridNorth,
        lng: gridWest + (i + 0.5) * cellDegLng,
        text: String(i + 1),
      });
    }
    for (let j = 0; j < rowCount; j++) {
      labelData.push({
        lat: gridSouth + (j + 0.5) * cellDegLat,
        lng: gridWest,
        text: columnLabel(rowCount - 1 - j),
      });
    }

    class GridLabels extends google.maps.OverlayView {
      private container: HTMLDivElement | null = null;

      onAdd() {
        this.container = document.createElement('div');
        this.container.style.cssText =
          'position:absolute;top:0;left:0;width:0;height:0;pointer-events:none;';
        for (let idx = 0; idx < labelData.length; idx++) {
          const span = document.createElement('span');
          span.style.cssText =
            'position:absolute;color:#fff;font:bold 11px/1 monospace;' +
            'background:rgba(0,0,0,0.64);padding:1px 3px;border-radius:2px;white-space:nowrap;' +
            `transform:${idx < colCount ? 'translate(-50%,0)' : 'translate(0,-50%)'};`;
          span.textContent = labelData[idx].text;
          this.container.appendChild(span);
        }
        this.getPanes()!.markerLayer.appendChild(this.container);
      }

      draw() {
        if (!this.container) return;
        const proj = this.getProjection();
        const spans = this.container.children;
        for (let i = 0; i < labelData.length; i++) {
          const px = proj.fromLatLngToDivPixel(
            new google.maps.LatLng(labelData[i].lat, labelData[i].lng),
          );
          if (px) {
            (spans[i] as HTMLElement).style.left = `${px.x}px`;
            (spans[i] as HTMLElement).style.top = `${px.y}px`;
          }
        }
      }

      onRemove() {
        this.container?.parentNode?.removeChild(this.container);
        this.container = null;
      }
    }

    const overlay = new GridLabels();
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      clearTimeout(fitBoundsTimer);
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
    };
  }, [map, props.polygon, props.cellSize]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const options = {
      strokeColor: props.strokeColor ?? '#FFFFFF',
      strokeOpacity: props.strokeOpacity ?? 0.8,
      strokeWeight: props.strokeWeight ?? 1,
    };
    polylinesRef.current.forEach((p) => p.setOptions(options));
  }, [props.strokeColor, props.strokeOpacity, props.strokeWeight]);

  return null;
}
