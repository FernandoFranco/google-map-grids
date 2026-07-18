import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { GoogleMap } from '../GoogleMap/GoogleMap';
import { GoogleMapsProvider } from '../GoogleMapsProvider/GoogleMapsProvider';
import { MapEditorShell, type EditorButtonState } from '../MapEditorShell/MapEditorShell';
import { PolygonLayer, type PolygonItem } from '../PolygonLayer/PolygonLayer';
import {
  PolygonEditor,
  type PolygonData,
  type PolygonEditorControlsState,
  type PolygonEditorProps,
} from './PolygonEditor';

type PolygonEditorStoryArgs = PolygonEditorProps & { apiKey: string };

const SAO_PAULO = { lat: -23.5505, lng: -46.6333 };

const SAMPLE_AREAS: PolygonData[] = [
  {
    id: 'area-1',
    title: 'Zona Central',
    color: '#1a73e8',
    paths: [
      [
        { lat: -23.55, lng: -46.64 },
        { lat: -23.55, lng: -46.62 },
        { lat: -23.57, lng: -46.62 },
        { lat: -23.57, lng: -46.64 },
      ],
    ],
  },
  {
    id: 'area-2',
    title: 'Parque Ibirapuera',
    color: '#188038',
    paths: [
      [
        { lat: -23.585, lng: -46.66 },
        { lat: -23.585, lng: -46.655 },
        { lat: -23.59, lng: -46.655 },
        { lat: -23.59, lng: -46.66 },
      ],
    ],
  },
];

const defaultApiKey =
  (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';

const TOOL_BUTTON_CLASS = 'polygon-editor-story-btn';
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

function toPolygonItem(area: PolygonData): PolygonItem {
  return { id: area.id, paths: area.paths, fillColor: area.color, strokeColor: area.color };
}

function renderPolygonButton(state: EditorButtonState) {
  return (
    <button type="button" className={TOOL_BUTTON_CLASS} onClick={state.activate}>
      🔷 Desenhar Área
    </button>
  );
}

function renderPolygonControls(state: PolygonEditorControlsState) {
  if (state.phase === 'drawing') {
    return (
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Desenhar Área</h3>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
          Clique para adicionar pontos. Clique no 1º ponto para fechar (mín. 3).
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
      <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600 }}>Desenhar Área</h3>
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
        Arraste pontos para ajustar. Clique em uma linha para adicionar.
      </p>
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
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={state.finalize}
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

function DefaultDemo(args: PolygonEditorStoryArgs) {
  const [areas, setAreas] = useState<PolygonData[]>([]);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey}>
        <MapEditorShell>
          <GoogleMap center={SAO_PAULO} zoom={13} mapId="DEMO_MAP_ID" height={500}>
            <PolygonLayer areas={areas.map(toPolygonItem)} />
            <PolygonEditor
              renderButton={renderPolygonButton}
              renderControls={renderPolygonControls}
              onMetadataRequest={(req) => {
                const title = window.prompt('Título da área:', req.current.title ?? '') ?? '';
                if (!title) {
                  req.onCancel();
                  return;
                }
                req.onConfirm({ title, color: req.current.color ?? '#1a73e8' });
              }}
              onAdd={(area) => setAreas((prev) => [...prev, area])}
              onUpdate={(area) => setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)))}
              onCancel={() => console.log('onCancel')}
            />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  );
}

function EditExistingDemo(args: PolygonEditorStoryArgs) {
  const [areas, setAreas] = useState<PolygonData[]>(SAMPLE_AREAS);
  const [editingArea, setEditingArea] = useState<PolygonData | null>(null);
  const [isEditorActive, setIsEditorActive] = useState(false);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey}>
        <MapEditorShell>
          <GoogleMap center={SAO_PAULO} zoom={13} mapId="DEMO_MAP_ID" height={500}>
            <PolygonLayer
              areas={areas.filter((a) => a.id !== editingArea?.id).map(toPolygonItem)}
              interactive={!isEditorActive}
              onClick={(item) => setEditingArea(areas.find((a) => a.id === item.id) ?? null)}
            />
            <PolygonEditor
              renderButton={() => null}
              renderControls={renderPolygonControls}
              editingArea={editingArea}
              onActiveChange={setIsEditorActive}
              onMetadataRequest={(req) => {
                const title = window.prompt('Título da área:', req.current.title ?? '') ?? '';
                if (!title) {
                  req.onCancel();
                  return;
                }
                req.onConfirm({ title, color: req.current.color ?? '#1a73e8' });
              }}
              onAdd={(area) => setAreas((prev) => [...prev, area])}
              onUpdate={(area) => setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)))}
              onEditEnd={() => setEditingArea(null)}
              onCancel={() => console.log('onCancel')}
            />
          </GoogleMap>
        </MapEditorShell>
      </GoogleMapsProvider>
    </>
  );
}

function PlaygroundDemo(args: PolygonEditorStoryArgs) {
  const [areas, setAreas] = useState<PolygonData[]>(SAMPLE_AREAS);
  const [editingArea, setEditingArea] = useState<PolygonData | null>(null);
  const [isEditorActive, setIsEditorActive] = useState(false);

  return (
    <>
      <style>{DEMO_STYLES}</style>
      <GoogleMapsProvider apiKey={args.apiKey}>
        <MapEditorShell>
          <GoogleMap center={SAO_PAULO} zoom={13} mapId="DEMO_MAP_ID" height={500}>
            <PolygonLayer
              areas={areas.filter((a) => a.id !== editingArea?.id).map(toPolygonItem)}
              interactive={!isEditorActive}
              onClick={(item) => setEditingArea(areas.find((a) => a.id === item.id) ?? null)}
            />
            <PolygonEditor
              renderButton={renderPolygonButton}
              renderControls={renderPolygonControls}
              editingArea={editingArea}
              onActiveChange={setIsEditorActive}
              onMetadataRequest={(req) => {
                const title = window.prompt('Título:', req.current.title ?? '') ?? '';
                if (!title) {
                  req.onCancel();
                  return;
                }
                req.onConfirm({ title, color: req.current.color ?? '#1a73e8' });
              }}
              onAdd={(area) => {
                setAreas((prev) => [...prev, area]);
                args.onAdd(area);
              }}
              onUpdate={(area) => {
                setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)));
                args.onUpdate(area);
              }}
              onEditEnd={() => {
                setEditingArea(null);
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
  title: 'Components/PolygonEditor',
  component: PolygonEditor,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Google Maps API Key',
      table: { category: 'Provider' },
    },
    nodeStyle: {
      control: false,
      description: 'Customizes node dot appearance: fillColor, strokeColor, size, closeFillColor.',
      table: { category: 'Style' },
    },
    lineStyle: {
      control: false,
      description: 'Customizes line appearance: strokeColor, strokeWeight, strokeOpacity.',
      table: { category: 'Style' },
    },
    onMetadataRequest: {
      action: 'onMetadataRequest',
      description: 'Called to request metadata from the consumer (open your own dialog)',
      table: { category: 'Callbacks' },
    },
    onAdd: {
      action: 'onAdd',
      description: 'Called with the new PolygonData when creation is confirmed',
      table: { category: 'Callbacks' },
    },
    onUpdate: {
      action: 'onUpdate',
      description: 'Called with the updated PolygonData when edit is confirmed',
      table: { category: 'Callbacks' },
    },
    onEditEnd: {
      action: 'onEditEnd',
      description: 'Called when edit mode ends (finalize or cancel)',
      table: { category: 'Callbacks' },
    },
    onActiveChange: {
      action: 'onActiveChange',
      description:
        'Called whenever the editor activates/deactivates. Use this to disable interaction with other rendered items (e.g. PolygonLayer.interactive) while a drawing/editing session is in progress, instead of relying on which item is currently being edited.',
      table: { category: 'Callbacks' },
    },
    onCancel: {
      action: 'onCancel',
      description: 'Called when creation mode is cancelled',
      table: { category: 'Callbacks' },
    },
  },
} as Meta<PolygonEditorStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const CREATION_EXAMPLE_CODE = `function PolygonEditorDemo() {
  const [areas, setAreas] = useState<PolygonData[]>([]);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={13} mapId="YOUR_MAP_ID">
          <PolygonLayer areas={areas.map((a) => ({ id: a.id, paths: a.paths, fillColor: a.color, strokeColor: a.color }))} />
          <PolygonEditor
            renderButton={(state) => <button onClick={state.activate}>Desenhar Área</button>}
            renderControls={(state) =>
              state.phase === 'drawing' ? (
                <button onClick={state.cancel}>Cancelar</button>
              ) : (
                <>
                  <button onClick={state.properties}>Propriedades</button>
                  <button onClick={state.finalize}>Finalizar</button>
                  <button onClick={state.cancel}>Cancelar</button>
                </>
              )
            }
            onMetadataRequest={(req) => {
              const title = window.prompt('Título da área:', req.current.title ?? '') ?? '';
              if (!title) {
                req.onCancel();
                return;
              }
              req.onConfirm({ title, color: req.current.color ?? '#1a73e8' });
            }}
            onAdd={(area) => setAreas((prev) => [...prev, area])}
            onUpdate={(area) =>
              setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)))
            }
          />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

const EDIT_EXISTING_EXAMPLE_CODE = `function PolygonEditorDemo() {
  const [areas, setAreas] = useState<PolygonData[]>(existingAreas);
  const [editingArea, setEditingArea] = useState<PolygonData | null>(null);
  // Disables interaction with the other rendered polygons while a session is in
  // progress — PolygonEditor itself also ignores editingArea changes once active,
  // so this is purely to stop other polygons from reacting to the click at all.
  const [isEditorActive, setIsEditorActive] = useState(false);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={13} mapId="YOUR_MAP_ID">
          <PolygonLayer
            areas={areas
              .filter((a) => a.id !== editingArea?.id)
              .map((a) => ({ id: a.id, paths: a.paths, fillColor: a.color, strokeColor: a.color }))}
            interactive={!isEditorActive}
            onClick={(item) => setEditingArea(areas.find((a) => a.id === item.id) ?? null)}
          />
          <PolygonEditor
            renderButton={() => null}
            renderControls={(state) =>
              state.phase === 'drawing' ? null : (
                <>
                  <button onClick={state.properties}>Propriedades</button>
                  <button onClick={state.finalize}>Finalizar</button>
                  <button onClick={state.cancel}>Cancelar</button>
                </>
              )
            }
            editingArea={editingArea}
            onActiveChange={setIsEditorActive}
            onMetadataRequest={(req) => {
              const title = window.prompt('Título da área:', req.current.title ?? '') ?? '';
              if (!title) {
                req.onCancel();
                return;
              }
              req.onConfirm({ title, color: req.current.color ?? '#1a73e8' });
            }}
            onAdd={(area) => setAreas((prev) => [...prev, area])}
            onUpdate={(area) =>
              setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)))
            }
            onEditEnd={() => setEditingArea(null)}
          />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

const PLAYGROUND_EXAMPLE_CODE = `function PolygonEditorDemo() {
  const [areas, setAreas] = useState<PolygonData[]>(existingAreas);
  const [editingArea, setEditingArea] = useState<PolygonData | null>(null);
  const [isEditorActive, setIsEditorActive] = useState(false);

  return (
    <GoogleMapsProvider apiKey={apiKey}>
      <MapEditorShell>
        <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={13} mapId="YOUR_MAP_ID">
          <PolygonLayer
            areas={areas
              .filter((a) => a.id !== editingArea?.id)
              .map((a) => ({ id: a.id, paths: a.paths, fillColor: a.color, strokeColor: a.color }))}
            interactive={!isEditorActive}
            onClick={(item) => setEditingArea(areas.find((a) => a.id === item.id) ?? null)}
          />
          <PolygonEditor
            renderButton={(state) => <button onClick={state.activate}>Desenhar Área</button>}
            renderControls={(state) =>
              state.phase === 'drawing' ? (
                <button onClick={state.cancel}>Cancelar</button>
              ) : (
                <>
                  <button onClick={state.properties}>Propriedades</button>
                  <button onClick={state.finalize}>Finalizar</button>
                  <button onClick={state.cancel}>Cancelar</button>
                </>
              )
            }
            editingArea={editingArea}
            onActiveChange={setIsEditorActive}
            onMetadataRequest={(req) => {
              const title = window.prompt('Título:', req.current.title ?? '') ?? '';
              if (!title) {
                req.onCancel();
                return;
              }
              req.onConfirm({ title, color: req.current.color ?? '#1a73e8' });
            }}
            onAdd={(area) => setAreas((prev) => [...prev, area])}
            onUpdate={(area) =>
              setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)))
            }
            onEditEnd={() => setEditingArea(null)}
            onCancel={() => console.log('creation cancelled')}
          />
        </GoogleMap>
      </MapEditorShell>
    </GoogleMapsProvider>
  );
}`;

export const Default: Story = {
  args: { apiKey: defaultApiKey },
  render: (args) => <DefaultDemo {...args} />,
  parameters: {
    docs: { source: { code: CREATION_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const EditExisting: Story = {
  args: { apiKey: defaultApiKey },
  render: (args) => <EditExistingDemo {...args} />,
  parameters: {
    docs: { source: { code: EDIT_EXISTING_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};

export const Playground: Story = {
  args: { apiKey: defaultApiKey },
  render: (args) => <PlaygroundDemo {...args} />,
  parameters: {
    docs: { source: { code: PLAYGROUND_EXAMPLE_CODE, language: 'tsx', type: 'code' } },
  },
};
