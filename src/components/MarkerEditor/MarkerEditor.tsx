import type { MarkerEditorControlsState, MarkerEditorProps, MarkerMetadata } from './MarkerEditor.types';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { EditorButtonState } from '../MapEditorShell/EditorContext';
import { useEditorContext } from '../MapEditorShell/useEditorContext';
import { useEditorTool } from '../MapEditorShell/useEditorTool';
import { useMap } from '../GoogleMap/MapContext';
import { useMarker } from '../../hooks/useMarker';

export type {
  IconDefinition,
  MarkerMetadata,
  MarkerData,
  MarkerEditorControlsState,
  MarkerEditorProps,
} from './MarkerEditor.types';

const TOOL_KEY = 'marker-editor';

export function MarkerEditor(props: MarkerEditorProps) {
  const map = useMap();
  const { activeEditorKey, activateEditor, deactivateEditor } = useEditorContext();
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  });

  const [pendingPosition, setPendingPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [pendingMetadata, setPendingMetadata] = useState<Partial<MarkerMetadata>>({});

  const handleCreationCancel = () => {
    setPendingPosition(null);
    setPendingMetadata({});
    deactivateEditor();
    propsRef.current.onCancel?.();
  };

  const handleEditDone = () => {
    const { editingMarker } = propsRef.current;
    if (!editingMarker) return;
    propsRef.current.onUpdate({
      ...editingMarker,
      ...pendingMetadata,
      position: pendingPosition ?? editingMarker.position,
    });
    setPendingPosition(null);
    setPendingMetadata({});
    deactivateEditor();
    propsRef.current.onEditEnd?.();
  };

  const handleEditCancel = () => {
    setPendingPosition(null);
    setPendingMetadata({});
    deactivateEditor();
    propsRef.current.onEditEnd?.();
  };

  const handleProperties = () => {
    const { editingMarker } = propsRef.current;
    if (!editingMarker) return;
    propsRef.current.onMetadataRequest({
      mode: 'edit',
      current: { ...editingMarker, ...pendingMetadata },
      onConfirm: (metadata) => setPendingMetadata(metadata),
      onCancel: () => {},
    });
  };

  const handleDelete = () => {
    const { editingMarker } = propsRef.current;
    if (!editingMarker) return;
    propsRef.current.onDelete(editingMarker);
    setPendingPosition(null);
    setPendingMetadata({});
    deactivateEditor();
    propsRef.current.onEditEnd?.();
  };

  const isEditing = Boolean(props.editingMarker);
  const isActive = activeEditorKey === TOOL_KEY;
  const activate = useCallback(() => activateEditor(TOOL_KEY), [activateEditor]);
  const buttonState: EditorButtonState = { isActive, activate };
  const button = props.renderButton(buttonState);

  const controlsState: MarkerEditorControlsState = props.editingMarker
    ? {
        mode: 'edit',
        marker: {
          ...props.editingMarker,
          ...pendingMetadata,
          position: pendingPosition ?? props.editingMarker.position,
        },
        properties: handleProperties,
        done: handleEditDone,
        delete: handleDelete,
        cancel: handleEditCancel,
      }
    : { mode: 'create', cancel: handleCreationCancel };
  const controls = props.renderControls(controlsState);

  useEditorTool({
    key: TOOL_KEY,
    button,
    controls,
  });

  useEffect(() => {
    if (props.editingMarker) {
      setPendingPosition(null);
      setPendingMetadata({});
      activateEditor(TOOL_KEY);
    }
  }, [props.editingMarker, activateEditor]);

  useEffect(() => {
    if (!isActive || isEditing) return;

    const listener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const position = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setPendingPosition(position);
      propsRef.current.onMetadataRequest({
        mode: 'create',
        current: {},
        onConfirm: (metadata) => {
          propsRef.current.onAdd({
            id: crypto.randomUUID(),
            position,
            ...metadata,
          });
          setPendingPosition(null);
          setPendingMetadata({});
          deactivateEditor();
        },
        onCancel: () => {
          setPendingPosition(null);
          deactivateEditor();
          propsRef.current.onCancel?.();
        },
      });
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [isActive, isEditing, map, deactivateEditor]);

  const markerPosition = isEditing
    ? (pendingPosition ?? props.editingMarker?.position ?? null)
    : pendingPosition;

  const showMarker = isActive && markerPosition !== null;
  const dragEnabled = props.dragEnabled ?? true;

  const markerInstance = useMarker(map, showMarker
    ? { position: markerPosition ?? undefined, gmpDraggable: isEditing && dragEnabled }
    : { position: undefined },
  );

  useEffect(() => {
    if (!markerInstance || !isEditing) return;

    const listener = markerInstance.addListener('dragend', () => {
      const pos = markerInstance.position;
      if (!pos) return;
      if (pos instanceof google.maps.LatLng) {
        setPendingPosition({ lat: pos.lat(), lng: pos.lng() });
      } else if (typeof pos === 'object' && 'lat' in pos && 'lng' in pos) {
        setPendingPosition({ lat: pos.lat as number, lng: pos.lng as number });
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [markerInstance, isEditing]);

  useEffect(() => {
    if (!markerInstance) return;
    markerInstance.map = showMarker ? map : null;
  }, [markerInstance, showMarker, map]);

  return null;
}

