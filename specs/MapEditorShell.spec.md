# MapEditorShell

## Propósito
Componente de layout que divide a tela em [sidebar | área do mapa]. Gerencia qual editor está ativo e exibe o conteúdo correto na sidebar — botões de ferramentas (idle) ou controles do editor ativo.

## Tipo
Componente de layout — renderiza DOM (wrapper flex). Provê `EditorContext`.

## Interface

```ts
export interface MapEditorShellProps {
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: string | number;
  className?: string;
  sidebarClassName?: string;
}
```

## Layout

```
sidebarPosition = 'left' (default):
┌──────────────────────────────────────────┐
│  [sidebar]    │  [children (GoogleMap)]  │
│  largura fixa │  flex: 1                 │
└──────────────────────────────────────────┘
```

O wrapper externo é `display: flex`, altura `100%`. `sidebarWidth` default `260px`.

## Comportamento da sidebar

**Estado idle (nenhum editor ativo):**
- Itera os editors registrados em `EditorContext` e renderiza o `button` de cada um.
- Clicar num botão chama `activateEditor(key)` → sidebar transiciona para o estado ativo.

**Estado ativo:**
- Renderiza os `controls` do editor cujo `key === activeEditorKey`.
- O editor é responsável por incluir nos `controls` o botão de Cancelar (que chama `deactivateEditor()`).

**Transição:**
- Não há animação obrigatória — a substituição de conteúdo na sidebar é imediata. Implementação pode adicionar CSS transition por fora.

## Retorno
Renderiza um `div` com dois filhos: sidebar div + map area div. Não retorna `null`.

## Dependências internas
- `EditorContext` — provê e gerencia.

## Não faz
- Não sabe o que cada editor faz no mapa — apenas renderiza o que cada editor registrou.
- Não persiste o editor ativo entre remontagens.
- Não gerencia a lógica de qual editor está disponível — isso é controlado por quais editors estão montados dentro do `<GoogleMap>`.
- Não estiliza os botões ou controles de cada editor — estilo é responsabilidade do editor.
