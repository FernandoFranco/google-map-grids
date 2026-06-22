import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

import { useEditorContext } from './useEditorContext';

export interface UseEditorToolOptions {
  key: string;
  button: ReactNode;
  controls: ReactNode;
}

export function useEditorTool(options: UseEditorToolOptions): { isActive: boolean } {
  const editorContext = useEditorContext();
  const activeEditorKeyRef = useRef(editorContext.activeEditorKey);

  useEffect(() => {
    activeEditorKeyRef.current = editorContext.activeEditorKey;
  }, [editorContext.activeEditorKey]);

  useLayoutEffect(() => {
    editorContext.registerTool(options.key, options.button, options.controls);

    return () => {
      editorContext.unregisterTool(options.key);

      if (activeEditorKeyRef.current === options.key) {
        editorContext.deactivateEditor();
      }
    };
  }, [editorContext, options.key, options.button, options.controls]);

  return { isActive: editorContext.activeEditorKey === options.key };
}
