# MapRestrictionEditor

## Propósito
Permite ao usuário definir interativamente a área de restrição do mapa. Registra seu botão e controls na sidebar do `MapEditorShell` via `useDrawingEditorCore`. Fica dormente quando não ativo. Não tem conceito de metadata — só emite o polígono desenhado.

## Tipo
Editor component — retorna `null` do render. UI exposta exclusivamente via toolbar do `MapEditorShell`.

## Interface

```ts
export interface MapRestrictionEditorProps {
  onComplete: (polygon: google.maps.LatLngLiteral[]) => void;
  onCancel?: () => void;
  renderButton: (state: EditorButtonState) => ReactNode;
  renderControls: (state: DrawingEditorControlsState) => ReactNode;
}
```

O output é um array de vértices (`LatLngLiteral[]`). O consumidor passa esse array para `<MapRestriction polygon={...} />`, que calcula o bounding box internamente.

- `renderButton` — **obrigatório**. Repassado para `useDrawingEditorCore`, que delega a construção do botão idle ao dev. Retornar `null` desabilita a ativação pela sidebar. `EditorButtonState` é um tipo compartilhado exportado por `MapEditorShell` (ver `src/components/MapEditorShell/EditorContext.ts`), não específico deste editor.
- `renderControls` — **obrigatório**. Repassado **diretamente** (passthrough, sem enriquecimento) para `useDrawingEditorCore` — como este editor não tem metadata, `DrawingEditorControlsState` já é suficiente. Ver [useDrawingEditorCore.spec.md](hooks/useDrawingEditorCore.spec.md) para o formato exato (`{ phase: 'drawing', cancel }` | `{ phase: 'editing', finalize, cancel }`). Retornar `null` faz com que nenhum painel seja exibido enquanto ativo.

## Toolbar

**Botão idle (exemplo de implementação de `renderButton`):**
```
[ Restrição de Área ]   ← label + ícone
```

**Controls ativos** — formato e exemplos de implementação de `renderControls` descritos em [useDrawingEditorCore.spec.md](hooks/useDrawingEditorCore.spec.md) (esse editor repassa o estado do hook sem alterações).

## Comportamento

Delegado integralmente ao `useDrawingEditorCore`:

```tsx
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
```

- Fase `drawing`: usuário adiciona nodes clicando no mapa, clica no node[0] com ≥ 3 nodes para fechar.
- Fase `editing`: usuário ajusta nodes e segmentos; `state.finalize()` (chamado pelo `renderControls` do dev) emite.
- `state.finalize()` → `props.onComplete(nodes)`.
- `state.cancel()` → `props.onCancel?.()` + editor desativa.

## Retorno
`null`

## Dependências internas
- `useDrawingEditorCore` — gerencia todo o ciclo de vida (sidebar, nodes, fases); botão e controls vêm de `props.renderButton`/`props.renderControls`.

## Não faz
- Não aplica a restrição ao mapa (use `MapRestriction` para isso).
- Não calcula o bounding box — isso é feito pelo `MapRestriction` ao receber `polygon`.
- Não exibe a restrição existente.
- Não renderiza nada no DOM diretamente.
