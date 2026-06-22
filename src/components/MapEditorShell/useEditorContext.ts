import { useContext } from 'react';

import { EditorContext, type EditorContextValue } from './EditorContext';

export function useEditorContext(): EditorContextValue {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditorTool must be used within a MapEditorShell');
  }

  return context;
}
