import { createContext, type ReactNode } from 'react';

export interface EditorContextValue {
  activeEditorKey: string | null;
  activateEditor: (key: string) => void;
  deactivateEditor: () => void;
  registerTool: (key: string, button: ReactNode, controls: ReactNode) => void;
  unregisterTool: (key: string) => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);
