import { useEffect, useRef, useState } from 'react';

import { importLibrary } from '@googlemaps/js-api-loader';

export function useMarker(
  map: google.maps.Map,
  options: google.maps.marker.AdvancedMarkerElementOptions,
): google.maps.marker.AdvancedMarkerElement | null {
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let disposed = false;
    let created: google.maps.marker.AdvancedMarkerElement | null = null;

    void (async () => {
      const { AdvancedMarkerElement } = (await importLibrary('marker')) as google.maps.MarkerLibrary;
      if (disposed) return;

      created = new AdvancedMarkerElement({ map, ...optionsRef.current });
      setMarker(created);
    })();

    return () => {
      disposed = true;
      if (created) {
        created.map = null;
        setMarker(null);
      }
    };
  }, [map]);

  useEffect(() => {
    if (!marker) return;
    if (options.position !== undefined) marker.position = options.position;
  }, [marker, options.position]);

  useEffect(() => {
    if (!marker) return;
    if (options.content !== undefined) marker.content = options.content as Node | null | undefined;
  }, [marker, options.content]);

  useEffect(() => {
    if (!marker) return;
    if (options.title !== undefined) marker.title = options.title ?? '';
  }, [marker, options.title]);

  useEffect(() => {
    if (!marker) return;
    if (options.gmpDraggable !== undefined) marker.gmpDraggable = options.gmpDraggable;
  }, [marker, options.gmpDraggable]);

  return marker;
}
