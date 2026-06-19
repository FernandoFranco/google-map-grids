# AreaRestrictionEditor

## Propósito
Permite ao usuário definir interativamente a área de restrição do mapa. Registra seu botão e controles na sidebar do `MapEditorShell` via `useDrawingEditorCore`. Fica dormente quando não ativo.

## Tipo
Editor component — retorna `null` do render. UI exposta exclusivamente via toolbar do `MapEditorShell`.

## Interface

```ts
export interface AreaRestrictionEditorProps {
  onComplete: (polygon: google.maps.LatLngLiteral[]) => void;
  onCancel?: () => void;
}
```

O output é um array de vértices (`LatLngLiteral[]`). O consumidor passa esse array para `<AreaRestriction polygon={...} />`, que calcula o bounding box internamente.

## Toolbar

**Botão idle:**
```
[ Restrição de Área ]   ← label + ícone
```

**Controles ativos** — gerenciados internamente por `useDrawingEditorCore` com `title: 'Restrição de Área'`. Ver [useDrawingEditorCore.spec.md](hooks/useDrawingEditorCore.spec.md) para o layout exato por fase.

## Comportamento

Delegado integralmente ao `useDrawingEditorCore`:

```tsx
function AreaRestrictionEditor(props: AreaRestrictionEditorProps) {
  useDrawingEditorCore({
    key: 'area-restriction',
    title: 'Restrição de Área',
    icon: <AreaRestrictionIcon />,
    onShapeComplete: props.onComplete,
    onCancel: props.onCancel,
  });
  return null;
}
```

- Fase `drawing`: usuário adiciona nodes clicando no mapa, clica no node[0] com ≥ 3 nodes para fechar.
- Fase `editing`: usuário ajusta nodes e segmentos, clica "Finalizar" para emitir.
- "Finalizar" → `props.onComplete(nodes)`.
- "Cancelar" → `props.onCancel?.()` + editor desativa.

## Retorno
`null`

## Dependências internas
- `useDrawingEditorCore` — gerencia todo o ciclo de vida (sidebar, nodes, fases, controles).

## Não faz
- Não aplica a restrição ao mapa (use `AreaRestriction` para isso).
- Não calcula o bounding box — isso é feito pelo `AreaRestriction` ao receber `polygon`.
- Não exibe a restrição existente.
- Não renderiza nada no DOM diretamente.
