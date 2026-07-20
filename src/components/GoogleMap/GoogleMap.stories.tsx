import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { GoogleMap, type GoogleMapProps } from './GoogleMap';

type GoogleMapStoryArgs = GoogleMapProps & { apiKey: string };

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };

const storyMapHeight = 400;
const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const USAGE_EXAMPLE_CODE = `<GoogleMapsProvider apiKey="YOUR_GOOGLE_MAPS_API_KEY">
  <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={12} height={400} mapId="YOUR_MAP_ID" />
</GoogleMapsProvider>`;

const meta = {
  title: 'Components/GoogleMap',
  component: GoogleMap,
  parameters: {
    layout: 'fullscreen',
    docs: { source: { code: USAGE_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description:
        "Leave empty to use this demo's restricted API key. Paste your own Google Maps API key to preview with it instead.",
      table: { category: 'Provider' },
    },
    center: {
      control: 'object',
      description: 'Map center coordinates { lat, lng }',
    },
    zoom: {
      control: { type: 'range', min: 1, max: 21, step: 1 },
      description: 'Zoom level (1 = world, 21 = building)',
    },
    height: {
      control: 'text',
      description:
        "Map height — any CSS value ('400px', '50vh') or a number (px). Defaults to '100%' to fill the parent.",
    },
    mapId: {
      control: 'text',
      description: 'Cloud-based map style ID from Google Cloud Console',
    },
    options: {
      control: 'object',
      description: 'Additional google.maps.MapOptions (except center, zoom, mapId)',
    },
    className: {
      control: 'text',
      description: 'CSS class applied to the map container',
    },
  },
  decorators: [
    (Story, context) => (
      <GoogleMapsProvider apiKey={(context.args['apiKey'] as string)?.trim() || defaultApiKey}>
        <Story />
      </GoogleMapsProvider>
    ),
  ],
} satisfies Meta<GoogleMapStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fills the parent container (height: 100%). In Storybook fullscreen, covers the viewport. */
export const Default: Story = {
  args: {
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    center: SAO_PAULO,
    zoom: 10,
    height: storyMapHeight,
  },
};

export const Satellite: Story = {
  args: {
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    center: SAO_PAULO,
    zoom: 14,
    options: { mapTypeId: 'satellite' },
    height: storyMapHeight,
  },
};

export const Zoomed: Story = {
  args: {
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    center: SAO_PAULO,
    zoom: 18,
    height: storyMapHeight,
  },
};

/** Demonstrates the height prop — map rendered with a fixed 400px height inside a normal flow. */
export const FixedHeight: Story = {
  parameters: { layout: 'centered' },
  decorators: [
    (Story, context) => (
      <GoogleMapsProvider apiKey={(context.args['apiKey'] as string)?.trim() || defaultApiKey}>
        <div style={{ width: '800px' }}>
          <Story />
        </div>
      </GoogleMapsProvider>
    ),
  ],
  args: {
    apiKey: '',
    mapId: 'DEMO_MAP_ID',
    center: SAO_PAULO,
    zoom: 12,
    height: storyMapHeight,
  },
};
