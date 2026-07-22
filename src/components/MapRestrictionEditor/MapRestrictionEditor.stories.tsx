import { Fragment, type PropsWithChildren, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { EditorProvider } from '../EditorProvider/EditorProvider';
import { useEditorContext } from '../EditorProvider/useEditorContext';
import { useEditorTools } from '../EditorProvider/useEditorTools';
import type { EditorButtonState } from '../EditorProvider/EditorContext';
import { MapRestriction } from '../MapRestriction/MapRestriction';
import {
  MapRestrictionEditor,
  type DrawingEditorControlsState,
  type MapRestrictionEditorProps,
} from './MapRestrictionEditor';

function EditorSidebarLayout(props: PropsWithChildren) {
  const { activeEditorKey } = useEditorContext();
  const tools = useEditorTools();

  const sidebarContent =
    activeEditorKey === null
      ? Array.from(tools.values()).map((tool, i) => <Fragment key={i}>{tool.button}</Fragment>)
      : (tools.get(activeEditorKey)?.controls ?? null);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 260, overflowY: 'auto' }}>{sidebarContent}</div>
      <div style={{ flex: 1 }}>{props.children}</div>
    </div>
  );
}

type MapRestrictionEditorStoryArgs = MapRestrictionEditorProps & { apiKey: string };

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };

const SAMPLE_RESTRICTION: google.maps.LatLngLiteral[] = [
  { lat: -23.54, lng: -46.65 },
  { lat: -23.54, lng: -46.62 },
  { lat: -23.57, lng: -46.62 },
  { lat: -23.57, lng: -46.65 },
];

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const TOOL_BUTTON_CLASS = 'map-restriction-editor-story-btn';
const RESET_BUTTON_CLASS = 'map-restriction-editor-story-reset-btn';
const DEMO_STYLES = `
  .${TOOL_BUTTON_CLASS} {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 12px;
  }
  .${TOOL_BUTTON_CLASS}:hover { background: #f5f5f5; }
  .${RESET_BUTTON_CLASS} {
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    margin-bottom: 8px;
  }
`;

function renderRestrictionButton(state: EditorButtonState, setEditing: (editing: boolean) => void) {
  return (
    <button
      type="button"
      className={TOOL_BUTTON_CLASS}
      onClick={() => {
        state.activate();
        setEditing(true);
      }}
    >
      🗺️ Restrição de Área
    </button>
  );
}

function renderRestrictionControls(
  state: DrawingEditorControlsState,
  setEditing: (editing: boolean) => void,
) {
  if (state.phase === 'drawing') {
    return (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Restrição de Área</h3>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
          Clique no mapa para adicionar pontos. Clique no 1º ponto para fechar (mín. 3).
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
        <button
          type="button"
          onClick={() => {
            state.cancel();
            setEditing(false);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Restrição de Área</h3>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
        Arraste os pontos para ajustar. Clique em uma linha para adicionar ponto.
      </p>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            state.finalize();
            setEditing(false);
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Finalizar
        </button>
        <button
          type="button"
          onClick={() => {
            state.cancel();
            setEditing(false);
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function DefaultDemo(args: MapRestrictionEditorStoryArgs) {
  const [restriction, setRestriction] = useState<google.maps.LatLngLiteral[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey?.trim() || defaultApiKey}>
        <EditorProvider>
          <EditorSidebarLayout>
            <GoogleMap center={SAO_PAULO} zoom={13} mapId="DEMO_MAP_ID" height={500}>
              {restriction && <MapRestriction polygon={restriction} padded={isEditing} />}
              <MapRestrictionEditor
                renderButton={(state) => renderRestrictionButton(state, setIsEditing)}
                renderControls={(state) => renderRestrictionControls(state, setIsEditing)}
                onComplete={(polygon) => setRestriction(polygon)}
                onCancel={() => console.log('onCancel')}
              />
            </GoogleMap>
          </EditorSidebarLayout>
        </EditorProvider>
      </GoogleMapsProvider>
    </>
  );
}

function EditExistingDemo(args: MapRestrictionEditorStoryArgs) {
  const [restriction, setRestriction] = useState<google.maps.LatLngLiteral[]>(SAMPLE_RESTRICTION);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey?.trim() || defaultApiKey}>
        <EditorProvider>
          <EditorSidebarLayout>
            <GoogleMap center={SAO_PAULO} zoom={13} mapId="DEMO_MAP_ID" height={500}>
              <MapRestriction polygon={restriction} padded={isEditing} />
              <MapRestrictionEditor
                currentRestriction={restriction}
                renderButton={(state) => renderRestrictionButton(state, setIsEditing)}
                renderControls={(state) => renderRestrictionControls(state, setIsEditing)}
                onComplete={(polygon) => setRestriction(polygon)}
                onCancel={() => console.log('onCancel')}
              />
            </GoogleMap>
          </EditorSidebarLayout>
        </EditorProvider>
      </GoogleMapsProvider>
    </>
  );
}

function PlaygroundDemo(args: MapRestrictionEditorStoryArgs) {
  const [restriction, setRestriction] = useState<google.maps.LatLngLiteral[] | null>(
    SAMPLE_RESTRICTION,
  );
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <button type="button" className={RESET_BUTTON_CLASS} onClick={() => setRestriction(null)}>
        Reset restriction
      </button>
      <GoogleMapsProvider apiKey={args.apiKey?.trim() || defaultApiKey}>
        <EditorProvider>
          <EditorSidebarLayout>
            <GoogleMap center={SAO_PAULO} zoom={13} mapId="DEMO_MAP_ID" height={500}>
              {restriction && <MapRestriction polygon={restriction} padded={isEditing} />}
              <MapRestrictionEditor
                currentRestriction={restriction}
                nodeStyle={{ fillColor: '#e37400', strokeColor: '#fff', closeFillColor: '#a52714' }}
                lineStyle={{ strokeColor: '#e37400', strokeWeight: 3 }}
                renderButton={(state) => renderRestrictionButton(state, setIsEditing)}
                renderControls={(state) => renderRestrictionControls(state, setIsEditing)}
                onComplete={(polygon) => {
                  setRestriction(polygon);
                  args.onComplete(polygon);
                }}
                onCancel={args.onCancel}
              />
            </GoogleMap>
          </EditorSidebarLayout>
        </EditorProvider>
      </GoogleMapsProvider>
    </>
  );
}

const meta = {
  title: 'Components/MapRestrictionEditor',
  component: MapRestrictionEditor,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description:
        "Leave empty to use this demo's restricted API key. Paste your own Google Maps API key to preview with it instead.",
      table: { category: 'Provider' },
    },
    currentRestriction: {
      control: false,
      description:
        'Seed value — when set (>= 3 points), activating the tool skips straight to the editing phase with these points already loaded as draggable nodes, instead of starting an empty drawing session.',
      table: { category: 'Data' },
    },
    nodeStyle: {
      control: false,
      description:
        "Customizes node dot appearance: fillColor, strokeColor, size, and closeFillColor (node[0]'s color once it becomes clickable to close the shape).",
      table: { category: 'Style' },
    },
    lineStyle: {
      control: false,
      description:
        'Customizes line appearance shared by the drawing polyline, the dashed closing preview, and the closed segments: strokeColor, strokeWeight, strokeOpacity.',
      table: { category: 'Style' },
    },
    onComplete: {
      action: 'onComplete',
      description: 'Called with the finished polygon when the user finalizes (creation or edit)',
      table: { category: 'Callbacks' },
    },
    onCancel: {
      action: 'onCancel',
      description: 'Called when the user cancels drawing/editing',
      table: { category: 'Callbacks' },
    },
  },
} as Meta<MapRestrictionEditorStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const EDITOR_SIDEBAR_LAYOUT_SNIPPET = `function EditorSidebarLayout({ children }) {
  const { activeEditorKey } = useEditorContext();
  const tools = useEditorTools();

  const sidebarContent =
    activeEditorKey === null
      ? Array.from(tools.values()).map((tool, i) => <Fragment key={i}>{tool.button}</Fragment>)
      : (tools.get(activeEditorKey)?.controls ?? null);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 260, overflowY: 'auto' }}>{sidebarContent}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

`;

const DEFAULT_EXAMPLE_CODE = `${EDITOR_SIDEBAR_LAYOUT_SNIPPET}function MapRestrictionEditorDemo() {
  const [restriction, setRestriction] = useState<google.maps.LatLngLiteral[] | null>(null);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <EditorProvider>
        <EditorSidebarLayout>
          <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={13} mapId="YOUR_MAP_ID">
          {restriction && <MapRestriction polygon={restriction} />}
          <MapRestrictionEditor
            renderButton={(state) => <button onClick={state.activate}>Restrição de Área</button>}
            renderControls={(state) =>
              state.phase === 'drawing' ? (
                <button onClick={state.cancel}>Cancelar</button>
              ) : (
                <>
                  <button onClick={state.finalize}>Finalizar</button>
                  <button onClick={state.cancel}>Cancelar</button>
                </>
              )
            }
            onComplete={(polygon) => setRestriction(polygon)}
            onCancel={() => console.log('cancelled')}
          />
        </GoogleMap>
        </EditorSidebarLayout>
      </EditorProvider>
    </GoogleMapsProvider>
  );
}`;

const EDIT_EXISTING_EXAMPLE_CODE = `${EDITOR_SIDEBAR_LAYOUT_SNIPPET}function MapRestrictionEditorDemo() {
  const [restriction, setRestriction] = useState<google.maps.LatLngLiteral[]>(existingRestriction);
  // "padded" only matters while actively dragging nodes — MapRestriction's pan-lock is
  // otherwise flush with the polygon, so nodes sitting on that boundary become unreachable.
  const [isEditing, setIsEditing] = useState(false);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <EditorProvider>
        <EditorSidebarLayout>
          <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={13} mapId="YOUR_MAP_ID">
          <MapRestriction polygon={restriction} padded={isEditing} />
          <MapRestrictionEditor
            currentRestriction={restriction}
            renderButton={(state) => (
              <button
                onClick={() => {
                  state.activate();
                  setIsEditing(true);
                }}
              >
                Restrição de Área
              </button>
            )}
            renderControls={(state) =>
              state.phase === 'drawing' ? (
                <button onClick={() => { state.cancel(); setIsEditing(false); }}>Cancelar</button>
              ) : (
                <>
                  <button onClick={() => { state.finalize(); setIsEditing(false); }}>Finalizar</button>
                  <button onClick={() => { state.cancel(); setIsEditing(false); }}>Cancelar</button>
                </>
              )
            }
            onComplete={(polygon) => setRestriction(polygon)}
            onCancel={() => console.log('cancelled')}
          />
        </GoogleMap>
        </EditorSidebarLayout>
      </EditorProvider>
    </GoogleMapsProvider>
  );
}`;

const PLAYGROUND_EXAMPLE_CODE = `${EDITOR_SIDEBAR_LAYOUT_SNIPPET}function MapRestrictionEditorDemo() {
  const [restriction, setRestriction] = useState<google.maps.LatLngLiteral[] | null>(existingRestriction);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <EditorProvider>
        <EditorSidebarLayout>
          <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={13} mapId="YOUR_MAP_ID">
          {restriction && <MapRestriction polygon={restriction} padded={isEditing} />}
          <MapRestrictionEditor
            currentRestriction={restriction}
            nodeStyle={{ fillColor: '#e37400', strokeColor: '#fff', closeFillColor: '#a52714' }}
            lineStyle={{ strokeColor: '#e37400', strokeWeight: 3 }}
            renderButton={(state) => (
              <button
                onClick={() => {
                  state.activate();
                  setIsEditing(true);
                }}
              >
                Restrição de Área
              </button>
            )}
            renderControls={(state) =>
              state.phase === 'drawing' ? (
                <button onClick={() => { state.cancel(); setIsEditing(false); }}>Cancelar</button>
              ) : (
                <>
                  <button onClick={() => { state.finalize(); setIsEditing(false); }}>Finalizar</button>
                  <button onClick={() => { state.cancel(); setIsEditing(false); }}>Cancelar</button>
                </>
              )
            }
            onComplete={(polygon) => setRestriction(polygon)}
            onCancel={() => console.log('cancelled')}
          />
        </GoogleMap>
        </EditorSidebarLayout>
      </EditorProvider>
    </GoogleMapsProvider>
  );
}`;

export const Default: Story = {
  args: { apiKey: '' },
  render: (args) => <DefaultDemo {...args} />,
  parameters: {
    docs: { source: { code: DEFAULT_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const EditExisting: Story = {
  args: { apiKey: '' },
  render: (args) => <EditExistingDemo {...args} />,
  parameters: {
    docs: { source: { code: EDIT_EXISTING_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const Playground: Story = {
  args: { apiKey: '' },
  render: (args) => <PlaygroundDemo {...args} />,
  parameters: {
    docs: { source: { code: PLAYGROUND_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};
