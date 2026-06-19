# Markers

## Propósito
Renderiza um conjunto de marcadores sobre o mapa. Suporta right-click para iniciar edição ou exclusão via context menu mínimo provido pela biblioteca.

## Tipo
Render component — retorna `null`.

## Interface

```ts
export interface MarkerItem {
  id: string;
  position: google.maps.LatLngLiteral;
  title?: string;
  content?: HTMLElement | string;
  onClick?: (id: string) => void;
}

export interface MarkersProps {
  items: MarkerItem[];
  onEditRequest?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
}
```

- `onEditRequest` — chamado quando o usuário escolhe "Editar" no context menu. Consumer usa para ativar o `MarkerEditor` com `editingMarker`.
- `onDeleteRequest` — chamado quando o usuário escolhe "Excluir" no context menu. Consumer é responsável por mostrar confirmação antes de remover.

## Context menu

Quando `onEditRequest` ou `onDeleteRequest` estão definidos, right-click num marker exibe um context menu mínimo fornecido pela biblioteca:

```
┌──────────┐
│  Editar  │  ← só se onEditRequest definido
│  Excluir │  ← só se onDeleteRequest definido
└──────────┘
```

- Posicionado absolutamente no ponto do clique.
- Descartado ao clicar fora ou ao pressionar Escape.
- Sem formulários, sem estilos conflitantes com o app.

## Comportamento

**Mount:**
- Cria um `AdvancedMarkerElement` para cada item via `useMarker`.

**Update:**
- Quando `items` mudar, reconcilia por `id`: adiciona novos, remove ausentes, atualiza `position`, `title`, `content`.

**Right-click (quando callbacks definidos):**
- Exibe context menu no ponto do clique.
- "Editar" → chama `onEditRequest(item.id)`.
- "Excluir" → chama `onDeleteRequest(item.id)`.

**Unmount:**
- Remove todos os marcadores e listeners do mapa.

## Retorno
`null`

## Dependências internas
- `useMap()` — para acessar a instância do mapa.
- `useMarker` — um por item.

## Não faz
- Não permite posicionar ou mover marcadores (isso é responsabilidade do `MarkerEditor`).
- Não exibe dialog de confirmação de exclusão — chama `onDeleteRequest` e o consumer decide.
- Não gerencia clustering de marcadores (escopo futuro).
