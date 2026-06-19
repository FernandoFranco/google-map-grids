# DrawnAreas

## Propósito
Renderiza um conjunto de áreas (polígonos) sobre o mapa. Suporta right-click para iniciar edição ou exclusão via context menu mínimo provido pela biblioteca.

## Tipo
Render component — retorna `null`.

## Interface

```ts
export interface DrawnArea {
  id: string;
  paths: google.maps.LatLngLiteral[][];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  onClick?: (id: string) => void;
}

export interface DrawnAreasProps {
  areas: DrawnArea[];
  onEditRequest?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
}
```

- `onEditRequest` — chamado quando o usuário escolhe "Editar" no context menu. Consumer usa para ativar o `DrawnAreaEditor` com `editingArea`.
- `onDeleteRequest` — chamado quando o usuário escolhe "Excluir" no context menu. Consumer é responsável por mostrar confirmação antes de remover.

## Context menu

Quando `onEditRequest` ou `onDeleteRequest` estão definidos, right-click num polígono exibe um context menu mínimo fornecido pela biblioteca:

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
- Cria um `google.maps.Polygon` para cada área via `usePolygon`.

**Update:**
- Quando `areas` mudar, reconcilia por `id`: adiciona novos, remove ausentes, atualiza paths e estilos.

**Right-click (quando callbacks definidos):**
- Exibe context menu no ponto do clique.
- "Editar" → chama `onEditRequest(area.id)`.
- "Excluir" → chama `onDeleteRequest(area.id)`.

**Unmount:**
- Remove todos os polígonos e listeners do mapa.

## Retorno
`null`

## Dependências internas
- `useMap()` — para acessar a instância do mapa.
- `usePolygon` — um por área.

## Não faz
- Não permite ao usuário desenhar novas áreas (isso é responsabilidade do `DrawnAreaEditor`).
- Não exibe dialog de confirmação de exclusão — chama `onDeleteRequest` e o consumer decide.
