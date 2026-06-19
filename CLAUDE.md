# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

React component library focused on Google Maps integration — specifically grid-based components (e.g., overlays, grid renderers) built on top of the Google Maps API. React and react-dom are peer dependencies and must never be bundled.

## Commands

```bash
yarn dev                  # start Storybook dev server on http://localhost:3000
yarn build                # compile library → dist/ (ESM + CJS + types)
yarn build:storybook      # build static Storybook site → storybook-static/
yarn test                 # run all Vitest tests (unit + Storybook stories)
yarn test <file>          # run a single test file
yarn lint                 # ESLint on src/
yarn lint:fix             # ESLint with auto-fix
yarn format               # Prettier write on all files
yarn format:check         # Prettier check (CI)
```

## Architecture

This is a **library build**, not an application. Key constraints:

- Entry point: [src/index.ts](src/index.ts) — all public exports must be re-exported from here.
- Build output: [dist/](dist/) with both `google-map-grids.js` (ESM) and `google-map-grids.cjs` (CJS), plus `.d.ts` types via `vite-plugin-dts`.
- `react`, `react-dom`, and `react/jsx-runtime` are externalized in the Rollup config — never import them as direct dependencies.
- TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`, `isolatedModules`).
- ESLint enforces React Hooks rules; Prettier handles formatting (configured as ESLint plugin so they don't conflict).
- Package manager is **Yarn 4 (Berry)** — use `yarn` not `npm`.

## Adding a New Component

1. Create the component under `src/` (e.g., `src/components/MyGrid/MyGrid.tsx`).
2. Export it from [src/index.ts](src/index.ts).
3. Test files and story files should be co-located (`MyGrid.test.tsx`, `MyGrid.stories.tsx`) — both are excluded from the library type output automatically.

## Storybook Stories

**Every component must have a co-located story file** (`ComponentName.stories.tsx`). A story is considered complete when it has:

- `tags: ['autodocs']` — enables the auto-generated Docs page with prop table
- At least one functional **Default** story with all required args
- **Playground** via Controls — all relevant props exposed as args with proper `control` and `description` in `argTypes`
- **Variation stories** for the most relevant states or configurations (e.g., different layouts, error states, sizes)

For components that depend on `GoogleMapsProvider`, add it as a `decorators` entry in the story meta (not inside the component itself) and expose `apiKey` as an extra arg that defaults to `import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''`.

Stories live at `src/**/*.stories.tsx` (co-located with components). Use the `satisfies` pattern for full type inference:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'], // enables the auto-generated Docs page
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    /* required props */
  },
};
```

TypeScript prop types are auto-extracted for the Controls panel via `react-docgen-typescript`. For components that require a Google Maps container, add it as a `decorators` entry in the story meta rather than inside the component itself.
