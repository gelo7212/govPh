/**
 * Map Providers Configuration
 * Handles integration with various mapping services
 */

export enum MapProvider {
  GOOGLE_MAPS = 'google_maps',
  OPEN_MAPS = 'open_maps',
  MAPBOX = 'mapbox',
}

interface MapProviderConfig {
  provider: MapProvider;
  apiKey: string;
  baseUrl: string;
}

const mapProviders: Record<MapProvider, MapProviderConfig> = {
  [MapProvider.GOOGLE_MAPS]: {
    provider: MapProvider.GOOGLE_MAPS,
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    baseUrl: 'https://maps.googleapis.com',
  },
  [MapProvider.OPEN_MAPS]: {
    provider: MapProvider.OPEN_MAPS,
    apiKey: process.env.OPEN_MAPS_API_KEY || '',
    baseUrl: 'https://api.openstreetmap.org',
  },
  [MapProvider.MAPBOX]: {
    provider: MapProvider.MAPBOX,
    apiKey: process.env.MAPBOX_API_KEY || '',
    baseUrl: 'https://api.mapbox.com',
  },
};

export const getMapProvider = (provider: MapProvider): MapProviderConfig => {
  return mapProviders[provider];
};

export const getDefaultMapProvider = (): MapProvider => {
  return (process.env.DEFAULT_MAP_PROVIDER as MapProvider) || MapProvider.GOOGLE_MAPS;
};
