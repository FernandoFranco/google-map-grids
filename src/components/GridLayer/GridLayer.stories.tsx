import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { GoogleMap } from '../GoogleMap/GoogleMap';
import { MapRestriction } from '../MapRestriction/MapRestriction';
import { GridLayer, type GridLayerProps } from './GridLayer';

type GridLayerStoryArgs = GridLayerProps & { apiKey: string };

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
  title: 'Components/GridLayer',
  component: GridLayer,
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
    cellSize: {
      control: { type: 'range', min: 50, max: 2000, step: 50 },
      description: 'Cell size in meters',
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
} satisfies Meta<GridLayerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: SP_POLYGON,
    cellSize: 500,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
  },
};

export const SmallCells: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: SP_POLYGON,
    cellSize: 100,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
  },
};

export const LargeArea: Story = {
  args: {
    apiKey: defaultApiKey,
    polygon: LA_POLYGON,
    cellSize: 1000,
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
  },
};
