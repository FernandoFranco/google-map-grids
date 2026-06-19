import { useEffect, useRef } from 'react';
import { importLibrary } from '@googlemaps/js-api-loader';
import { useGoogleMaps } from '../GoogleMapsProvider/useGoogleMaps';

export interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  height?: string | number;
  className?: string;
  mapId?: string;
  options?: Omit<google.maps.MapOptions, 'center' | 'zoom' | 'mapId'>;
  onLoad?: (map: google.maps.Map) => void;
}

export function GoogleMap(props: GoogleMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    importLibrary('maps').then(({ Map }) => {
      if (!containerRef.current) return;
      const map = new Map(containerRef.current, {
        center: props.center,
        zoom: props.zoom,
        mapId: props.mapId,
        ...props.options,
      });
      mapRef.current = map;
      props.onLoad?.(map);
    });
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(props.center);
  }, [props.center.lat, props.center.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(props.zoom);
  }, [props.zoom]);

  const resolvedHeight =
    props.height === undefined
      ? '100%'
      : typeof props.height === 'number'
        ? `${props.height}px`
        : props.height;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: resolvedHeight,
  };

  if (loadError) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          color: '#d32f2f',
          fontFamily: 'sans-serif',
        }}
      >
        Failed to load Google Maps: {loadError.message}
      </div>
    );
  }

  return <div ref={containerRef} style={containerStyle} className={props.className} />;
}
