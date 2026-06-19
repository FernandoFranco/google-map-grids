# Grid

## Propósito
Renderiza uma grade geográfica sobre o mapa com células de tamanho fixo em metros, limitada à área de restrição. Sem `polygon`, não renderiza nada. Células nunca são cortadas — o grid sempre expande ligeiramente para além dos bounds para garantir células completas.

## Tipo
Render component — retorna `null`.

## Interface

```ts
export interface GridProps {
  polygon: google.maps.LatLngLiteral[];
  cellSize: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  onBoundsChange?: (bounds: google.maps.LatLngBoundsLiteral) => void;
}
```

- `polygon` — array de vértices da área de restrição (mesmo array passado ao `<AreaRestriction polygon={...} />`). Array vazio = não renderiza.
- `cellSize` — tamanho de cada célula em metros.
- `onBoundsChange` — chamado com os bounds reais do grid renderizado (ligeiramente maiores que os bounds do polígono quando necessário para evitar células cortadas). Consumer pode usar futuramente para ajustar posição/zoom do `GoogleMap`.

## Comportamento

**Guard:**
- Se `polygon.length === 0`, não renderiza nada e não chama `onBoundsChange`.

**Cálculo dos bounds base:**
- A partir dos vértices do `polygon`:
  ```
  north = max(polygon.lat)
  south = min(polygon.lat)
  east  = max(polygon.lng)
  west  = min(polygon.lng)
  ```

**Conversão cellSize → graus:**
- Usa a latitude central do polígono para converter `cellSize` metros em graus:
  ```
  centerLat = (north + south) / 2
  cellDeg.lat = cellSize / 111320
  cellDeg.lng = cellSize / (111320 * cos(centerLat * π/180))
  ```

**Expansão para células completas:**
- Arredonda os bounds para fora até ao múltiplo mais próximo de `cellDeg`:
  ```
  gridNorth = ceil(north / cellDeg.lat) * cellDeg.lat
  gridSouth = floor(south / cellDeg.lat) * cellDeg.lat
  gridEast  = ceil(east  / cellDeg.lng) * cellDeg.lng
  gridWest  = floor(west  / cellDeg.lng) * cellDeg.lng
  ```

**Renderização:**
- Linhas horizontais (paralelos) de `gridWest` a `gridEast`, de `gridSouth` a `gridNorth` com passo `cellDeg.lat`.
- Linhas verticais (meridianos) de `gridSouth` a `gridNorth`, de `gridWest` a `gridEast` com passo `cellDeg.lng`.
- Cada linha como `google.maps.Polyline`.

**`onBoundsChange`:**
- Chamado após calcular os bounds expandidos:
  ```ts
  { north: gridNorth, south: gridSouth, east: gridEast, west: gridWest }
  ```
- Disparado no mount e sempre que `polygon` ou `cellSize` mudar.

**Update:**
- Mudança em `polygon` ou `cellSize` → recalcula bounds e re-renderiza todas as Polylines.
- Mudança apenas em `strokeColor`, `strokeOpacity`, `strokeWeight` → atualiza options das Polylines existentes sem recalcular.

**Unmount:**
- Remove todas as Polylines do mapa.

## Uso típico

```tsx
<AreaRestriction polygon={polygon} />
<Grid
  polygon={polygon}
  cellSize={500}
  onBoundsChange={(bounds) => setGridBounds(bounds)}
/>
```

O consumer armazena `gridBounds` para uso futuro no `GoogleMap` (pan/zoom). A lógica de ajuste do mapa será especificada separadamente.

## Retorno
`null`

## Dependências internas
- `useMap()` — para acessar a instância do mapa.
- `geometry` library — para cálculos de distância/conversão de metros para graus.

## Não faz
- Não renderiza quando `polygon` está vazio.
- Não se ajusta ao viewport ou ao zoom do mapa — o grid é estático na área de restrição.
- Não permite interação com células individuais (escopo futuro).
- Não renderiza dados dentro das células.
- Não lida com seleção ou highlight de células.
