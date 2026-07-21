import { type PropsWithChildren, useEffect, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GoogleMapsContext } from './GoogleMapsContext';

export interface GoogleMapsProviderProps {
  apiKey: string;
  libraries?: string[];
  version?: string;
  language?: string;
  region?: string;
}

export function GoogleMapsProvider(props: PropsWithChildren<GoogleMapsProviderProps>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [asyncLoadError, setAsyncLoadError] = useState<Error | null>(null);
  const loadError = props.apiKey
    ? asyncLoadError
    : new Error('GoogleMapsProvider: apiKey is required');

  useEffect(() => {
    if (!props.apiKey) return;

    setOptions({
      key: props.apiKey,
      v: props.version ?? 'weekly',
      language: props.language,
      region: props.region,
      libraries: props.libraries ?? [],
    });

    importLibrary('core')
      .then(() => setIsLoaded(true))
      .catch((err: Error) => setAsyncLoadError(err));
  }, [props.apiKey, props.version, props.language, props.region, props.libraries]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {props.children}
    </GoogleMapsContext.Provider>
  );
}
