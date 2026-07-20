import { useEffect, useRef } from 'react';

import { polygonBounds } from '../../hooks/polygonBounds';
import { latLngToUtm, utmToLatLng, mgrsZone, mgrs100km } from '../../hooks/utm';
import { useMap } from '../GoogleMap/MapContext';

export type MgrsPrecision = 1 | 10 | 100 | 1000 | 10000 | 100000;

export interface MgrsLayerProps {
  polygon: google.maps.LatLngLiteral[];
  precision: MgrsPrecision;
  onGridRef?: (gridRef: string) => void;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}

function computeMgrsGrid(polygon: google.maps.LatLngLiteral[], precision: number) {
  const { north, south, east, west } = polygonBounds(polygon);
  const centerLat = (north + south) / 2;
  const centerLng = (east + west) / 2;
  const { zone, hemisphere } = latLngToUtm(centerLat, centerLng);
  const corners = [
    latLngToUtm(north, west, zone),
    latLngToUtm(north, east, zone),
    latLngToUtm(south, west, zone),
    latLngToUtm(south, east, zone),
  ];
  const eastings = corners.map((c) => c.easting);
  const northings = corners.map((c) => c.northing);
  return {
    zone,
    hemisphere,
    utmWest: Math.floor(Math.min(...eastings) / precision) * precision,
    utmEast: Math.ceil(Math.max(...eastings) / precision) * precision,
    utmSouth: Math.floor(Math.min(...northings) / precision) * precision,
    utmNorth: Math.ceil(Math.max(...northings) / precision) * precision,
  };
}

function labelDigits(v: number, p: number): string {
  return String(Math.floor((v % 100_000) / p)).padStart(Math.log10(100_000 / p), '0');
}

export function MgrsLayer(props: MgrsLayerProps) {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  useEffect(() => {
    if (props.polygon.length === 0) return;

    const { zone, hemisphere, utmWest, utmEast, utmSouth, utmNorth } = computeMgrsGrid(
      props.polygon,
      props.precision,
    );

    const { north, south, east, west } = polygonBounds(props.polygon);
    const cLat = (north + south) / 2;
    const cLng = (east + west) / 2;
    const { band } = mgrsZone(cLat, cLng);
    const cUtm = latLngToUtm(cLat, cLng, zone);
    const { col, row } = mgrs100km(zone, cUtm.easting, cUtm.northing);
    props.onGridRef?.(`${zone}${band} ${col}${row}`);

    const gridCorners = [
      utmToLatLng(zone, hemisphere, utmWest, utmSouth),
      utmToLatLng(zone, hemisphere, utmEast, utmSouth),
      utmToLatLng(zone, hemisphere, utmWest, utmNorth),
      utmToLatLng(zone, hemisphere, utmEast, utmNorth),
    ];
    const bounds = {
      north: Math.max(...gridCorners.map((c) => c.lat)),
      south: Math.min(...gridCorners.map((c) => c.lat)),
      east: Math.max(...gridCorners.map((c) => c.lng)),
      west: Math.min(...gridCorners.map((c) => c.lng)),
    };
    map.setOptions({ restriction: { latLngBounds: bounds, strictBounds: false } });
    const fitTimer = setTimeout(() => {
      map.fitBounds(bounds, 4);
    }, 0);

    const SAMPLES = 20;
    const strokeOpts = {
      strokeColor: props.strokeColor ?? '#FFFFFF',
      strokeOpacity: props.strokeOpacity ?? 0.8,
      strokeWeight: props.strokeWeight ?? 1,
      zIndex: 1,
      clickable: false,
    };
    const polylines: google.maps.Polyline[] = [];

    const nCount = Math.round((utmNorth - utmSouth) / props.precision) + 1;
    for (let i = 0; i < nCount; i++) {
      const n = utmSouth + i * props.precision;
      const path = Array.from({ length: SAMPLES + 1 }, (_, s) =>
        utmToLatLng(zone, hemisphere, utmWest + (s / SAMPLES) * (utmEast - utmWest), n),
      );
      polylines.push(new google.maps.Polyline({ map, path, ...strokeOpts }));
    }

    const eCount = Math.round((utmEast - utmWest) / props.precision) + 1;
    for (let i = 0; i < eCount; i++) {
      const e = utmWest + i * props.precision;
      const path = Array.from({ length: SAMPLES + 1 }, (_, s) =>
        utmToLatLng(zone, hemisphere, e, utmSouth + (s / SAMPLES) * (utmNorth - utmSouth)),
      );
      polylines.push(new google.maps.Polyline({ map, path, ...strokeOpts }));
    }

    polylinesRef.current = polylines;

    const labelData: Array<{ lat: number; lng: number; text: string }> = [];
    for (let i = 0; i < eCount; i++) {
      const e = utmWest + i * props.precision;
      labelData.push({
        ...utmToLatLng(zone, hemisphere, e, utmNorth),
        text: labelDigits(e, props.precision),
      });
    }
    for (let i = 0; i < nCount; i++) {
      const n = utmSouth + i * props.precision;
      labelData.push({
        ...utmToLatLng(zone, hemisphere, utmWest, n),
        text: labelDigits(n, props.precision),
      });
    }

    class MgrsLabels extends google.maps.OverlayView {
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
            `transform:${idx < eCount ? 'translate(-50%,0)' : 'translate(0,-50%)'};`;
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

    const overlay = new MgrsLabels();
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      clearTimeout(fitTimer);
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
    };
  }, [map, props.polygon, props.precision]); // eslint-disable-line react-hooks/exhaustive-deps

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
