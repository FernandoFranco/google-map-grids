import type { EditorButtonState } from '../MapEditorShell/EditorContext';
import type { ReactNode } from 'react';

export interface IconDefinition {
  id: string;
  label: string;
  content: HTMLElement | string;
}

export interface MarkerMetadata {
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface MarkerData extends MarkerMetadata {
  id: string;
  position: google.maps.LatLngLiteral;
}

export interface MetadataRequest<T> {
  mode: 'create' | 'edit';
  current: Partial<T>;
  onConfirm: (data: T) => void;
  onCancel: () => void;
}

export type MarkerEditorControlsState =
  | { mode: 'create'; cancel: () => void }
  | {
      mode: 'edit';
      marker: MarkerData;
      properties: () => void;
      done: () => void;
      delete: () => void;
      cancel: () => void;
    };

export interface MarkerEditorProps {
  editingMarker?: MarkerData | null;
  dragEnabled?: boolean;
  onMetadataRequest: (req: MetadataRequest<MarkerMetadata>) => void;
  onAdd: (marker: MarkerData) => void;
  onUpdate: (marker: MarkerData) => void;
  onDelete: (marker: MarkerData) => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
  renderButton: (state: EditorButtonState) => ReactNode;
  renderControls: (state: MarkerEditorControlsState) => ReactNode;
}
