import {
  type PropsWithChildren,
  useState,
  useCallback,
  useRef,
  useReducer,
  useMemo,
  Fragment,
  type ReactNode,
} from 'react';

import { EditorContext, type EditorContextValue } from './EditorContext';

export type { EditorButtonState, MetadataRequest } from './EditorContext';

export interface MapEditorShellProps {
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string | number;
  className?: string;
  sidebarClassName?: string;
}

interface RegisteredTool {
  button: ReactNode;
  controls: ReactNode;
}

export function MapEditorShell(props: PropsWithChildren<MapEditorShellProps>) {
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null);
  const toolsRef = useRef(new Map<string, RegisteredTool>());
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);

  const activateEditor = useCallback((key: string) => {
    setActiveEditorKey(key);
  }, []);

  const deactivateEditor = useCallback(() => {
    setActiveEditorKey(null);
  }, []);

  const registerTool = useCallback((key: string, button: ReactNode, controls: ReactNode) => {
    toolsRef.current.set(key, { button, controls });
    forceUpdate();
  }, []);

  const unregisterTool = useCallback((key: string) => {
    toolsRef.current.delete(key);
    forceUpdate();
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

  const sidebarPos = props.sidebarPosition ?? 'left';
  const resolvedSidebarWidth =
    typeof props.sidebarWidth === 'number' ? `${props.sidebarWidth}px` : props.sidebarWidth;

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    flexDirection: sidebarPos === 'right' ? 'row-reverse' : 'row',
  };

  const sidebarStyle: React.CSSProperties = {
    width: resolvedSidebarWidth,
    overflowY: 'auto',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
  };

  const sidebarContent =
    activeEditorKey === null
      ? Array.from(toolsRef.current.entries()).map(([key, tool]) => (
          <Fragment key={key}>{tool.button}</Fragment>
        ))
      : (toolsRef.current.get(activeEditorKey)?.controls ?? null);

  return (
    <EditorContext.Provider value={editorContextValue}>
      <div style={wrapperStyle} className={props.className}>
        <div style={sidebarStyle} className={props.sidebarClassName}>
          {sidebarContent}
        </div>
        <div style={contentStyle}>{props.children}</div>
      </div>
    </EditorContext.Provider>
  );
}
