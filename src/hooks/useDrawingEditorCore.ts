import { useEffect, useRef, type ReactNode } from 'react';

import type { EditorButtonState } from '../components/MapEditorShell/EditorContext';
import { useEditorContext } from '../components/MapEditorShell/useEditorContext';
import { useEditorTool } from '../components/MapEditorShell/useEditorTool';
import { useMap } from '../components/GoogleMap/MapContext';
import { useNodeLineEditor, type LineStyle, type NodeStyle } from './useNodeLineEditor';

export type { NodeStyle, LineStyle };

export type DrawingEditorControlsState =
  | { phase: 'drawing'; cancel: () => void }
  | { phase: 'editing'; finalize: () => void; cancel: () => void };

export interface UseDrawingEditorCoreOptions {
  key: string;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  initialNodes?: google.maps.LatLngLiteral[];
  onShapeComplete: (nodes: google.maps.LatLngLiteral[]) => void;
  onCancel?: () => void;
  onActiveChange?: (active: boolean) => void;
  renderButton: (state: EditorButtonState) => ReactNode;
  renderControls: (state: DrawingEditorControlsState) => ReactNode;
}

export function useDrawingEditorCore(options: UseDrawingEditorCoreOptions): {
  nodes: google.maps.LatLngLiteral[];
  phase: 'drawing' | 'editing';
} {
  const map = useMap();
  const { activeEditorKey, activateEditor, deactivateEditor } = useEditorContext();
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const isActive = activeEditorKey === options.key;

  useEffect(() => {
    optionsRef.current.onActiveChange?.(isActive);
  }, [isActive]);

  const { nodes, phase, clear } = useNodeLineEditor({
    map,
    enabled: isActive,
    nodeStyle: options.nodeStyle,
    lineStyle: options.lineStyle,
    initialNodes: options.initialNodes,
  });

  useEffect(() => {
    if (!isActive) return;
    return () => clear();
  }, [isActive, clear]);

  const handleCancel = () => {
    options.onCancel?.();
    deactivateEditor();
    clear();
  };

  const handleFinalize = () => {
    options.onShapeComplete(nodes);
    deactivateEditor();
    clear();
  };

  const activate = () => activateEditor(options.key);
  const button = options.renderButton({ isActive, activate });

  const controlsState: DrawingEditorControlsState =
    phase === 'editing'
      ? { phase: 'editing', finalize: handleFinalize, cancel: handleCancel }
      : { phase: 'drawing', cancel: handleCancel };
  const controls = options.renderControls(controlsState);

  useEditorTool({ key: options.key, button, controls });

  return { nodes, phase };
}
