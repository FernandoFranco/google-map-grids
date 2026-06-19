# useMarker (hook interno)

## Propósito
Gerencia o ciclo de vida de um `google.maps.marker.AdvancedMarkerElement` — cria, atualiza e remove do mapa. Hook interno reutilizado por `Markers` (render) e `MarkerEditor` (preview de posicionamento).

## Tipo
Hook interno — **não exportado** via `src/index.ts`.

## Interface

```ts
function useMarker(
  map: google.maps.Map,
  options: google.maps.marker.AdvancedMarkerElementOptions,
): google.maps.marker.AdvancedMarkerElement | null
```

## Comportamento

**Mount:**
- Carrega a library `marker` via `importLibrary('marker')`.
- Cria `new AdvancedMarkerElement({ map, ...options })`.

**Update:**
- Quando `options.position` mudar, atualiza `marker.position`.
- Quando `options.content` mudar, atualiza `marker.content`.
- Quando `options.title` mudar, atualiza `marker.title`.

**Unmount:**
- Chama `marker.map = null` para remover o marcador do mapa.

## Retorno
A instância `AdvancedMarkerElement` (ou `null` enquanto a library está carregando) — útil para quem precisar registrar listeners no marcador.

## Não faz
- Não gerencia múltiplos marcadores — um hook por marcador.
- Não captura clicks ou drag — isso é responsabilidade do componente que usa o hook.
