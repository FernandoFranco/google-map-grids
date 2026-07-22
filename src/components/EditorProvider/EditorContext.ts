import { createContext, type ReactNode } from 'react';

export interface EditorButtonState {
  isActive: boolean;
  activate: () => void;
}

export interface MetadataRequest<T> {
  mode: 'create' | 'edit';
  current: Partial<T>;
  onConfirm: (data: T) => void;
  onCancel: () => void;
}

export interface RegisteredEditorTool {
  button: ReactNode;
  controls: ReactNode;
}

export interface EditorContextValue {
  activeEditorKey: string | null;
  activateEditor: (key: string) => void;
  deactivateEditor: () => void;
  registerTool: (key: string, button: ReactNode, controls: ReactNode) => void;
  unregisterTool: (key: string) => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export const EditorToolsContext = createContext<ReadonlyMap<string, RegisteredEditorTool> | null>(
  null,
);
