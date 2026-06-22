import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { GoogleMap } from '../GoogleMap/GoogleMap';
import { MapRestriction, type MapRestrictionProps } from './MapRestriction';

type MapRestrictionStoryArgs = MapRestrictionProps & { apiKey: string };

const SP_POLYGON: google.maps.LatLngLiteral[] = [
  { lat: -23.50, lng: -46.63 },
  { lat: -23.54, lng: -46.59 },
  { lat: -23.58, lng: -46.60 },
  { lat: -23.60, lng: -46.64 },
  { lat: -23.56, lng: -46.70 },
  { lat: -23.52, lng: -46.66 },
];

const SP_POLYGON_CCW: google.maps.LatLngLiteral[] = [...SP_POLYGON].reverse();

const LA_POLYGON: google.maps.LatLngLiteral[] = [
  { lat: 34.08, lng: -118.24 },
  { lat: 34.06, lng: -118.20 },
  { lat: 34.03, lng: -118.21 },
  { lat: 34.02, lng: -118.25 },
  { lat: 34.04, lng: -118.28 },
  { lat: 34.07, lng: -118.27 },
];

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const meta = {
  title: 'Components/MapRestriction',
  component: MapRestriction,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Google Maps API Key',
      table: { category: 'Provider' },
    },
    polygon: {
      control: 'object',
      description: 'Array of LatLngLiteral vertices defining the restricted area',
    },
    overlayColor: {
      control: 'color',
      description: 'Color of the dark overlay outside the polygon',
    },
    overlayOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Opacity of the overlay (0 = transparent, 1 = opaque)',
    },
    overlayPadding: {
      control: { type: 'number', min: 1, max: 180, step: 1 },
      description: 'Degrees of padding added around the bounding box to form the outer overlay ring (default: 60)',
    },
  },
  decorators: [
    (Story, context) => {
      const polygon = context.args['polygon'] as google.maps.LatLngLiteral[];
      const lats = polygon.map(p => p.lat);
      const lngs = polygon.map(p => p.lng);
      const center = {
        lat: (Math.max(...lats) + Math.min(...lats)) / 2,
        lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      };
      return (
        <GoogleMapsProvider apiKey={context.args['apiKey'] as string}>
          <GoogleMap center={center} zoom={13} height={500} mapId="DEMO_MAP_ID">
            <Story />
          </GoogleMap>
        </GoogleMapsProvider>
      );
    },
  ],
} satisfies Meta<MapRestrictionStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: SP_POLYGON,
    overlayColor: '#000000',
    overlayOpacity: 0.8,
    overlayPadding: 60,
  },
};

export const CustomOverlay: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: LA_POLYGON,
    overlayColor: '#1a237e',
    overlayOpacity: 0.6,
    overlayPadding: 60,
  },
};

export const ClockwisePolygon: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: SP_POLYGON_CCW,
    overlayColor: '#ff0000',
    overlayOpacity: 0.2,
    overlayPadding: 60,
  },
};
