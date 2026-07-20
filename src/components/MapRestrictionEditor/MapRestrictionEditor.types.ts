import type {
  DrawingEditorControlsState,
  LineStyle,
  NodeStyle,
} from '../../hooks/useDrawingEditorCore';
import type { EditorButtonState } from '../MapEditorShell/EditorContext';
import type { ReactNode } from 'react';

export type { DrawingEditorControlsState, LineStyle, NodeStyle };

export interface MapRestrictionEditorProps {
  currentRestriction?: google.maps.LatLngLiteral[] | null;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  onComplete: (polygon: google.maps.LatLngLiteral[]) => void;
  onCancel?: () => void;
  renderButton: (state: EditorButtonState) => ReactNode;
  renderControls: (state: DrawingEditorControlsState) => ReactNode;
}
