import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MapControl } from '../MapControl/MapControl';
import { EditorProvider } from './EditorProvider';
import { useEditorContext } from './useEditorContext';
import { useEditorTool } from './useEditorTool';
import { useEditorTools } from './useEditorTools';

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };
const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

type EditorProviderStoryArgs = { apiKey: string };

const DEMO_BUTTON_CLASS = 'editor-provider-demo-btn';
const DEMO_STYLES = `
  .${DEMO_BUTTON_CLASS} {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
  }
  .${DEMO_BUTTON_CLASS}:hover { background: #f5f5f5; }
`;

function MockEditor(props: { name: string; toolKey: string }) {
  const { activateEditor, deactivateEditor } = useEditorContext();

  useEditorTool({
    key: props.toolKey,
    button: (
      <button
        type="button"
        className={DEMO_BUTTON_CLASS}
        onClick={() => activateEditor(props.toolKey)}
      >
        📍 {props.name}
      </button>
    ),
    controls: (
      <div style={{ padding: '8px 12px', background: '#fff', border: '1px solid #ccc' }}>
        <strong>{props.name}</strong>
        <button type="button" onClick={deactivateEditor} style={{ marginLeft: 8 }}>
          Fechar
        </button>
      </div>
    ),
  });

  return null;
}

function RegisteredToolButtons() {
  const tools = useEditorTools();

  return (
    <>
      {Array.from(tools.entries()).map(([key, tool]) => (
        <Fragment key={key}>{tool.button}</Fragment>
      ))}
    </>
  );
}

function RegisteredActiveControls() {
  const { activeEditorKey } = useEditorContext();
  const tools = useEditorTools();

  if (activeEditorKey === null) return null;

  return <>{tools.get(activeEditorKey)?.controls ?? null}</>;
}

function CustomLayoutDemo(args: EditorProviderStoryArgs) {
  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey?.trim() || defaultApiKey}>
        <EditorProvider>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 500 }}>
            <header style={{ display: 'flex', gap: 8, padding: 8 }}>
              <RegisteredToolButtons />
            </header>
            <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={440}>
              <MockEditor name="Adicionar Marcador" toolKey="add-marker" />
              <MockEditor name="Desenhar Área" toolKey="draw-area" />
            </GoogleMap>
            <aside style={{ padding: 8 }}>
              <RegisteredActiveControls />
            </aside>
          </div>
        </EditorProvider>
      </GoogleMapsProvider>
    </>
  );
}

function NativeMapControlDemo(args: EditorProviderStoryArgs) {
  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey?.trim() || defaultApiKey}>
        <EditorProvider>
          <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={500}>
            <MockEditor name="Adicionar Marcador" toolKey="add-marker" />
            <MockEditor name="Desenhar Área" toolKey="draw-area" />
            <MapControl position="TOP_RIGHT">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <RegisteredToolButtons />
              </div>
            </MapControl>
            <MapControl position="BOTTOM_LEFT">
              <RegisteredActiveControls />
            </MapControl>
          </GoogleMap>
        </EditorProvider>
      </GoogleMapsProvider>
    </>
  );
}

const meta = {
  title: 'Components/EditorProvider',
  component: EditorProvider,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description:
        "Leave empty to use this demo's restricted API key. Paste your own Google Maps API key to preview with it instead.",
      table: { category: 'Provider' },
    },
  },
} as Meta<EditorProviderStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const CUSTOM_LAYOUT_EXAMPLE_CODE = `function CustomEditorTool(props: { name: string; toolKey: string }) {
  const { activateEditor } = useEditorContext();

  useEditorTool({
    key: props.toolKey,
    button: (
      <button type="button" onClick={() => activateEditor(props.toolKey)}>
        📍 {props.name}
      </button>
    ),
    controls: <div>Editing {props.name}</div>,
  });

  return null;
}

function RegisteredToolButtons() {
  const tools = useEditorTools();
  return <>{Array.from(tools.values()).map((tool, i) => <Fragment key={i}>{tool.button}</Fragment>)}</>;
}

function RegisteredActiveControls() {
  const { activeEditorKey } = useEditorContext();
  const tools = useEditorTools();
  if (activeEditorKey === null) return null;
  return <>{tools.get(activeEditorKey)?.controls ?? null}</>;
}

function CustomLayoutDemo() {
  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <EditorProvider>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <header>
            <RegisteredToolButtons />
          </header>
          <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
            <CustomEditorTool name="Add Marker" toolKey="add-marker" />
            <CustomEditorTool name="Draw Area" toolKey="draw-area" />
          </GoogleMap>
          <aside>
            <RegisteredActiveControls />
          </aside>
        </div>
      </EditorProvider>
    </GoogleMapsProvider>
  );
}`;

const NATIVE_MAP_CONTROL_EXAMPLE_CODE = `function NativeMapControlDemo() {
  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <EditorProvider>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
          <CustomEditorTool name="Add Marker" toolKey="add-marker" />
          <CustomEditorTool name="Draw Area" toolKey="draw-area" />
          <MapControl position="TOP_RIGHT">
            <RegisteredToolButtons />
          </MapControl>
          <MapControl position="BOTTOM_LEFT">
            <RegisteredActiveControls />
          </MapControl>
        </GoogleMap>
      </EditorProvider>
    </GoogleMapsProvider>
  );
}`;

export const Default: Story = {
  args: { apiKey: '' },
  render: (args) => <CustomLayoutDemo {...args} />,
  parameters: {
    docs: { source: { code: CUSTOM_LAYOUT_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const NativeMapControl: Story = {
  args: { apiKey: '' },
  render: (args) => <NativeMapControlDemo {...args} />,
  parameters: {
    docs: { source: { code: NATIVE_MAP_CONTROL_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};
