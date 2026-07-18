import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { importLibrary } from '@googlemaps/js-api-loader';

export interface NodeStyle {
  fillColor?: string;
  strokeColor?: string;
  size?: number;
  closeFillColor?: string;
}

export interface LineStyle {
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
}

export interface UseNodeLineEditorOptions {
  map: google.maps.Map;
  enabled: boolean;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  initialNodes?: google.maps.LatLngLiteral[];
  onNodesChange?: (nodes: google.maps.LatLngLiteral[]) => void;
  onPolygonClosed?: () => void;
}

export interface UseNodeLineEditorResult {
  nodes: google.maps.LatLngLiteral[];
  phase: 'drawing' | 'editing';
  clear: () => void;
}

const CLOSE_NODE_FILL = '#188038';
const DEFAULT_NODE_FILL = '#1a73e8';
const DEFAULT_NODE_STROKE = '#ffffff';
const DEFAULT_NODE_SIZE = 14;

const DEFAULT_LINE_STROKE = '#1a73e8';
const DEFAULT_LINE_WEIGHT = 2;
const DEFAULT_LINE_OPACITY = 0.9;

function toLatLngLiteral(
  pos:
    | google.maps.LatLng
    | google.maps.LatLngLiteral
    | google.maps.LatLngAltitude
    | google.maps.LatLngAltitudeLiteral
    | null
    | undefined,
): google.maps.LatLngLiteral {
  if (pos instanceof google.maps.LatLng) return { lat: pos.lat(), lng: pos.lng() };
  if (pos && typeof pos === 'object' && 'lat' in pos && 'lng' in pos) {
    return { lat: pos.lat as unknown as number, lng: pos.lng as unknown as number };
  }
  return { lat: 0, lng: 0 };
}

function buildNodeContent(style: NodeStyle | undefined, isCloseTarget: boolean): HTMLDivElement {
  const size = style?.size ?? DEFAULT_NODE_SIZE;
  const el = document.createElement('div');
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '50%';
  el.style.boxSizing = 'border-box';
  el.style.background = isCloseTarget
    ? (style?.closeFillColor ?? CLOSE_NODE_FILL)
    : (style?.fillColor ?? DEFAULT_NODE_FILL);
  el.style.border = `2px solid ${style?.strokeColor ?? DEFAULT_NODE_STROKE}`;
  el.style.transform = 'translateY(50%)';
  return el;
}

function lineOptions(style: LineStyle | undefined): google.maps.PolylineOptions {
  return {
    strokeColor: style?.strokeColor ?? DEFAULT_LINE_STROKE,
    strokeWeight: style?.strokeWeight ?? DEFAULT_LINE_WEIGHT,
    strokeOpacity: style?.strokeOpacity ?? DEFAULT_LINE_OPACITY,
    clickable: false,
  };
}

function segmentOptions(style: LineStyle | undefined): google.maps.PolylineOptions {
  return { ...lineOptions(style), clickable: true };
}

function ghostLineOptions(style: LineStyle | undefined): google.maps.PolylineOptions {
  return {
    strokeOpacity: 0,
    clickable: false,
    icons: [
      {
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          strokeColor: style?.strokeColor ?? DEFAULT_LINE_STROKE,
          strokeWeight: style?.strokeWeight ?? DEFAULT_LINE_WEIGHT,
          scale: 3,
        },
        offset: '0',
        repeat: '12px',
      },
    ],
  };
}

export function useNodeLineEditor(options: UseNodeLineEditorOptions): UseNodeLineEditorResult {
  const [nodes, setNodes] = useState<google.maps.LatLngLiteral[]>([]);
  const [phase, setPhase] = useState<'drawing' | 'editing'>('drawing');

  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerDragListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const segmentsRef = useRef<google.maps.Polyline[]>([]);
  const segmentListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const mainlineRef = useRef<google.maps.Polyline | null>(null);
  const ghostLineRef = useRef<google.maps.Polyline | null>(null);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const node0CloseListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const closeStyleAppliedRef = useRef(false);
  const activationTokenRef = useRef(0);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  function syncNodesFromMarkers() {
    setNodes(markersRef.current.map(marker => toLatLngLiteral(marker.position)));
  }

  function attachDrag(marker: google.maps.marker.AdvancedMarkerElement) {
    const listener = marker.addListener('dragend', () => {
      const idx = markersRef.current.indexOf(marker);
      const n = segmentsRef.current.length;
      if (idx === -1 || n === 0) return;

      const pos = toLatLngLiteral(marker.position);
      const prevSeg = segmentsRef.current[(idx - 1 + n) % n];
      const nextSeg = segmentsRef.current[idx % n];
      prevSeg.getPath().setAt(1, new google.maps.LatLng(pos));
      nextSeg.getPath().setAt(0, new google.maps.LatLng(pos));
      syncNodesFromMarkers();
    });
    markerDragListenersRef.current.push(listener);
  }

  function attachSegmentClick(segment: google.maps.Polyline, markerLib: google.maps.MarkerLibrary) {
    const listener = segment.addListener('click', (event: google.maps.PolyMouseEvent) => {
      if (!event.latLng) return;
      const idx = segmentsRef.current.indexOf(segment);
      if (idx === -1) return;
      insertNode(idx, { lat: event.latLng.lat(), lng: event.latLng.lng() }, markerLib);
    });
    segmentListenersRef.current.push(listener);
  }

  function insertNode(afterIndex: number, pos: google.maps.LatLngLiteral, markerLib: google.maps.MarkerLibrary) {
    const map = optionsRef.current.map;
    const insertPos = afterIndex + 1;

    const marker = new markerLib.AdvancedMarkerElement({
      map,
      position: pos,
      content: buildNodeContent(optionsRef.current.nodeStyle, false),
      gmpDraggable: true,
    });
    markersRef.current.splice(insertPos, 0, marker);
    attachDrag(marker);

    const seg = segmentsRef.current[afterIndex];
    const oldEnd = seg.getPath().getAt(1);
    seg.getPath().setAt(1, new google.maps.LatLng(pos));

    const newSegment = new google.maps.Polyline({
      map,
      path: [pos, oldEnd],
      ...segmentOptions(optionsRef.current.lineStyle),
    });
    attachSegmentClick(newSegment, markerLib);
    segmentsRef.current.splice(insertPos, 0, newSegment);

    syncNodesFromMarkers();
  }

  function enterEditingPhase(markerLib: google.maps.MarkerLibrary) {
    const map = optionsRef.current.map;
    const n = markersRef.current.length;

    markersRef.current.forEach(marker => {
      marker.gmpDraggable = true;
      attachDrag(marker);
    });

    const positions = markersRef.current.map(marker => toLatLngLiteral(marker.position));
    for (let i = 0; i < n; i++) {
      const segment = new google.maps.Polyline({
        map,
        path: [positions[i], positions[(i + 1) % n]],
        ...segmentOptions(optionsRef.current.lineStyle),
      });
      attachSegmentClick(segment, markerLib);
      segmentsRef.current.push(segment);
    }

    setPhase('editing');
    syncNodesFromMarkers();
  }

  function addNode(pos: google.maps.LatLngLiteral, markerLib: google.maps.MarkerLibrary) {
    const map = optionsRef.current.map;
    const nodeStyle = optionsRef.current.nodeStyle;

    const marker = new markerLib.AdvancedMarkerElement({
      map,
      position: pos,
      content: buildNodeContent(nodeStyle, false),
      gmpDraggable: false,
    });
    markersRef.current.push(marker);

    if (!mainlineRef.current) {
      mainlineRef.current = new google.maps.Polyline({ map, path: [pos], ...lineOptions(optionsRef.current.lineStyle) });
    } else {
      mainlineRef.current.getPath().push(new google.maps.LatLng(pos));
    }

    if (markersRef.current.length >= 2) {
      const first = toLatLngLiteral(markersRef.current[0].position);
      const ghostPath = [pos, first];
      if (ghostLineRef.current) {
        ghostLineRef.current.setPath(ghostPath);
      } else {
        ghostLineRef.current = new google.maps.Polyline({
          map,
          path: ghostPath,
          ...ghostLineOptions(optionsRef.current.lineStyle),
        });
      }
    }

    if (markersRef.current.length >= 3 && !closeStyleAppliedRef.current) {
      const first = markersRef.current[0];
      first.content = buildNodeContent(nodeStyle, true);
      node0CloseListenerRef.current = first.addListener('click', () => handleCloseClick(markerLib));
      closeStyleAppliedRef.current = true;
    }

    syncNodesFromMarkers();
  }

  function handleCloseClick(markerLib: google.maps.MarkerLibrary) {
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current);
      mapClickListenerRef.current = null;
    }
    if (ghostLineRef.current) {
      ghostLineRef.current.setMap(null);
      ghostLineRef.current = null;
    }
    if (mainlineRef.current) {
      mainlineRef.current.setMap(null);
      mainlineRef.current = null;
    }
    if (node0CloseListenerRef.current) {
      google.maps.event.removeListener(node0CloseListenerRef.current);
      node0CloseListenerRef.current = null;
    }
    markersRef.current[0].content = buildNodeContent(optionsRef.current.nodeStyle, false);
    closeStyleAppliedRef.current = false;

    enterEditingPhase(markerLib);
    optionsRef.current.onPolygonClosed?.();
  }

  function attachMapClickListener(markerLib: google.maps.MarkerLibrary) {
    const map = optionsRef.current.map;
    mapClickListenerRef.current = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      addNode({ lat: event.latLng.lat(), lng: event.latLng.lng() }, markerLib);
    });
  }

  function buildFromSeed(seed: google.maps.LatLngLiteral[], markerLib: google.maps.MarkerLibrary) {
    const map = optionsRef.current.map;
    const nodeStyle = optionsRef.current.nodeStyle;

    seed.forEach(pos => {
      const marker = new markerLib.AdvancedMarkerElement({
        map,
        position: pos,
        content: buildNodeContent(nodeStyle, false),
        gmpDraggable: false,
      });
      markersRef.current.push(marker);
    });

    enterEditingPhase(markerLib);
  }

  const teardown = useCallback(() => {
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current);
      mapClickListenerRef.current = null;
    }
    if (node0CloseListenerRef.current) {
      google.maps.event.removeListener(node0CloseListenerRef.current);
      node0CloseListenerRef.current = null;
    }
    markerDragListenersRef.current.forEach(listener => google.maps.event.removeListener(listener));
    markerDragListenersRef.current = [];
    segmentListenersRef.current.forEach(listener => google.maps.event.removeListener(listener));
    segmentListenersRef.current = [];
    segmentsRef.current.forEach(segment => segment.setMap(null));
    segmentsRef.current = [];
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];
    if (mainlineRef.current) {
      mainlineRef.current.setMap(null);
      mainlineRef.current = null;
    }
    if (ghostLineRef.current) {
      ghostLineRef.current.setMap(null);
      ghostLineRef.current = null;
    }
    closeStyleAppliedRef.current = false;
  }, []);

  const clear = useCallback(() => {
    teardown();
    setPhase('drawing');
    setNodes([]);
  }, [teardown]);

  useEffect(() => () => teardown(), [teardown]);

  useLayoutEffect(() => {
    if (!options.enabled) return;

    let cancelled = false;
    const token = ++activationTokenRef.current;

    void (async () => {
      const markerLib = (await importLibrary('marker')) as google.maps.MarkerLibrary;
      if (cancelled || activationTokenRef.current !== token) return;

      const seed = optionsRef.current.initialNodes;
      if (seed && seed.length >= 3) {
        buildFromSeed([...seed], markerLib);
      } else {
        if (seed && seed.length > 0) {
          console.warn(
            'useNodeLineEditor: initialNodes must have at least 3 points to seed an editable shape; ignoring.',
          );
        }
        setPhase('drawing');
        attachMapClickListener(markerLib);
      }
    })();

    return () => {
      cancelled = true;
      if (mapClickListenerRef.current) {
        google.maps.event.removeListener(mapClickListenerRef.current);
        mapClickListenerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on enabled toggling; attachMapClickListener/buildFromSeed are plain functions redefined every render but only ever read through optionsRef/refs, so including them would re-run this activation on every unrelated render (e.g. every node drag)
  }, [options.enabled]);

  useEffect(() => {
    optionsRef.current.onNodesChange?.(nodes);
  }, [nodes]);

  return { nodes, phase, clear };
}
