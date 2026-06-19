import { useContext } from 'react';
import { GoogleMapsContext, type GoogleMapsContextValue } from './GoogleMapsContext';

export function useGoogleMaps(): GoogleMapsContextValue {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}
