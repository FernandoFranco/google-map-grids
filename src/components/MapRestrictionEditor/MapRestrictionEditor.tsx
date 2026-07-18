import type { MapRestrictionEditorProps } from './MapRestrictionEditor.types';
import { useDrawingEditorCore } from '../../hooks/useDrawingEditorCore';

export type {
  DrawingEditorControlsState,
  MapRestrictionEditorProps,
  NodeStyle,
  LineStyle,
} from './MapRestrictionEditor.types';

export function MapRestrictionEditor(props: MapRestrictionEditorProps) {
  useDrawingEditorCore({
    key: 'map-restriction',
    initialNodes: props.currentRestriction ?? undefined,
    nodeStyle: props.nodeStyle,
    lineStyle: props.lineStyle,
    onShapeComplete: props.onComplete,
    onCancel: props.onCancel,
    renderButton: props.renderButton,
    renderControls: props.renderControls,
  });

  return null;
}
