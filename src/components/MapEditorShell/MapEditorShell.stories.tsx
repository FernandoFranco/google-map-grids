import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MapEditorShell } from './MapEditorShell';
import { useEditorContext } from './useEditorContext';
import { useEditorTool } from './useEditorTool';

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };
const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

function MockEditor(props: { name: string; key: string }) {
  useEditorTool({
    key: props.key,
    button: `📍 ${props.name}`,
    controls: (
      <div>
        <h3>{props.name}</h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          This is a mock editor. Click the map (not implemented in this demo).
        </p>
        <button
          onClick={() => {
            const { deactivateEditor } = useEditorContext();
            deactivateEditor();
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    ),
  });

  return null;
}

const meta = {
  title: 'Components/MapEditorShell',
  component: MapEditorShell,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    sidebarPosition: {
      control: { type: 'radio' },
      options: ['left', 'right'],
      description: 'Position of sidebar relative to map',
    },
    sidebarWidth: {
      control: 'text',
      description: 'Width of sidebar (e.g. "260px", "300px")',
    },
  },
} satisfies Meta<typeof MapEditorShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sidebarPosition: 'left',
    sidebarWidth: '260px',
  },
  render: (args) => (
    <GoogleMapsProvider apiKey={defaultApiKey}>
      <MapEditorShell {...args}>
        <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={400} >
          <MockEditor name="Add Marker" key="add-marker" />
          <MockEditor name="Draw Area" key="draw-area" />
          <MockEditor name="Set Restriction" key="restrict" />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  ),
};

export const RightSidebar: Story = {
  args: {
    sidebarPosition: 'right',
    sidebarWidth: '280px',
  },
  render: (args) => (
    <GoogleMapsProvider apiKey={defaultApiKey}>
      <MapEditorShell {...args}>
        <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={400}>
          <MockEditor name="Add Marker" key="add-marker" />
          <MockEditor name="Draw Area" key="draw-area" />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  ),
};
