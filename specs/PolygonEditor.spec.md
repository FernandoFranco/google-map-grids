# PolygonEditor

## Propósito
Permite criar um polígono por vez (modo criação) ou editar um polígono existente (modo edição). A biblioteca não exibe dialogs de metadata; usa `onMetadataRequest` para que o dev mostre o seu próprio. Registra seu botão e controles na sidebar do `MapEditorShell` via `useDrawingEditorCore`.

## Tipo
Editor component — retorna `null` do render. UI exposta exclusivamente via toolbar do `MapEditorShell`.

## Tipos associados

```ts
export interface PolygonMetadata {
  title: string;
  color: string;
  description?: string;
}

export interface PolygonData extends PolygonMetadata {
  id: string;
  paths: google.maps.LatLngLiteral[][];
}

export type PolygonEditorControlsState =
  | { phase: 'drawing'; cancel: () => void }
  | { phase: 'editing'; properties: () => void; finalize: () => void; cancel: () => void };
```

Exportados via `src/index.ts`. `PolygonEditorControlsState` **não** é o `DrawingEditorControlsState` genérico de `useDrawingEditorCore` (ver `src/hooks/useDrawingEditorCore.ts`, já implementado) — é um tipo próprio deste editor, mais rico: a fase `editing` ganha `properties`, porque diferente de `MapRestrictionEditor`, `PolygonEditor` tem metadata (`onMetadataRequest`). O hook genérico não sabe nada sobre isso.

## Interface

```ts
export interface PolygonEditorProps {
  editingArea?: PolygonData | null;
  onMetadataRequest: (req: MetadataRequest<PolygonMetadata>) => void;
  onAdd: (area: PolygonData) => void;
  onUpdate: (area: PolygonData) => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
  renderButton: (state: EditorButtonState) => ReactNode;
  renderControls: (state: PolygonEditorControlsState) => ReactNode;
}
```

- `editingArea` — quando definido, ativa modo edição para esse polígono. O consumer é responsável pelo lookup (`areas.find(a => a.id === editingId)`).
- `onMetadataRequest` — solicitação de metadata ao dev; o dev abre seu dialog e chama `onConfirm`/`onCancel`.
- `onEditEnd` — chamado ao finalizar ou cancelar o modo edição; consumer limpa `editingArea`.
- `renderButton` — **obrigatório**. Repassado integralmente para `useDrawingEditorCore`, que delega a construção do botão idle ao dev. Retornar `null` desabilita a criação de novos polígonos pela sidebar. `EditorButtonState` é um tipo compartilhado exportado por `MapEditorShell` (ver `src/components/MapEditorShell/EditorContext.ts`), não específico deste editor.
- `renderControls` — **obrigatório**. Recebe `PolygonEditorControlsState` (não o estado cru do hook — `PolygonEditor` o enriquece com `properties` na fase `editing`, ver "Comportamento" abaixo). Retornar `null` faz com que nenhum painel seja exibido enquanto ativo.

## Toolbar

**Botão idle (exemplo de implementação de `renderButton`):**
```
[ 🔷  Desenhar Área ]
```

**Controls — fase `drawing` (exemplo de implementação de `renderControls`):**
```
Desenhar Área
────────────────────────────────
"Clique para adicionar pontos.
 Clique no 1º ponto para fechar (mín. 3)."
────────────────────────────────
[Cancelar]  → state.cancel()
```

**Controls — fase `editing`, tanto em criação (após fechar o polígono) quanto em modo edição (`editingArea` definido) — mesmo formato de estado nos dois casos:**
```
Desenhar Área
────────────────────────────────
"Arraste pontos para ajustar.
 Clique em uma linha para adicionar."
────────────────────────────────
[Propriedades]  → state.properties()
────────────────────────────────
[Finalizar]  → state.finalize()    [Cancelar]  → state.cancel()
```

## Modo criação (botão idle, via `useDrawingEditorCore`)

Delegado ao `useDrawingEditorCore`, repassando `renderButton` direto e enriquecendo `renderControls` (ver "Comportamento" abaixo).

- Fase `drawing`: usuário adiciona nodes, clica node[0] com ≥ 3 nodes para fechar → transiciona para `editing`.
- Fase `editing`: nodes e segmentos ajustáveis.
- `state.properties()` → `onMetadataRequest({ mode: 'create', current: {}, onConfirm, onCancel })`.
  - `onConfirm(metadata)` → armazena metadata pendente.
- `state.finalize()` → `onAdd({ id: crypto.randomUUID(), paths: [nodes], ...pendingMetadata })` → deactivate.
- `state.cancel()` → descarta → deactivate → `onCancel()`.

## Modo edição (`editingArea` definido)

1. Consumer seta `editingArea` (tipicamente via `onEditRequest` de `<PolygonLayer>`).
2. `PolygonEditor` detecta a mudança e auto-activa.
3. Carrega `editingArea.paths` como nodes editáveis — sem lookup necessário.
4. Começa diretamente na fase `editing` (polígono já fechado).
5. `state.properties()` → `onMetadataRequest({ mode: 'edit', current: editingArea, onConfirm, onCancel })`.
   - `onConfirm(metadata)` → armazena metadata pendente.
6. **Drag de node / clique em segmento** → atualiza nodes internamente.
7. `state.finalize()` → `onUpdate({ ...editingArea, paths: [nodes], ...pendingMetadata })` → deactivate → `onEditEnd()`.
8. `state.cancel()` → descarta → deactivate → `onEditEnd()`.

## Comportamento (adapter sobre `useDrawingEditorCore`)

`PolygonEditor` **não repassa `props.renderControls` direto** para `useDrawingEditorCore` — ele intercepta o `DrawingEditorControlsState` genérico do hook e o enriquece com `properties` antes de chamar `props.renderControls`:

```tsx
function PolygonEditor(props: PolygonEditorProps) {
  const handleProperties = () => { /* onMetadataRequest(...), guarda pendingMetadata */ };

  useDrawingEditorCore({
    key: 'polygon',
    onShapeComplete: (nodes) => props.onAdd({ id: crypto.randomUUID(), paths: [nodes], ...pendingMetadata }),
    onCancel: props.onCancel,
    renderButton: props.renderButton,
    renderControls: (hookState) =>
      props.renderControls(
        hookState.phase === 'editing'
          ? { ...hookState, properties: handleProperties }
          : hookState,
      ),
  });

  return null;
}
```

## Retorno
`null`

## Dependências internas
- `useDrawingEditorCore` — gerencia todo o ciclo de vida de criação (sidebar, nodes, fases); `PolygonEditor` enriquece o `renderControls` que repassa a ele.
- `useEditorContext` — para `activateEditor()` no modo edição (auto-activa quando `editingArea` muda).

## Não faz
- Não exibe os polígonos já desenhados (use `PolygonLayer` para isso).
- Não mostra dialog — emite `onMetadataRequest` e aguarda o dev.
- Não cria múltiplos polígonos em sequência — um por ativação.
