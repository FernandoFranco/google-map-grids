import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MapControl, type MapControlPosition } from './MapControl';

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };
const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

type MapControlStoryArgs = {
  apiKey: string;
  position: MapControlPosition;
};

const BUTTON_STYLE: React.CSSProperties = {
  margin: 8,
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
};

const POSITIONS: MapControlPosition[] = [
  'TOP_LEFT',
  'TOP_CENTER',
  'TOP_RIGHT',
  'LEFT_TOP',
  'LEFT_CENTER',
  'LEFT_BOTTOM',
  'RIGHT_TOP',
  'RIGHT_CENTER',
  'RIGHT_BOTTOM',
  'BOTTOM_LEFT',
  'BOTTOM_CENTER',
  'BOTTOM_RIGHT',
];

const USAGE_EXAMPLE_CODE = `<GoogleMapsProvider apiKey="YOUR_GOOGLE_MAPS_API_KEY">
  <GoogleMap center={{ lat: -23.55, lng: -46.63 }} zoom={13} height={500} mapId="YOUR_MAP_ID">
    <MapControl position="TOP_RIGHT">
      <button onClick={() => console.log('clicked')}>My Tool</button>
    </MapControl>
  </GoogleMap>
</GoogleMapsProvider>`;

const meta = {
  title: 'Components/MapControl',
  component: MapControl,
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
    position: {
      control: { type: 'select' },
      options: POSITIONS,
      description: 'Where on the map chrome this control is placed (google.maps.ControlPosition)',
    },
  },
  decorators: [
    (Story, context) => (
      <GoogleMapsProvider apiKey={(context.args['apiKey'] as string)?.trim() || defaultApiKey}>
        <GoogleMap center={SAO_PAULO} zoom={14} height={500} mapId="DEMO_MAP_ID">
          <Story />
        </GoogleMap>
      </GoogleMapsProvider>
    ),
  ],
} satisfies Meta<MapControlStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { apiKey: '', position: 'TOP_RIGHT' },
  render: (args) => (
    <MapControl position={args.position}>
      <button type="button" style={BUTTON_STYLE}>
        📍 My Tool
      </button>
    </MapControl>
  ),
};

export const Playground: Story = {
  args: { apiKey: '', position: 'BOTTOM_CENTER' },
  render: (args) => (
    <MapControl position={args.position}>
      <button type="button" style={BUTTON_STYLE}>
        📍 My Tool
      </button>
    </MapControl>
  ),
};

export const MultipleControls: Story = {
  args: { apiKey: '', position: 'TOP_RIGHT' },
  render: () => (
    <>
      <MapControl position="TOP_LEFT">
        <button type="button" style={BUTTON_STYLE}>
          ⬅️ Top Left
        </button>
      </MapControl>
      <MapControl position="TOP_RIGHT">
        <button type="button" style={BUTTON_STYLE}>
          ➡️ Top Right
        </button>
      </MapControl>
      <MapControl position="BOTTOM_CENTER">
        <button type="button" style={BUTTON_STYLE}>
          ⬇️ Bottom Center
        </button>
      </MapControl>
    </>
  ),
};
