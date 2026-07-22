import { useContext } from 'react';

import { EditorToolsContext, type RegisteredEditorTool } from './EditorContext';

export function useEditorTools(): ReadonlyMap<string, RegisteredEditorTool> {
  const tools = useContext(EditorToolsContext);

  if (!tools) {
    throw new Error('useEditorTools must be used within an EditorProvider');
  }

  return tools;
}
