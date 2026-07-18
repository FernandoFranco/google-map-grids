# useDrawingEditorCore (hook interno)

## Propósito
Encapsula o ciclo de vida compartilhado entre editors que usam interação node+line. Combina o registro na sidebar (`useEditorTool`) e a ativação do editor de nodes (`useNodeLineEditor`) em um único hook — evitando duplicação entre `MapRestrictionEditor` e `PolygonEditor`. Não constrói nenhuma UI própria — botão idle e controls ativos são 100% delegados ao dev via `renderButton`/`renderControls`.

## Tipo
Hook interno — **não exportado** via `src/index.ts`. Os tipos `EditorButtonState`/`DrawingEditorControlsState` que ele usa **são** públicos (re-exportados pelos editors que o consomem).

## Tipos associados

```ts
export type DrawingEditorControlsState =
  | { phase: 'drawing'; cancel: () => void }
  | { phase: 'editing'; finalize: () => void; cancel: () => void };
```

Definido neste módulo (`src/hooks/useDrawingEditorCore.ts`) por ser compartilhado entre os dois editors que usam o hook (`MapRestrictionEditor` usa exatamente esse formato; `PolygonEditor` o enriquece — ver [PolygonEditor.spec.md](../PolygonEditor.spec.md)).

## Interface

```ts
export interface UseDrawingEditorCoreOptions {
  key: string;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  onShapeComplete: (nodes: google.maps.LatLngLiteral[]) => void;
  onCancel?: () => void;
  renderButton: (state: EditorButtonState) => React.ReactNode;
  renderControls: (state: DrawingEditorControlsState) => React.ReactNode;
}

function useDrawingEditorCore(options: UseDrawingEditorCoreOptions): {
  nodes: google.maps.LatLngLiteral[];
  phase: 'drawing' | 'editing';
}
```

- `phase` — estado atual exposto para observabilidade. Os callers não precisam reagir ao `phase` para a sidebar — isso já vem refletido em `DrawingEditorControlsState.phase` passado a `renderControls`.
- `renderButton` — **obrigatório**. Repassado pelo editor caller (`PolygonEditor`, `MapRestrictionEditor`); mesma convenção de `MarkerEditorProps.renderButton` (ver `src/components/MarkerEditor/MarkerEditor.types.ts`, já implementado). `EditorButtonState` é um tipo compartilhado exportado por `MapEditorShell` (ver `src/components/MapEditorShell/EditorContext.ts`). O hook não tem botão default — sempre delega a construção ao dev. Retornando `null`, nenhum botão é registrado.
- `renderControls` — **obrigatório**. Recebe `DrawingEditorControlsState`, discriminado por `phase`: em `'drawing'` só existe `cancel`; em `'editing'` existem `finalize` e `cancel`. O hook não tem painel default — sempre delega ao dev. Retornando `null`, nenhum painel é exibido enquanto ativo. Note que o hook não sabe nada sobre metadata/propriedades — isso é responsabilidade de cada editor caller (ver `PolygonEditor`).

## Sidebar gerada internamente

**Botão idle** — o hook chama `options.renderButton({ isActive, activate })` e usa o resultado (incluindo `null`) diretamente.

**Controls ativos** — o hook chama `options.renderControls({ phase, cancel, ...(phase === 'editing' ? { finalize } : {}) })` e usa o resultado (incluindo `null`) diretamente.

Em ambos os casos, o resultado já é um elemento completo (ou `null`) passado a `useEditorTool` — `MapEditorShell` apenas o renderiza, sem envolver em markup próprio.

**Exemplo de implementação de `renderControls` — fase `drawing`:**
```
Desenhar Área
────────────────────────────────
"Clique no mapa para adicionar pontos.
 Clique no 1º ponto para fechar (mín. 3)."
────────────────────────────────
[Cancelar]  → state.cancel()
```

**Exemplo de implementação de `renderControls` — fase `editing`:**
```
Desenhar Área
────────────────────────────────
"Arraste os pontos para ajustar.
 Clique em uma linha para adicionar ponto."
────────────────────────────────
[Finalizar]  → state.finalize()    [Cancelar]  → state.cancel()
```

## Comportamento

**Mount:**
- Chama `useEditorTool({ key, button, controls })`, onde `button`/`controls` vêm de `options.renderButton`/`options.renderControls` — registra na sidebar do `MapEditorShell`.
- Inicializa `useNodeLineEditor` com `enabled: false`.

**Ativação (`isActive = true`):**
- Seta `enabled: true` no `useNodeLineEditor`.
- `phase` começa em `'drawing'`.

**Transição `drawing` → `editing`:**
- `useNodeLineEditor` chama `onPolygonClosed` ao detectar clique em node[0] com ≥ 3 nodes.
- `phase` atualiza para `'editing'` → `renderControls` é chamado de novo com o novo `state.phase`/`state.finalize`.

**`state.finalize()` (fase `editing`):**
- Chama `options.onShapeComplete(nodes)`.
- Chama `deactivateEditor()`.
- Chama `clear()` no `useNodeLineEditor`.

**`state.cancel()` (ambas as fases):**
- Chama `options.onCancel()` (se fornecido).
- Chama `deactivateEditor()`.
- Chama `clear()` no `useNodeLineEditor`.

**Desativação (`isActive = false` após estar ativo):**
- Seta `enabled: false` no `useNodeLineEditor`.
- Chama `clear()` — remove markers, linhas e reseta `nodes` + `phase`.

**Unmount:**
- Cleanup do `useEditorTool` chama `unregisterTool` automaticamente.
- `useNodeLineEditor` faz cleanup dos markers e linhas.

## Retorno

```ts
{
  nodes: google.maps.LatLngLiteral[];  // array reativo das posições atuais
  phase: 'drawing' | 'editing';        // fase atual (para observabilidade)
}
```

## Dependências internas
- `useMap()` — para passar `map` ao `useNodeLineEditor`.
- `useEditorTool` — para registro na sidebar e para obter `isActive`.
- `useNodeLineEditor` — para a mecânica de node placement, drag, lines e fases.
- `useEditorContext` — para `deactivateEditor()` (chamado por `state.cancel()`/`state.finalize()`) e para derivar `isActive`/`activate` passados a `options.renderButton`.

## Uso pelos editors

```tsx
// MapRestrictionEditor — sem metadata, renderControls é passthrough direto
function MapRestrictionEditor(props: MapRestrictionEditorProps) {
  useDrawingEditorCore({
    key: 'map-restriction',
    onShapeComplete: props.onComplete,
    onCancel: props.onCancel,
    renderButton: props.renderButton,
    renderControls: props.renderControls,
  });
  return null;
}

// PolygonEditor — tem metadata, então enriquece o estado do hook antes de repassar
// (ver PolygonEditorControlsState em PolygonEditor.spec.md)
function PolygonEditor(props: PolygonEditorProps) {
  useDrawingEditorCore({
    key: 'polygon',
    onShapeComplete: (nodes) => props.onAdd({ id: crypto.randomUUID(), paths: [nodes], ...pendingMetadata }),
    onCancel: props.onCancel,
    renderButton: props.renderButton,
    renderControls: (hookState) =>
      props.renderControls(
        hookState.phase === 'editing' ? { ...hookState, properties: handleProperties } : hookState,
      ),
  });
  return null;
}
```

## Não faz
- Não constrói nenhum botão idle ou painel de controls default — ambos são sempre delegados a `options.renderButton`/`options.renderControls`.
- Não sabe nada sobre metadata/propriedades — isso é responsabilidade de cada editor caller.
- Não converte o output — isso é do callback `onShapeComplete` do caller.
- Não gerencia múltiplos drawings simultâneos.
