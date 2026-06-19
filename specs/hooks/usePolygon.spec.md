# usePolygon (hook interno)

## Propósito
Gerencia o ciclo de vida de um `google.maps.Polygon` — cria, atualiza e remove do mapa. Hook interno reutilizado por `PolygonLayer` (render) e potencialmente por `MapRestriction` (contorno visual).

## Tipo
Hook interno — **não exportado** via `src/index.ts`.

## Interface

```ts
function usePolygon(
  map: google.maps.Map,
  paths: google.maps.LatLngLiteral[][],
  options?: google.maps.PolygonOptions,
): google.maps.Polygon
```

## Comportamento

**Mount:**
- Cria `new google.maps.Polygon({ map, paths, ...options })`.

**Update:**
- Quando `paths` mudar, chama `polygon.setPaths(paths)`.
- Quando `options` mudar, chama `polygon.setOptions(options)`.

**Unmount:**
- Chama `polygon.setMap(null)` para remover o polígono do mapa.

## Retorno
A instância `google.maps.Polygon` — útil para quem precisar registrar listeners no polígono.

## Não faz
- Não gerencia múltiplos polígonos — um hook por polígono.
- Não captura interações do usuário com o polígono (isso é responsabilidade do componente que o usa).
