import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { GoogleMap } from '../GoogleMap/GoogleMap';

const meta = {
  title: 'Components/GoogleMapsProvider',
  component: GoogleMapsProvider,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Google Maps API Key. Get one at https://console.cloud.google.com/',
    },
    libraries: {
      control: 'object',
      description: 'Additional Google Maps libraries to load (e.g. ["places", "geometry"])',
    },
    version: {
      control: 'text',
      description: 'Google Maps JS API version',
    },
    language: {
      control: 'text',
      description: 'Language for map labels and controls',
    },
    region: {
      control: 'text',
      description: 'Region code to bias results',
    },
  },
} satisfies Meta<typeof GoogleMapsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Usage: Story = {
  args: {
    apiKey: (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '',
    children: (
      <GoogleMap
        center={{ lat: -23.5505, lng: -46.6333 }}
        zoom={12}
        height={500}
        mapId="DEMO_MAP_ID"
      />
    ),
  },
};
