import { importLibrary } from '@googlemaps/js-api-loader';
import { useEffect, useRef, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { useMap } from '../GoogleMap/MapContext';

export interface MarkerItem {
  id: string;
  position: google.maps.LatLngLiteral;
  title?: string;
  content?: Node | string | ReactNode;
}

export interface MarkerLayerProps {
  items: MarkerItem[];
  onClick?: (item: MarkerItem) => void;
  onRightClick?: (item: MarkerItem, x: number, y: number) => void;
}

type MarkerContentHandle = {
  node: Node | undefined;
  cleanup: () => void;
};

function toMarkerContent(
  content: MarkerItem['content'],
  markerLibrary: google.maps.MarkerLibrary,
): MarkerContentHandle {
  if (content === undefined || content === null) {
    const pin = new markerLibrary.PinElement();
    return { node: pin.element, cleanup: () => {} };
  }

  if (typeof content === 'string') {
    const container = document.createElement('div');
    container.textContent = content;
    return { node: container, cleanup: () => {} };
  }

  if (content instanceof Node) {
    return { node: content, cleanup: () => {} };
  }

  const container = document.createElement('div');
  const root: Root = createRoot(container);
  root.render(content);

  return {
    node: container,
    cleanup: () => {
      root.unmount();
    },
  };
}

export function MarkerLayer(props: MarkerLayerProps) {
  const map = useMap();

  type Entry = {
    marker: google.maps.marker.AdvancedMarkerElement;
    listeners: google.maps.MapsEventListener[];
    cleanupContent: () => void;
    cleanupContextMenu: () => void;
  };

  const registryRef = useRef(new Map<string, Entry>());
  const itemsRef = useRef(props.items);
  const onClickRef = useRef(props.onClick);
  const onRightClickRef = useRef(props.onRightClick);

  useEffect(() => {
    itemsRef.current = props.items;
    onClickRef.current = props.onClick;
    onRightClickRef.current = props.onRightClick;
  });

  useEffect(() => {
    let disposed = false;
    const registry = registryRef.current;

    const attachContextMenu = (id: string, node: Node | undefined): (() => void) => {
      if (!(node instanceof HTMLElement)) {
        return () => {};
      }

      const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const current = itemsRef.current.find(currentItem => currentItem.id === id);
        if (!current) return;

        onRightClickRef.current?.(current, event.clientX, event.clientY);
      };

      node.addEventListener('contextmenu', onContextMenu);

      return () => {
        node.removeEventListener('contextmenu', onContextMenu);
      };
    };

    const syncMarkers = async () => {
      const markerLibrary = (await importLibrary('marker')) as google.maps.MarkerLibrary;
      if (disposed) return;

      const incomingIds = new Set(props.items.map(item => item.id));

      for (const [id, entry] of registry) {
        if (!incomingIds.has(id)) {
          entry.listeners.forEach(listener => google.maps.event.removeListener(listener));
          entry.cleanupContextMenu();
          entry.cleanupContent();
          entry.marker.map = null;
          registry.delete(id);
        }
      }

      for (const item of props.items) {
        const existing = registry.get(item.id);

        if (existing) {
          existing.marker.position = item.position;
          existing.marker.title = item.title ?? '';
          existing.cleanupContextMenu();
          existing.cleanupContent();
          const contentHandle = toMarkerContent(item.content, markerLibrary);
          existing.marker.content = contentHandle.node;
          existing.cleanupContent = contentHandle.cleanup;
          existing.cleanupContextMenu = attachContextMenu(item.id, contentHandle.node);
          continue;
        }

        const contentHandle = toMarkerContent(item.content, markerLibrary);

        const marker = new markerLibrary.AdvancedMarkerElement({
          map,
          position: item.position,
          title: item.title ?? '',
          content: contentHandle.node,
          gmpClickable: true,
        });

        const listeners: google.maps.MapsEventListener[] = [];

        listeners.push(
          marker.addListener('click', () => {
            const current = itemsRef.current.find(currentItem => currentItem.id === item.id);
            if (!current) return;
            onClickRef.current?.(current);
          }),
        );

        registry.set(item.id, {
          marker,
          listeners,
          cleanupContent: contentHandle.cleanup,
          cleanupContextMenu: attachContextMenu(item.id, contentHandle.node),
        });
      }
    };

    void syncMarkers();

    return () => {
      disposed = true;
    };
  }, [map, props.items]);

  useEffect(() => {
    const registry = registryRef.current;

    return () => {
      for (const [, entry] of registry) {
        entry.listeners.forEach(listener => google.maps.event.removeListener(listener));
        entry.cleanupContextMenu();
        entry.cleanupContent();
        entry.marker.map = null;
      }

      registry.clear();
    };
  }, []);

  return null;
}
