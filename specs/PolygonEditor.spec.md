# PolygonEditor

## Propósito
Permite criar um polígono por vez (modo criação) ou editar um polígono existente (modo edição). A biblioteca não exibe dialogs de metadata; usa `onMetadataRequest` para que o dev mostre o seu próprio. Registra seu botão e controles na sidebar do `MapEditorShell` via `useDrawingEditorCore`.

## Tipo
Editor component — retorna `null` do render. UI exposta exclusivamente via toolbar do `MapEditorShell`.

## Tipos associados

```ts
export interface PolygonMetadata {
  title: string;
  color: string;
  description?: string;
}

export interface PolygonData extends PolygonMetadata {
  id: string;
  paths: google.maps.LatLngLiteral[][];
}
```

Exportados via `src/index.ts`.

## Interface

```ts
export interface PolygonEditorProps {
  editingArea?: PolygonData | null;
  onMetadataRequest: (req: MetadataRequest<PolygonMetadata>) => void;
  onAdd: (area: PolygonData) => void;
  onUpdate: (area: PolygonData) => void;
  onEditEnd?: () => void;
  onCancel?: () => void;
}
```

- `editingArea` — quando definido, ativa modo edição para esse polígono. O consumer é responsável pelo lookup (`areas.find(a => a.id === editingId)`).
- `onMetadataRequest` — solicitação de metadata ao dev; o dev abre seu dialog e chama `onConfirm`/`onCancel`.
- `onEditEnd` — chamado ao finalizar ou cancelar o modo edição; consumer limpa `editingArea`.

## Toolbar

**Botão idle:**
```
[ {icon}  Desenhar Área ]
```

**Controles — modo criação, fase `drawing`:**
```
Desenhar Área
────────────────────────────────
"Clique para adicionar pontos.
 Clique no 1º ponto para fechar (mín. 3)."
────────────────────────────────
[Cancelar]
```

**Controles — modo criação, fase `editing` e modo edição (`editingArea` definido):**
```
Desenhar Área
────────────────────────────────
"Arraste pontos para ajustar.
 Clique em uma linha para adicionar."
────────────────────────────────
[Propriedades]
────────────────────────────────
[Finalizar]   [Cancelar]
```

## Modo criação (botão idle, via `useDrawingEditorCore`)

Delegado ao `useDrawingEditorCore` com `title: 'Desenhar Área'`.

- Fase `drawing`: usuário adiciona nodes, clica node[0] com ≥ 3 nodes para fechar → transiciona para `editing`.
- Fase `editing`: nodes e segmentos ajustáveis.
- **[Propriedades]** → `onMetadataRequest({ mode: 'create', current: {}, onConfirm, onCancel })`.
  - `onConfirm(metadata)` → armazena metadata pendente.
- **[Finalizar]** → `onAdd({ id: crypto.randomUUID(), paths: [nodes], ...pendingMetadata })` → deactivate.
- **[Cancelar]** → descarta → deactivate → `onCancel()`.

## Modo edição (`editingArea` definido)

1. Consumer seta `editingArea` (tipicamente via `onEditRequest` de `<PolygonLayer>`).
2. `PolygonEditor` detecta a mudança e auto-activa.
3. Carrega `editingArea.paths` como nodes editáveis — sem lookup necessário.
4. Começa diretamente na fase `editing` (polígono já fechado).
5. **[Propriedades]** → `onMetadataRequest({ mode: 'edit', current: editingArea, onConfirm, onCancel })`.
   - `onConfirm(metadata)` → armazena metadata pendente.
6. **Drag de node / clique em segmento** → atualiza nodes internamente.
7. **[Finalizar]** → `onUpdate({ ...editingArea, paths: [nodes], ...pendingMetadata })` → deactivate → `onEditEnd()`.
8. **[Cancelar]** → descarta → deactivate → `onEditEnd()`.

## Retorno
`null`

## Dependências internas
- `useDrawingEditorCore` — gerencia todo o ciclo de vida de criação (sidebar, nodes, fases).
- `useEditorContext` — para `activateEditor()` no modo edição (auto-activa quando `editingArea` muda).

## Não faz
- Não exibe os polígonos já desenhados (use `PolygonLayer` para isso).
- Não mostra dialog — emite `onMetadataRequest` e aguarda o dev.
- Não cria múltiplos polígonos em sequência — um por ativação.
