# MapRestriction

## Propósito
Aplica uma restrição de navegação ao mapa e renderiza um overlay escuro semi-transparente em tudo que está fora da área definida — efeito **spotlight**. A área do polígono fica visível e clara; o restante do mapa fica escurecido.

## Tipo
Render component — retorna `null`.

## Interface

```ts
export interface MapRestrictionProps {
  polygon: google.maps.LatLngLiteral[];
  strictBounds?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}
```

- `polygon` — array de vértices do polígono que define a área permitida.
- `overlayColor` — cor do overlay externo. Default: `'#000000'`.
- `overlayOpacity` — opacidade do overlay (0–1). Default: `0.8`.

## Conversão interna

`google.maps.Map.setOptions({ restriction: ... })` requer `LatLngBoundsLiteral` (retângulo). O componente calcula isso internamente a partir dos vértices do polígono:

```
bounds = {
  north: max(polygon.map(p => p.lat)),
  south: min(polygon.map(p => p.lat)),
  east:  max(polygon.map(p => p.lng)),
  west:  min(polygon.map(p => p.lng)),
}
```

## Técnica do overlay (spotlight)

Utiliza `google.maps.Polygon` com dois paths — o Maps preenche o espaço entre eles, criando um "buraco" no polígono da área permitida:

```
paths: [
  // path externo — cobre o mundo inteiro (sentido horário)
  [ {lat:-85,lng:-180}, {lat:-85,lng:180}, {lat:85,lng:180}, {lat:85,lng:-180} ],
  // path interno — a área visível: o polígono do usuário (sentido anti-horário)
  polygon reversed,
]
fillColor: overlayColor,
fillOpacity: overlayOpacity,
strokeWeight: 0,
```

## Comportamento

**Mount:**
- Calcula `bounds` a partir de `polygon`.
- Chama `map.setOptions({ restriction: { latLngBounds: bounds, strictBounds: props.strictBounds ?? true } })`.
- Cria o `Polygon` com dois paths (mundo + buraco) via `usePolygon`.

**Update:**
- Quando `polygon` mudar: recalcula `bounds`, atualiza restrição e reconstrói os paths do polígono.
- Quando `overlayColor` ou `overlayOpacity` mudar: atualiza as options do polígono.

**Unmount:**
- Remove a restrição: `map.setOptions({ restriction: null })`.
- Remove o polígono do mapa.

## Retorno
`null`

## Dependências internas
- `useMap()` — para acessar a instância do mapa.
- `usePolygon` — para o overlay com buraco.

## Não faz
- Não permite ao usuário desenhar ou alterar a área de restrição (isso é responsabilidade do `MapRestrictionEditor`).
- Não exibe borda/stroke no contorno — o contraste visual é dado pelo overlay.
- Não garante que a restrição de navegação corresponda exatamente ao polígono (a restrição é sempre retangular via a API do Maps).
