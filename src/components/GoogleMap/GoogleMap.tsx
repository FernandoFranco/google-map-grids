import { useEffect, useRef } from 'react';
import { importLibrary } from '@googlemaps/js-api-loader';
import { useGoogleMaps } from '../GoogleMapsProvider/useGoogleMaps';

export interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
  style?: React.CSSProperties;
  className?: string;
  mapId?: string;
  options?: Omit<google.maps.MapOptions, 'center' | 'zoom' | 'mapId'>;
  onLoad?: (map: google.maps.Map) => void;
}

export function GoogleMap({
  center,
  zoom,
  style,
  className,
  mapId,
  options,
  onLoad,
}: GoogleMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    importLibrary('maps').then(({ Map }) => {
      if (!containerRef.current) return;
      const map = new Map(containerRef.current, { center, zoom, mapId, ...options });
      mapRef.current = map;
      onLoad?.(map);
    });
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(center);
  }, [center.lat, center.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(zoom);
  }, [zoom]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '400px',
    ...style,
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

  return <div ref={containerRef} style={containerStyle} className={className} />;
}
