import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MapEditorShell, type EditorButtonState } from '../MapEditorShell/MapEditorShell';
import { MarkerEditor, type MarkerData, type MarkerEditorControlsState, type MarkerEditorProps } from './MarkerEditor';
import { MarkerLayer } from '../MarkerLayer/MarkerLayer';

type MarkerEditorStoryArgs = MarkerEditorProps & { apiKey: string };

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const TOOL_BUTTON_CLASS = 'marker-editor-story-btn';
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
`;

function renderMarkerButton(state: EditorButtonState) {
  return (
    <button type="button" className={TOOL_BUTTON_CLASS} onClick={state.activate}>
      📍 Adicionar Marcador
    </button>
  );
}

function renderMarkerControls(state: MarkerEditorControlsState) {
  if (state.mode === 'create') {
    return (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Adicionar Marcador</h3>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
          Clique no mapa para posicionar.
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
        <button
          type="button"
          onClick={state.cancel}
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
      <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>
        Editando: {state.marker.name}
      </h3>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      <button
        type="button"
        onClick={state.properties}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '8px',
        }}
      >
        Propriedades
      </button>
      <button
        type="button"
        onClick={state.delete}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: '#fff',
          border: '1px solid #d93025',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#d93025',
        }}
      >
        Excluir
      </button>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={state.done}
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
          Done
        </button>
        <button
          type="button"
          onClick={state.cancel}
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

const SAMPLE_MARKER: MarkerData = {
  id: 'sample-1',
  name: 'Ponto de interesse',
  icon: 'default',
  color: '#1a73e8',
  position: { lat: -23.5505, lng: -46.6333 },
};

const SAMPLE_MARKERS: MarkerData[] = [
  SAMPLE_MARKER,
  {
    id: 'sample-2',
    name: 'Parque Ibirapuera',
    icon: 'default',
    color: '#188038',
    position: { lat: -23.5874, lng: -46.6576 },
  },
  {
    id: 'sample-3',
    name: 'Avenida Paulista',
    icon: 'default',
    color: '#e37400',
    position: { lat: -23.5613, lng: -46.6565 },
  },
];

function CreationDemo(args: MarkerEditorStoryArgs) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey}>
        <MapEditorShell>
          <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={500}>
            <MarkerLayer items={markers.map((m) => ({ id: m.id, position: m.position, title: m.name }))} />
            <MarkerEditor
              renderButton={renderMarkerButton}
              renderControls={renderMarkerControls}
              onMetadataRequest={(req) => {
                const name = window.prompt('Nome do marcador:', '') ?? '';
                if (!name) {
                  req.onCancel();
                  return;
                }
                req.onConfirm({ name, icon: 'default', color: '#1a73e8' });
              }}
              onAdd={(marker) => setMarkers((prev) => [...prev, marker])}
              onUpdate={(marker) => setMarkers((prev) => prev.map((m) => (m.id === marker.id ? marker : m)))}
              onDelete={(marker) => setMarkers((prev) => prev.filter((m) => m.id !== marker.id))}
              onCancel={() => console.log('onCancel')}
            />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  );
}

function EditOnlyDemo(args: MarkerEditorStoryArgs) {
  const [markers, setMarkers] = useState<MarkerData[]>(SAMPLE_MARKERS);
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey}>
        <MapEditorShell>
          <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={500}>
            <MarkerLayer
              items={markers
                .filter((m) => m.id !== editingMarker?.id)
                .map((m) => ({ id: m.id, position: m.position, title: m.name }))}
              onClick={(item) => setEditingMarker(markers.find((m) => m.id === item.id) ?? null)}
            />
            <MarkerEditor
              renderButton={() => null}
              renderControls={renderMarkerControls}
              editingMarker={editingMarker}
              onMetadataRequest={(req) => {
                const name = window.prompt('Nome do marcador:', req.current.name ?? '') ?? '';
                if (!name) {
                  req.onCancel();
                  return;
                }
                req.onConfirm({ name, icon: req.current.icon ?? 'default', color: req.current.color ?? '#1a73e8' });
              }}
              onAdd={(marker) => setMarkers((prev) => [...prev, marker])}
              onUpdate={(marker) => setMarkers((prev) => prev.map((m) => (m.id === marker.id ? marker : m)))}
              onDelete={(marker) => setMarkers((prev) => prev.filter((m) => m.id !== marker.id))}
              onEditEnd={() => setEditingMarker(null)}
              onCancel={() => console.log('onCancel')}
            />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  );
}

function PlaygroundDemo(args: MarkerEditorStoryArgs) {
  const [markers, setMarkers] = useState<MarkerData[]>(SAMPLE_MARKERS);
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey}>
        <MapEditorShell>
          <GoogleMap center={SAO_PAULO} zoom={14} mapId="DEMO_MAP_ID" height={500}>
            <MarkerLayer
              items={markers
                .filter((m) => m.id !== editingMarker?.id)
                .map((m) => ({ id: m.id, position: m.position, title: m.name }))}
              onClick={(item) => setEditingMarker(markers.find((m) => m.id === item.id) ?? null)}
            />
            <MarkerEditor
              renderButton={renderMarkerButton}
              renderControls={renderMarkerControls}
              editingMarker={editingMarker}
              dragEnabled={args.dragEnabled}
              onMetadataRequest={(req) => {
                const name = window.prompt('Nome:', req.current.name ?? '') ?? '';
                if (!name) { req.onCancel(); return; }
                req.onConfirm({ name, icon: req.current.icon ?? 'default', color: req.current.color ?? '#1a73e8' });
              }}
              onAdd={(marker) => {
                setMarkers((prev) => [...prev, marker]);
                args.onAdd(marker);
              }}
              onUpdate={(marker) => {
                setMarkers((prev) => prev.map((m) => (m.id === marker.id ? marker : m)));
                args.onUpdate(marker);
              }}
              onDelete={(marker) => {
                setMarkers((prev) => prev.filter((m) => m.id !== marker.id));
                args.onDelete(marker);
              }}
              onEditEnd={() => {
                setEditingMarker(null);
                args.onEditEnd?.();
              }}
              onCancel={args.onCancel}
            />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  );
}

const meta = {
  title: 'Components/MarkerEditor',
  component: MarkerEditor,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Google Maps API Key',
      table: { category: 'Provider' },
    },
    dragEnabled: {
      control: 'boolean',
      description: 'Whether the marker being edited can be dragged to a new position',
      table: { category: 'Behavior' },
    },
    onMetadataRequest: {
      action: 'onMetadataRequest',
      description: 'Called to request metadata from the consumer (open your own dialog)',
      table: { category: 'Callbacks' },
    },
    onAdd: {
      action: 'onAdd',
      description: 'Called with the new MarkerData when creation is confirmed',
      table: { category: 'Callbacks' },
    },
    onUpdate: {
      action: 'onUpdate',
      description: 'Called with the updated MarkerData when edit is confirmed',
      table: { category: 'Callbacks' },
    },
    onDelete: {
      action: 'onDelete',
      description: 'Called with the MarkerData being edited when deletion is requested',
      table: { category: 'Callbacks' },
    },
    onEditEnd: {
      action: 'onEditEnd',
      description: 'Called when edit mode ends (Done or Cancel)',
      table: { category: 'Callbacks' },
    },
    onCancel: {
      action: 'onCancel',
      description: 'Called when creation mode is cancelled',
      table: { category: 'Callbacks' },
    },
  },
} as Meta<MarkerEditorStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const CREATION_EXAMPLE_CODE = `function MarkerEditorDemo() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
          <MarkerLayer items={markers.map((m) => ({ id: m.id, position: m.position, title: m.name }))} />
          <MarkerEditor
            renderButton={(state) => <button onClick={state.activate}>Add Marker</button>}
            renderControls={(state) => (
              <button onClick={state.cancel}>Cancel</button>
            )}
            onMetadataRequest={(req) => {
              const name = window.prompt('Marker name:', req.current.name ?? '') ?? '';
              if (!name) {
                req.onCancel();
                return;
              }
              req.onConfirm({ name, icon: 'default', color: '#1a73e8' });
            }}
            onAdd={(marker) => setMarkers((prev) => [...prev, marker])}
            onUpdate={(marker) =>
              setMarkers((prev) => prev.map((m) => (m.id === marker.id ? marker : m)))
            }
            onDelete={(marker) => setMarkers((prev) => prev.filter((m) => m.id !== marker.id))}
          />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

const EDIT_ONLY_EXAMPLE_CODE = `function MarkerEditorDemo() {
  const [markers, setMarkers] = useState<MarkerData[]>(existingMarkers);
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
          <MarkerLayer
            items={markers
              .filter((m) => m.id !== editingMarker?.id)
              .map((m) => ({ id: m.id, position: m.position, title: m.name }))}
            onClick={(item) => setEditingMarker(markers.find((m) => m.id === item.id) ?? null)}
          />
          <MarkerEditor
            renderButton={() => null}
            renderControls={(state) =>
              state.mode === 'create' ? null : (
                <>
                  <h3>Editing: {state.marker.name}</h3>
                  <button onClick={state.properties}>Properties</button>
                  <button onClick={state.delete}>Delete</button>
                  <button onClick={state.done}>Done</button>
                  <button onClick={state.cancel}>Cancel</button>
                </>
              )
            }
            editingMarker={editingMarker}
            onMetadataRequest={(req) => {
              const name = window.prompt('Marker name:', req.current.name ?? '') ?? '';
              if (!name) {
                req.onCancel();
                return;
              }
              req.onConfirm({
                name,
                icon: req.current.icon ?? 'default',
                color: req.current.color ?? '#1a73e8',
              });
            }}
            onAdd={(marker) => setMarkers((prev) => [...prev, marker])}
            onUpdate={(marker) =>
              setMarkers((prev) => prev.map((m) => (m.id === marker.id ? marker : m)))
            }
            onDelete={(marker) => setMarkers((prev) => prev.filter((m) => m.id !== marker.id))}
            onEditEnd={() => setEditingMarker(null)}
          />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

const PLAYGROUND_EXAMPLE_CODE = `function MarkerEditorDemo() {
  const [markers, setMarkers] = useState<MarkerData[]>(existingMarkers);
  const [editingMarker, setEditingMarker] = useState<MarkerData | null>(null);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={14} mapId="YOUR_MAP_ID">
          <MarkerLayer
            items={markers
              .filter((m) => m.id !== editingMarker?.id)
              .map((m) => ({ id: m.id, position: m.position, title: m.name }))}
            onClick={(item) => setEditingMarker(markers.find((m) => m.id === item.id) ?? null)}
          />
          <MarkerEditor
            renderButton={(state) => <button onClick={state.activate}>Add Marker</button>}
            renderControls={(state) =>
              state.mode === 'create' ? (
                <button onClick={state.cancel}>Cancel</button>
              ) : (
                <>
                  <h3>Editing: {state.marker.name}</h3>
                  <button onClick={state.properties}>Properties</button>
                  <button onClick={state.delete}>Delete</button>
                  <button onClick={state.done}>Done</button>
                  <button onClick={state.cancel}>Cancel</button>
                </>
              )
            }
            editingMarker={editingMarker}
            dragEnabled={true}
            onMetadataRequest={(req) => {
              const name = window.prompt('Marker name:', req.current.name ?? '') ?? '';
              if (!name) {
                req.onCancel();
                return;
              }
              req.onConfirm({
                name,
                icon: req.current.icon ?? 'default',
                color: req.current.color ?? '#1a73e8',
              });
            }}
            onAdd={(marker) => setMarkers((prev) => [...prev, marker])}
            onUpdate={(marker) =>
              setMarkers((prev) => prev.map((m) => (m.id === marker.id ? marker : m)))
            }
            onDelete={(marker) => setMarkers((prev) => prev.filter((m) => m.id !== marker.id))}
            onEditEnd={() => setEditingMarker(null)}
            onCancel={() => console.log('creation cancelled')}
          />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

export const Default: Story = {
  args: { apiKey: defaultApiKey },
  render: (args) => <CreationDemo {...args} />,
  parameters: {
    docs: { source: { code: CREATION_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const EditOnly: Story = {
  args: { apiKey: defaultApiKey },
  render: (args) => <EditOnlyDemo {...args} />,
  parameters: {
    docs: { source: { code: EDIT_ONLY_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const Playground: Story = {
  args: { apiKey: defaultApiKey, dragEnabled: true },
  render: (args) => <PlaygroundDemo {...args} />,
  parameters: {
    docs: { source: { code: PLAYGROUND_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};
