import type { Meta, StoryObj } from '@storybook/react-vite';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { GoogleMap } from '../GoogleMap/GoogleMap';
import { PolygonLayer, type PolygonItem, type PolygonLayerProps } from './PolygonLayer';

type PolygonLayerStoryArgs = PolygonLayerProps & { apiKey: string };

const DEFAULT_AREAS: PolygonItem[] = [
  {
    id: 'area-1',
    paths: [
      [
        { lat: -23.542, lng: -46.625 },
        { lat: -23.546, lng: -46.612 },
        { lat: -23.555, lng: -46.616 },
        { lat: -23.551, lng: -46.629 },
      ],
    ],
    strokeColor: '#FF6B35',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#FF6B35',
    fillOpacity: 0.3,
  },
  {
    id: 'area-2',
    paths: [
      [
        { lat: -23.536, lng: -46.644 },
        { lat: -23.540, lng: -46.631 },
        { lat: -23.549, lng: -46.635 },
        { lat: -23.545, lng: -46.648 },
      ],
    ],
    strokeColor: '#4ECDC4',
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: '#4ECDC4',
    fillOpacity: 0.3,
  },
];

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const meta = {
  title: 'Components/PolygonLayer',
  component: PolygonLayer,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Google Maps API Key',
      table: { category: 'Provider' },
    },
    areas: {
      control: 'object',
      description: 'Array of polygon items to render',
    },
    onClick: {
      action: 'onClick',
      description: 'Called with the PolygonItem when a polygon is clicked',
      table: { category: 'Callbacks' },
    },
    onRightClick: {
      action: 'onRightClick',
      description: 'Called with the PolygonItem and client (x, y) coordinates when a polygon is right-clicked',
      table: { category: 'Callbacks' },
    },
  },
  decorators: [
    (Story, context) => {
      const areas = context.args['areas'] as PolygonItem[];
      const allPoints = areas.flatMap(a => a.paths.flat());
      const lats = allPoints.map(p => p.lat);
      const lngs = allPoints.map(p => p.lng);
      const center = {
        lat: (Math.max(...lats) + Math.min(...lats)) / 2,
        lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      };
      return (
        <GoogleMapsProvider apiKey={context.args['apiKey'] as string}>
          <GoogleMap center={center} zoom={14} height={500} mapId="DEMO_MAP_ID">
            <Story />
          </GoogleMap>
        </GoogleMapsProvider>
      );
    },
  ],
} satisfies Meta<PolygonLayerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiKey: defaultApiKey,
    areas: DEFAULT_AREAS,
  },
};

export const WithClick: Story = {
  args: {
    apiKey: defaultApiKey,
    areas: DEFAULT_AREAS,
    onClick: (item) =>
      alert(
        `ID: ${item.id}\nCor: ${item.fillColor ?? 'padrão'}\nOpacidade: ${item.fillOpacity ?? 0.2}\nPontos: ${item.paths.flat().length}`,
      ),
  },
};

export const WithRightClick: Story = {
  args: {
    apiKey: defaultApiKey,
    areas: DEFAULT_AREAS,
    onRightClick: (item, x, y) =>
      alert(
        `ID: ${item.id}\nCor: ${item.fillColor ?? 'padrão'}\nOpacidade: ${item.fillOpacity ?? 0.2}\nPontos: ${item.paths.flat().length}\n\nX: ${x}px\nY: ${y}px`,
      ),
  },
};
