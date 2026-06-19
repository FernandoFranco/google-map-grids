# useDrawingEditorCore (hook interno)

## Propósito
Encapsula o ciclo de vida compartilhado entre editors que usam interação node+line. Combina o registro na sidebar (`useEditorTool`), a ativação do editor de nodes (`useNodeLineEditor`), e a construção do botão idle e dos controles reativos por fase em um único hook — evitando duplicação entre `MapRestrictionEditor` e `PolygonEditor`.

## Tipo
Hook interno — **não exportado** via `src/index.ts`.

## Interface

```ts
export interface UseDrawingEditorCoreOptions {
  key: string;
  title: string;
  icon: React.ReactNode;
  nodeStyle?: NodeStyle;
  lineStyle?: LineStyle;
  onShapeComplete: (nodes: google.maps.LatLngLiteral[]) => void;
  onCancel?: () => void;
}

function useDrawingEditorCore(options: UseDrawingEditorCoreOptions): {
  nodes: google.maps.LatLngLiteral[];
  phase: 'drawing' | 'editing';
}
```

- `title` — label do editor: usado como label do botão idle na sidebar E como cabeçalho dos controles ativos.
- `icon` — ícone específico do editor, exibido no botão idle ao lado do `title`.
- `phase` — estado atual exposto para observabilidade. Os callers não precisam reagir ao `phase` para a sidebar — isso é gerenciado internamente.

## Sidebar gerada internamente

**Botão idle** (construído pelo hook, passado a `useEditorTool`):
```
[ {icon}  {title} ]
```

**Controles ativos — fase `drawing`:**
```
{title}
────────────────────────────────
"Clique no mapa para adicionar pontos.
 Clique no 1º ponto para fechar (mín. 3)."
────────────────────────────────
[Cancelar]
```

**Controles ativos — fase `editing`:**
```
{title}
────────────────────────────────
"Arraste os pontos para ajustar.
 Clique em uma linha para adicionar ponto."
────────────────────────────────
[Finalizar]   [Cancelar]
```

## Comportamento

**Mount:**
- Constrói botão idle e controles internamente.
- Chama `useEditorTool({ key, button, controls })` — registra na sidebar do `MapEditorShell`.
- Inicializa `useNodeLineEditor` com `enabled: false`.

**Ativação (`isActive = true`):**
- Seta `enabled: true` no `useNodeLineEditor`.
- `phase` começa em `'drawing'`.

**Transição `drawing` → `editing`:**
- `useNodeLineEditor` chama `onPolygonClosed` ao detectar clique em node[0] com ≥ 3 nodes.
- `phase` atualiza para `'editing'`.
- Controles internos são re-registrados mostrando "Finalizar".

**"Finalizar" (botão interno, fase `editing`):**
- Chama `options.onShapeComplete(nodes)`.
- Chama `deactivateEditor()`.
- Chama `clear()` no `useNodeLineEditor`.

**"Cancelar" (botão interno, ambas as fases):**
- Chama `options.onCancel()` (se fornecido).
- Chama `deactivateEditor()`.
- Chama `clear()` no `useNodeLineEditor`.

**Desativação (`isActive = false` após estar ativo):**
- Seta `enabled: false` no `useNodeLineEditor`.
- Chama `clear()` — remove markers, linhas e reseta `nodes` + `phase`.

**Unmount:**
- Cleanup do `useEditorTool` chama `unregisterTool` automaticamente.
- `useNodeLineEditor` faz cleanup dos markers e linhas.

## Retorno

```ts
{
  nodes: google.maps.LatLngLiteral[];  // array reativo das posições atuais
  phase: 'drawing' | 'editing';        // fase atual (para observabilidade)
}
```

## Dependências internas
- `useMap()` — para passar `map` ao `useNodeLineEditor`.
- `useEditorTool` — para registro na sidebar e para obter `isActive`.
- `useNodeLineEditor` — para a mecânica de node placement, drag, lines e fases.
- `useEditorContext` — para `deactivateEditor()` nos botões internos.

## Uso pelos editors

```tsx
// MapRestrictionEditor
function MapRestrictionEditor(props: MapRestrictionEditorProps) {
  useDrawingEditorCore({
    key: 'map-restriction',
    title: 'Restrição de Área',
    icon: <MapRestrictionIcon />,
    onShapeComplete: props.onComplete,
    onCancel: props.onCancel,
  });
  return null;
}

// PolygonEditor
function PolygonEditor(props: PolygonEditorProps) {
  useDrawingEditorCore({
    key: 'polygon',
    title: 'Desenhar Área',
    icon: <PolygonIcon />,
    onShapeComplete: (nodes) => props.onAdd({ id: crypto.randomUUID(), paths: [nodes] }),
    onCancel: props.onCancel,
  });
  return null;
}
```

## Não faz
- Não define o estilo visual do botão idle além de ícone + label.
- Não converte o output — isso é do callback `onShapeComplete` do caller.
- Não gerencia múltiplos drawings simultâneos.
