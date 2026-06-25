import { type PropsWithChildren, useState, useCallback, useRef, useReducer, useMemo, type ReactNode } from 'react';

import { EditorContext, type EditorContextValue } from './EditorContext';

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
    props.sidebarWidth === undefined
      ? '260px'
      : typeof props.sidebarWidth === 'number'
        ? `${props.sidebarWidth}px`
        : props.sidebarWidth;

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    flexDirection: sidebarPos === 'right' ? 'row-reverse' : 'row',
  };

  const sidebarStyle: React.CSSProperties = {
    width: resolvedSidebarWidth,
    padding: '16px',
    borderRight: sidebarPos === 'left' ? '1px solid #e0e0e0' : undefined,
    borderLeft: sidebarPos === 'right' ? '1px solid #e0e0e0' : undefined,
    background: '#f9f9f9',
    overflowY: 'auto',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
  };

  const sidebarContent =
    activeEditorKey === null
      ? Array.from(toolsRef.current.entries()).map(([key, tool]) => (
          <div key={key} style={{ marginBottom: '12px' }}>
            <button
              onClick={() => activateEditor(key)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {tool.button}
            </button>
          </div>
        ))
      : (() => {
          const activeTool = toolsRef.current.get(activeEditorKey);
          return activeTool ? <div>{activeTool.controls}</div> : null;
        })();

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
