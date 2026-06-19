# EditorContext + useEditorTool

## Propósito
Gerencia o estado de qual editor está ativo e serve de canal para que os editors registrem seus botões (idle toolbar) e controles (active toolbar) no `MapEditorShell`. Hook `useEditorTool` é a interface que cada editor usa.

## Tipo
Contexto interno + hook interno — **nenhum** é exportado via `src/index.ts`.

## Contexto — interface interna

```ts
interface EditorContextValue {
  activeEditorKey: string | null;
  activateEditor: (key: string) => void;
  deactivateEditor: () => void;
  registerTool: (key: string, button: React.ReactNode, controls: React.ReactNode) => void;
  unregisterTool: (key: string) => void;
}
```

Provido exclusivamente por `MapEditorShell`. Valor padrão (fora de um `MapEditorShell`): `null`.

## Hook — `useEditorTool`

```ts
interface UseEditorToolOptions {
  key: string;
  button: React.ReactNode;
  controls: React.ReactNode;
}

function useEditorTool(options: UseEditorToolOptions): { isActive: boolean }
```

## Comportamento do hook

**Mount:**
- Acessa `EditorContext` — lança `Error('useEditorTool must be used within a MapEditorShell')` se o contexto for `null`.
- Chama `registerTool(key, button, controls)` via `useLayoutEffect`.

**Rerender (quando `button` ou `controls` mudam):**
- Chama `registerTool(key, button, controls)` novamente para manter o `MapEditorShell` atualizado. Isso permite que os controles sejam reativos ao estado interno do editor (ex.: o color picker reflete a cor selecionada em tempo real).

**Unmount:**
- Chama `unregisterTool(key)`.
- Se o editor desmontado era o ativo (`activeEditorKey === key`), chama `deactivateEditor()` — a sidebar volta ao idle.

**Retorno:**
- `{ isActive: activeEditorKey === options.key }`

## Fluxo de ativação

```
Usuário clica botão idle na sidebar
  → MapEditorShell chama activateEditor(key)
  → activeEditorKey = key
  → useEditorTool retorna { isActive: true } para o editor correspondente
  → Editor ativa interações no mapa
  → MapEditorShell renderiza os controls desse editor na sidebar

Usuário clica Cancelar (dentro dos controls do editor)
  → Editor chama deactivateEditor() via useEditorContext()
  → activeEditorKey = null
  → useEditorTool retorna { isActive: false }
  → Editor desativa interações no mapa
  → MapEditorShell volta ao idle
```

## Hook auxiliar — `useEditorContext`

```ts
function useEditorContext(): EditorContextValue
```

Hook interno que retorna o valor do `EditorContext`. Usado pelos editors para chamar `deactivateEditor()` dentro dos seus `controls` (ex.: botão Cancelar). Lança erro se usado fora de um `MapEditorShell`.

## Não faz
- Não coordena múltiplos editors ativos simultaneamente — ativar um editor desativa o anterior.
- Não persiste o editor ativo em `localStorage` ou qualquer storage externo.
- Não conhece a lógica de mapa de nenhum editor.
