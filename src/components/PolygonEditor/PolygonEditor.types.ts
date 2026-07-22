import type { EditorButtonState, MetadataRequest } from '../EditorProvider/EditorContext';
import type { LineStyle, NodeStyle } from '../../hooks/useDrawingEditorCore';

import type { ReactNode } from 'react';

export type { MetadataRequest, NodeStyle, LineStyle };

export interface PolygonMetadata {
  title: string;
  color: string;
  description?: string;
}

export interface PolygonData extends PolygonMetadata {
  id: string;
  paths: google.maps.LatLngLiteral[][];
}

export type PolygonEditorControlsState =
  | { phase: 'drawing'; cancel: () => void }
  | { phase: 'editing'; properties: () => void; finalize: () => void; cancel: () => void };

export interface PolygonEditorProps {
  editingArea?: PolygonData | null;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  onMetadataRequest: (req: MetadataRequest<PolygonMetadata>) => void;
  onAdd: (area: PolygonData) => void;
  onUpdate: (area: PolygonData) => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
  onActiveChange?: (active: boolean) => void;
  renderButton: (state: EditorButtonState) => ReactNode;
  renderControls: (state: PolygonEditorControlsState) => ReactNode;
}
