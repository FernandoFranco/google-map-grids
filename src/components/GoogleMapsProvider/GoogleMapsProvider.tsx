import { useEffect, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GoogleMapsContext } from './GoogleMapsContext';

export interface GoogleMapsProviderProps {
  apiKey: string;
  /** Additional libraries to declare (e.g. ['places', 'geometry']). Each component loads its own via importLibrary(). */
  libraries?: string[];
  /** Maps JS API version. Defaults to 'weekly'. Cannot be changed after first load. */
  version?: string;
  language?: string;
  region?: string;
  children: React.ReactNode;
}

export function GoogleMapsProvider({
  apiKey,
  libraries = [],
  version = 'weekly',
  language,
  region,
  children,
}: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError(new Error('GoogleMapsProvider: apiKey is required'));
      return;
    }

    setOptions({ key: apiKey, v: version, language, region, libraries });

    importLibrary('core')
      .then(() => setIsLoaded(true))
      .catch((err: Error) => setLoadError(err));
  }, [apiKey, version, language, region]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
