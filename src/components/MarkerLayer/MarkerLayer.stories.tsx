import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MarkerLayer, type MarkerItem, type MarkerLayerProps } from './MarkerLayer';

type MarkerLayerStoryArgs = MarkerLayerProps & { apiKey: string; mapId: string };

const DEFAULT_ITEMS: MarkerItem[] = [
  {
    id: 'marker-1',
    position: { lat: -23.5475, lng: -46.6361 },
    title: 'Paulista',
  },
  {
    id: 'marker-2',
    position: { lat: -23.5408, lng: -46.6322 },
    title: 'Consolacao',
  },
  {
    id: 'marker-3',
    position: { lat: -23.5513, lng: -46.6298 },
    title: 'Brigadeiro',
  },
];

const CUSTOM_ICON_ITEMS: MarkerItem[] = [
  {
    id: 'icon-1',
    position: { lat: -23.5475, lng: -46.6361 },
    title: 'Loja Paulista',
    content: (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#ef4444',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
        }}
      />
    ),
  },
  {
    id: 'icon-2',
    position: { lat: -23.5408, lng: -46.6322 },
    title: 'Loja Consolacao',
    content: (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#0ea5e9',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
        }}
      />
    ),
  },
  {
    id: 'icon-3',
    position: { lat: -23.5513, lng: -46.6298 },
    title: 'Loja Brigadeiro',
    content: (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#22c55e',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
        }}
      />
    ),
  },
];

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';
const defaultMapId =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

const meta = {
  title: 'Components/MarkerLayer',
  component: MarkerLayer,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Google Maps API Key',
      table: { category: 'Provider' },
    },
    mapId: {
      control: 'text',
      description: 'Google Maps mapId required by AdvancedMarkerElement (use DEMO_MAP_ID for local development)',
      table: { category: 'Provider' },
    },
    items: {
      control: 'object',
      description: 'Array of marker items to render',
    },
    onClick: {
      action: 'onClick',
      description: 'Called with the MarkerItem when a marker is clicked',
      table: { category: 'Callbacks' },
    },
    onRightClick: {
      action: 'onRightClick',
      description: 'Called with the MarkerItem and client (x, y) coordinates when a marker is right-clicked',
      table: { category: 'Callbacks' },
    },
  },
  decorators: [
    (Story, context) => {
      const items = context.args['items'] as MarkerItem[];
      const lats = items.map(point => point.position.lat);
      const lngs = items.map(point => point.position.lng);
      const center = {
        lat: (Math.max(...lats) + Math.min(...lats)) / 2,
        lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      };

      return (
        <GoogleMapsProvider apiKey={context.args['apiKey'] as string}>
          <GoogleMap center={center} zoom={14} height={500} mapId={context.args['mapId'] as string}>
            <Story />
          </GoogleMap>
        </GoogleMapsProvider>
      );
    },
  ],
} satisfies Meta<MarkerLayerStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiKey: defaultApiKey,
    mapId: defaultMapId,
    items: DEFAULT_ITEMS,
  },
};

export const WithClick: Story = {
  args: {
    apiKey: defaultApiKey,
    mapId: defaultMapId,
    items: DEFAULT_ITEMS,
    onClick: item =>
      alert(
        `ID: ${item.id}\nTítulo: ${item.title ?? 'sem título'}\nLatitude: ${item.position.lat}\nLongitude: ${item.position.lng}`,
      ),
  },
};

export const WithRightClick: Story = {
  args: {
    apiKey: defaultApiKey,
    mapId: defaultMapId,
    items: DEFAULT_ITEMS,
    onRightClick: (item, x, y) =>
      alert(
        `ID: ${item.id}\nTítulo: ${item.title ?? 'sem título'}\nLatitude: ${item.position.lat}\nLongitude: ${item.position.lng}\n\nX: ${x}px\nY: ${y}px`,
      ),
  },
};

export const WithCustomReactIcons: Story = {
  args: {
    apiKey: defaultApiKey,
    mapId: defaultMapId,
    items: CUSTOM_ICON_ITEMS,
    onClick: item =>
      alert(
        `ID: ${item.id}\nTítulo: ${item.title ?? 'sem título'}\nLatitude: ${item.position.lat}\nLongitude: ${item.position.lng}`,
      ),
    onRightClick: (item, x, y) =>
      alert(
        `ID: ${item.id}\nTítulo: ${item.title ?? 'sem título'}\nLatitude: ${item.position.lat}\nLongitude: ${item.position.lng}\n\nX: ${x}px\nY: ${y}px`,
      ),
  },
};
