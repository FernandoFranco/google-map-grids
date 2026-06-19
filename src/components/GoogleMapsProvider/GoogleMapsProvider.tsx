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
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!props.apiKey) {
      setLoadError(new Error('GoogleMapsProvider: apiKey is required'));
      return;
    }

    setOptions({
      key: props.apiKey,
      v: props.version ?? 'weekly',
      language: props.language,
      region: props.region,
      libraries: props.libraries ?? [],
    });

    importLibrary('core')
      .then(() => setIsLoaded(true))
      .catch((err: Error) => setLoadError(err));
  }, [props.apiKey, props.version, props.language, props.region]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {props.children}
    </GoogleMapsContext.Provider>
  );
}
