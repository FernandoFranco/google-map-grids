import type {
  PolygonData,
  PolygonEditorControlsState,
  PolygonEditorProps,
  PolygonMetadata,
} from './PolygonEditor.types';
import { useEffect, useRef, useState } from 'react';

import {
  useDrawingEditorCore,
  type DrawingEditorControlsState,
} from '../../hooks/useDrawingEditorCore';
import { useEditorContext } from '../MapEditorShell/useEditorContext';

export type {
  PolygonMetadata,
  PolygonData,
  PolygonEditorControlsState,
  PolygonEditorProps,
  MetadataRequest,
  NodeStyle,
  LineStyle,
} from './PolygonEditor.types';

const TOOL_KEY = 'polygon';

export function PolygonEditor(props: PolygonEditorProps) {
  const { activeEditorKey, activateEditor } = useEditorContext();
  const isActive = activeEditorKey === TOOL_KEY;
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  });

  const [pendingMetadata, setPendingMetadata] = useState<Partial<PolygonMetadata>>({});
  const lockedAreaRef = useRef<PolygonData | null>(null);

  useEffect(() => {
    if (props.editingArea && !isActive) {
      lockedAreaRef.current = props.editingArea;
      setPendingMetadata({});
      activateEditor(TOOL_KEY);
    }
  }, [props.editingArea, isActive, activateEditor]);

  const handleProperties = () => {
    const editingArea = lockedAreaRef.current;
    propsRef.current.onMetadataRequest({
      mode: editingArea ? 'edit' : 'create',
      current: editingArea ? { ...editingArea, ...pendingMetadata } : { ...pendingMetadata },
      onConfirm: (metadata) => setPendingMetadata(metadata),
      onCancel: () => {},
    });
  };

  useDrawingEditorCore({
    key: TOOL_KEY,
    nodeStyle: props.nodeStyle,
    lineStyle: props.lineStyle,
    initialNodes: props.editingArea?.paths[0],
    onShapeComplete: (nodes) => {
      const editingArea = lockedAreaRef.current;
      if (editingArea) {
        propsRef.current.onUpdate({ ...editingArea, ...pendingMetadata, paths: [nodes] });
        propsRef.current.onEditEnd?.();
      } else {
        propsRef.current.onAdd({
          id: crypto.randomUUID(),
          paths: [nodes],
          ...(pendingMetadata as PolygonMetadata),
        });
      }
      setPendingMetadata({});
      lockedAreaRef.current = null;
    },
    onCancel: () => {
      setPendingMetadata({});
      const editingArea = lockedAreaRef.current;
      lockedAreaRef.current = null;
      if (editingArea) {
        propsRef.current.onEditEnd?.();
      } else {
        propsRef.current.onCancel?.();
      }
    },
    onActiveChange: props.onActiveChange,
    renderButton: props.renderButton,
    renderControls: (hookState: DrawingEditorControlsState) => {
      const state: PolygonEditorControlsState =
        hookState.phase === 'editing' ? { ...hookState, properties: handleProperties } : hookState;
      return props.renderControls(state);
    },
  });

  return null;
}
