import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { GoogleMap } from '../GoogleMap/GoogleMap';
import { MapRestriction } from '../MapRestriction/MapRestriction';
import { MgrsLayer, type MgrsLayerProps, type MgrsPrecision } from './MgrsLayer';

type MgrsLayerStoryArgs = MgrsLayerProps & { apiKey: string };

const SP_POLYGON: google.maps.LatLngLiteral[] = [
  { lat: -23.538, lng: -46.620 },
  { lat: -23.542, lng: -46.610 },
  { lat: -23.552, lng: -46.612 },
  { lat: -23.556, lng: -46.622 },
  { lat: -23.552, lng: -46.633 },
  { lat: -23.542, lng: -46.631 },
];

const LA_POLYGON: google.maps.LatLngLiteral[] = [
  { lat: 34.063, lng: -118.235 },
  { lat: 34.059, lng: -118.223 },
  { lat: 34.050, lng: -118.225 },
  { lat: 34.046, lng: -118.237 },
  { lat: 34.050, lng: -118.249 },
  { lat: 34.059, lng: -118.247 },
];

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const meta = {
  title: 'Components/MgrsLayer',
  component: MgrsLayer,
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
      description: 'Array of LatLngLiteral vertices defining the grid area',
    },
    precision: {
      control: { type: 'select', labels: { 1: '1m', 10: '10m', 100: '100m', 1000: '1km', 10000: '10km', 100000: '100km' } },
      options: [1, 10, 100, 1000, 10000, 100000] as MgrsPrecision[],
      description: 'MGRS precision level in meters',
    },
    onGridRef: {
      action: 'onGridRef',
      description: 'Called with the MGRS grid ref for the polygon area (e.g. "23K LP")',
      table: { category: 'Callbacks' },
    },
    strokeColor: {
      control: 'color',
      description: 'Grid line color',
    },
    strokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Grid line opacity',
    },
    strokeWeight: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.5 },
      description: 'Grid line width in pixels',
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
          <GoogleMap center={center} zoom={13} height={500}>
            <MapRestriction polygon={polygon} />
            <Story />
          </GoogleMap>
        </GoogleMapsProvider>
      );
    },
  ],
} satisfies Meta<MgrsLayerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: SP_POLYGON,
    precision: 1000,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
  },
};

export const Fine: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: SP_POLYGON,
    precision: 100,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
  },
};

export const LargeArea: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: LA_POLYGON,
    precision: 1000,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
  },
};
