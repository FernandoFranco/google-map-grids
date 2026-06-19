# useNodeLineEditor (hook interno)

## Propósito
Gerencia a mecânica completa de edição node+line sobre o mapa com dois estados internos (`drawing` e `editing`): clique para adicionar nodes, clique no node inicial para fechar o polígono, clique em segmento para dividir, drag para reposicionar. É o primitivo de baixo nível compartilhado por `AreaRestrictionEditor` e `DrawnAreaEditor` via `useDrawingEditorCore`.

## Tipo
Hook interno — **não exportado** via `src/index.ts`.

## Interface

```ts
export interface NodeStyle {
  fillColor?: string;
  strokeColor?: string;
  size?: number;
}

export interface LineStyle {
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
}

export interface UseNodeLineEditorOptions {
  map: google.maps.Map;
  enabled: boolean;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  onNodesChange?: (nodes: google.maps.LatLngLiteral[]) => void;
  onPolygonClosed?: () => void;
}

function useNodeLineEditor(options: UseNodeLineEditorOptions): {
  nodes: google.maps.LatLngLiteral[];
  phase: 'drawing' | 'editing';
  clear: () => void;
}
```

- `onPolygonClosed` — chamado quando o usuário clica no node1 com ≥ 3 nodes (transição de `drawing` → `editing`).

## Fase `drawing` (estado inicial quando `enabled` passa para `true`)

**Clique no mapa:**
- Adiciona a posição (`LatLngLiteral`) ao array de nodes.
- Cria um `AdvancedMarkerElement` draggable para o novo node.
- Atualiza a Polyline principal (aberta): node[0]→node[1]→...→node[N-1].
- Chama `onNodesChange(nodes)`.

**Ghost line (preview do fechamento):**
- Quando `nodes.length >= 2`: exibe uma Polyline tracejada/opaca do último node → node[0].
- Atualiza em tempo real conforme novos nodes são adicionados.

**Node[0] como "close target":**
- Quando `nodes.length >= 3`: o marker de node[0] recebe um estilo visual distinto (ex.: borda maior, cor diferente) sinalizando que pode ser clicado para fechar.
- O marker de node[0] recebe um listener de `click` separado (tem prioridade sobre o listener de mapa).

**Clique em node[0] com `nodes.length >= 3`:**
- A ghost line (tracejada) é removida e substituída por uma Polyline sólida permanente (node[N-1]→node[0]).
- O estilo distinto do node[0] é removido.
- O listener de clique do mapa é removido.
- `phase` muda para `'editing'`.
- Chama `onPolygonClosed()`.

## Fase `editing` (após fechar)

**Clique no mapa (espaço vazio):**
- Ignorado — listener do mapa foi removido ao fechar.

**Drag de qualquer node:**
- `gmpDraggable: true` em todos os markers.
- Evento `dragend`: atualiza posição do node no array.
- Atualiza o path de TODOS os segmentos adjacentes ao node movido (incluindo segmento de fechamento).
- Chama `onNodesChange(nodes)`.

**Clique em um segmento de linha (Polyline):**
- Cada segmento (Polyline individual entre node[i] e node[i+1]) tem listener de `click`.
- Ao clicar: insere novo node na posição do clique entre node[i] e node[i+1].
- Cria `AdvancedMarkerElement` draggable para o novo node.
- Atualiza os segmentos: substitui o segmento i→(i+1) por dois: i→novo e novo→(i+1).
- Chama `onNodesChange(nodes)`.

## `clear()`

- Remove todos os markers do mapa.
- Remove todas as Polylines (incluindo a de fechamento e a ghost).
- Reseta `nodes` para `[]` e `phase` para `'drawing'`.
- Chama `onNodesChange([])`.

## Transição `enabled: true → false`

- Remove listener de clique do mapa (se ainda existia — fase `drawing`).
- NÃO remove markers nem Polylines — estado visual permanece.
- O caller decide quando chamar `clear()`.

## Unmount

- Remove todos os listeners (mapa + markers + polylines).
- Remove todos os markers e Polylines do mapa.

## Retorno

```ts
{
  nodes: google.maps.LatLngLiteral[];  // array reativo das posições atuais
  phase: 'drawing' | 'editing';        // fase atual
  clear: () => void;                    // limpa tudo e reseta para estado inicial
}
```

## Dependências internas
- `marker` library (`importLibrary('marker')`) — para `AdvancedMarkerElement` dos nodes
- `maps` library — para `google.maps.Polyline` dos segmentos

## Não faz
- Não emite o polígono final — isso é responsabilidade do `useDrawingEditorCore`.
- Não remove nodes individualmente (apenas `clear()` reseta tudo).
- Não valida o número máximo de nodes.
