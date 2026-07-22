import { type PropsWithChildren, useState, useCallback, useMemo, type ReactNode } from 'react';

import {
  EditorContext,
  EditorToolsContext,
  type EditorContextValue,
  type RegisteredEditorTool,
} from './EditorContext';

export function EditorProvider(props: PropsWithChildren) {
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null);
  const [tools, setTools] = useState(new Map<string, RegisteredEditorTool>());

  const activateEditor = useCallback((key: string) => {
    setActiveEditorKey(key);
  }, []);

  const deactivateEditor = useCallback(() => {
    setActiveEditorKey(null);
  }, []);

  const registerTool = useCallback((key: string, button: ReactNode, controls: ReactNode) => {
    setTools((prev) => new Map(prev).set(key, { button, controls }));
  }, []);

  const unregisterTool = useCallback((key: string) => {
    setTools((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const editorContextValue: EditorContextValue = useMemo(
    () => ({
      activeEditorKey,
      activateEditor,
      deactivateEditor,
      registerTool,
      unregisterTool,
    }),
    [activeEditorKey, activateEditor, deactivateEditor, registerTool, unregisterTool],
  );

  return (
    <EditorContext.Provider value={editorContextValue}>
      <EditorToolsContext.Provider value={tools}>{props.children}</EditorToolsContext.Provider>
    </EditorContext.Provider>
  );
}
