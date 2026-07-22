import { type PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useMap } from '../GoogleMap/MapContext';

export type MapControlPosition =
  | 'TOP_LEFT'
  | 'TOP_CENTER'
  | 'TOP_RIGHT'
  | 'LEFT_TOP'
  | 'LEFT_CENTER'
  | 'LEFT_BOTTOM'
  | 'RIGHT_TOP'
  | 'RIGHT_CENTER'
  | 'RIGHT_BOTTOM'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_CENTER'
  | 'BOTTOM_RIGHT';

export interface MapControlProps {
  position: MapControlPosition;
}

export function MapControl(props: PropsWithChildren<MapControlProps>) {
  const map = useMap();
  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    const controlArray = map.controls[google.maps.ControlPosition[props.position]];
    controlArray.push(container);

    return () => {
      const currentControls = controlArray.getArray();
      if (!currentControls) return;
      const index = currentControls.indexOf(container);
      if (index !== -1) controlArray.removeAt(index);
    };
  }, [map, props.position, container]);

  return createPortal(props.children, container);
}
