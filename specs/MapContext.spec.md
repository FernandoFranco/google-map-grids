# MapContext + useMap

## Propósito
Provê a instância `google.maps.Map` para todos os layer components (render e editor) via contexto React. É a fundação sobre a qual todos os outros componentes operam.

## Interface

```ts
// Contexto interno (não exportado)
const MapContext = createContext<google.maps.Map | null>(null);

// Hook público
function useMap(): google.maps.Map
```

## Comportamento

- `MapContext` é provido pelo `GoogleMap` após a instância do mapa ser criada.
- Enquanto o mapa ainda está sendo inicializado, o valor do contexto é `null`.
- `GoogleMap` não renderiza `props.children` enquanto o mapa for `null` — garante que nenhum layer component é montado sem um mapa disponível.
- `useMap()` lança `Error('useMap must be used within a GoogleMap')` se o mapa for `null`.

## Retorno

`useMap()` retorna a instância `google.maps.Map` diretamente — nunca `null`.

## Dependências internas
Nenhuma.

## Não faz
- Não gerencia o carregamento da API (isso é responsabilidade do `GoogleMapsProvider` via `GoogleMapsContext`).
- Não expõe o `MapContext` publicamente — apenas `useMap()` é exportado.
