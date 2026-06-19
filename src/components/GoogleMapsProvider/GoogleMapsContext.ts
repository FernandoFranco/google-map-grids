import { createContext } from 'react';

export interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | null;
}

export const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: null,
});
