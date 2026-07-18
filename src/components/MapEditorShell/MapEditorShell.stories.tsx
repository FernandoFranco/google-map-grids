import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MapEditorShell } from './MapEditorShell';
import { useEditorContext } from './useEditorContext';
import { useEditorTool } from './useEditorTool';

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };
const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const DEMO_BUTTON_CLASS = 'demo-tool-button';
const DEMO_STYLES = `
  .${DEMO_BUTTON_CLASS} {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 12px;
  }
  .${DEMO_BUTTON_CLASS}:hover { background: #f5f5f5; }
`;

function MockEditor(props: { name: string; toolKey: string }) {
  const { activateEditor } = useEditorContext();

  useEditorTool({
    key: props.toolKey,
    button: (
      <button type="button" className={DEMO_BUTTON_CLASS} onClick={() => activateEditor(props.toolKey)}>
        📍 {props.name}
      </button>
    ),
    controls: (
      <div>
        <h3>{props.name}</h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          This is a mock editor. Click the map (not implemented in this demo).
        </p>
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

const DEFAULT_EXAMPLE_CODE = `function CustomEditorTool(props: { name: string; toolKey: string }) {
  const { activateEditor } = useEditorContext();

  useEditorTool({
    key: props.toolKey,
    button: (
      <button type="button" onClick={() => activateEditor(props.toolKey)}>
        📍 {props.name}
      </button>
    ),
    controls: (
      <div>
        <h3>{props.name}</h3>
        <p>Click the map to use this tool.</p>
      </div>
    ),
  });

  return null;
}

function MapEditorShellDemo() {
  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell sidebarPosition="left" sidebarWidth="260px">
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
          <CustomEditorTool name="Add Marker" toolKey="add-marker" />
          <CustomEditorTool name="Draw Area" toolKey="draw-area" />
          <CustomEditorTool name="Set Restriction" toolKey="restrict" />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

const RIGHT_SIDEBAR_EXAMPLE_CODE = `function CustomEditorTool(props: { name: string; toolKey: string }) {
  const { activateEditor } = useEditorContext();

  useEditorTool({
    key: props.toolKey,
    button: (
      <button type="button" onClick={() => activateEditor(props.toolKey)}>
        📍 {props.name}
      </button>
    ),
    controls: (
      <div>
        <h3>{props.name}</h3>
        <p>Click the map to use this tool.</p>
      </div>
    ),
  });

  return null;
}

function MapEditorShellDemo() {
  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell sidebarPosition="right" sidebarWidth="280px">
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
          <CustomEditorTool name="Add Marker" toolKey="add-marker" />
          <CustomEditorTool name="Draw Area" toolKey="draw-area" />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

export const Default: Story = {
  args: {
    sidebarPosition: 'left',
    sidebarWidth: '260px',
  },
  render: (args) => (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={defaultApiKey}>
        <MapEditorShell {...args}>
          <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={400}>
            <MockEditor name="Add Marker" toolKey="add-marker" />
            <MockEditor name="Draw Area" toolKey="draw-area" />
            <MockEditor name="Set Restriction" toolKey="restrict" />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  ),
  parameters: {
    docs: { source: { code: DEFAULT_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const RightSidebar: Story = {
  args: {
    sidebarPosition: 'right',
    sidebarWidth: '280px',
  },
  render: (args) => (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={defaultApiKey}>
        <MapEditorShell {...args}>
          <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={400}>
            <MockEditor name="Add Marker" toolKey="add-marker" />
            <MockEditor name="Draw Area" toolKey="draw-area" />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  ),
  parameters: {
    docs: { source: { code: RIGHT_SIDEBAR_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};
