# MarkerEditor

## Propósito
Permite criar um marcador por vez (modo criação) ou editar um marcador existente (modo edição). O editor não renderiza markers já existentes — isso é responsabilidade do `MarkerLayer`. A biblioteca não exibe dialogs de metadata; usa `onMetadataRequest` para que o dev mostre o seu próprio.

## Tipo
Editor component — retorna `null` do render. UI exposta via toolbar do `MapEditorShell`.

## Tipos associados

```ts
export interface IconDefinition {
  id: string;
  label: string;
  content: HTMLElement | string;  // SVG, emoji, URL de imagem, etc.
}

export interface MarkerMetadata {
  name: string;
  icon: string;         // IconDefinition.id
  color: string;        // hex
  description?: string;
}

export interface MarkerData extends MarkerMetadata {
  id: string;
  position: google.maps.LatLngLiteral;
}
```

Exportados via `src/index.ts`.

## Interface

```ts
export interface MarkerEditorProps {
  editingMarker?: MarkerData | null;
  onMetadataRequest: (req: MetadataRequest<MarkerMetadata>) => void;
  onAdd: (marker: MarkerData) => void;
  onUpdate: (marker: MarkerData) => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
}
```

- `editingMarker` — quando definido, ativa modo edição para esse marker. O consumer é responsável pelo lookup (`markers.find(m => m.id === editingMarkerId)`).
- `onMetadataRequest` — chamado pela biblioteca para solicitar que o dev abra seu dialog.
- `onEditEnd` — chamado ao finalizar ou cancelar o modo edição; consumer limpa `editingMarker`.

## Toolbar (via `useEditorTool`)

**Botão idle:**
```
[ {icon}  Adicionar Marcador ]
```

**Controles — modo criação (aguardando clique no mapa):**
```
Adicionar Marcador
────────────────────
"Clique no mapa para posicionar."
────────────────────
[Cancelar]
```

**Controles — modo edição:**
```
Editar Marcador
────────────────────
[Propriedades]
────────────────────
[Done]   [Cancelar]
```

## Modo criação (botão idle na sidebar)

1. Usuário clica o botão idle → editor ativa.
2. Listener de clique no mapa registrado.
3. Clique no mapa → `AdvancedMarkerElement` temporário na posição clicada.
4. `onMetadataRequest({ mode: 'create', current: {}, onConfirm, onCancel })`.
5. `onConfirm(metadata)` → `onAdd({ id: crypto.randomUUID(), position, ...metadata })` → deactivate.
6. `onCancel()` → remove marker temporário → deactivate.

## Modo edição (`editingMarker` definido)

1. Consumer seta `editingMarker` (tipicamente via `onEditRequest` de `<MarkerLayer>`).
2. `MarkerEditor` detecta a mudança e auto-activa.
3. Renderiza **apenas esse marker** como `AdvancedMarkerElement` com `gmpDraggable: true`.
4. **[Propriedades]** → `onMetadataRequest({ mode: 'edit', current: marker, onConfirm, onCancel })`.
   - `onConfirm(metadata)` → armazena metadata pendente internamente.
   - `onCancel()` → descarta metadata pendente (marker continua editável).
5. **Drag** → atualiza posição pendente internamente.
6. **[Done]** → `onUpdate({ ...marker, ...pendingMetadata, position: pendingPosition })` → deactivate → `onEditEnd()`.
7. **[Cancelar]** → descarta todas as mudanças → deactivate → `onEditEnd()`.

## Desativação / Cancelar (modo criação)

- Remove listener de clique do mapa.
- Remove marker temporário (se havia).
- Chama `onCancel()`.

## Unmount

- Cleanup via `useEditorTool` (`unregisterTool` automático).
- Remove `AdvancedMarkerElement` ativo.

## Retorno
`null`

## Dependências internas
- `useMap()` — para registrar listeners.
- `useEditorTool` — para registrar botão e controles na sidebar.
- `useEditorContext` — para `deactivateEditor()` e `activateEditor()` (modo edição auto-activa).
- `marker` library (`importLibrary('marker')`) — para `AdvancedMarkerElement`.

## Não faz
- Não renderiza markers existentes enquanto inativo (use `MarkerLayer`).
- Não mostra dialog — emite `onMetadataRequest` e aguarda o dev.
- Não cria múltiplos markers em sequência — um por ativação.
