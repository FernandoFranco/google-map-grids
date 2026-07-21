import { useEffect, useState } from 'react';

import { importLibrary } from '@googlemaps/js-api-loader';

export function useMarker(
  map: google.maps.Map,
  options: google.maps.marker.AdvancedMarkerElementOptions,
  visible = true,
): google.maps.marker.AdvancedMarkerElement | null {
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const { position, content, title, gmpDraggable } = options;

  useEffect(() => {
    let disposed = false;
    let created: google.maps.marker.AdvancedMarkerElement | null = null;

    void (async () => {
      const { AdvancedMarkerElement } = (await importLibrary(
        'marker',
      )) as google.maps.MarkerLibrary;
      if (disposed) return;

      created = new AdvancedMarkerElement({
        map: visible ? map : null,
        position,
        content,
        title,
        gmpDraggable,
      });
      setMarker(created);
    })();

    return () => {
      disposed = true;
      if (created) {
        created.map = null;
      }
      setMarker(null);
    };
  }, [map, visible, position, content, title, gmpDraggable]);

  return marker;
}
