# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

React component library focused on Google Maps integration — specifically grid-based components (e.g., overlays, grid renderers) built on top of the Google Maps API. React and react-dom are peer dependencies and must never be bundled.

## Commands

```bash
yarn build          # compile library → dist/ (ESM + CJS + types)
yarn dev            # start Vite dev server (for local demos/sandboxes)
yarn test           # run all Vitest tests
yarn test <file>    # run a single test file
yarn lint           # ESLint on src/
yarn lint:fix       # ESLint with auto-fix
yarn format         # Prettier write on all files
yarn format:check   # Prettier check (CI)
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
3. Test files should be co-located (`MyGrid.test.tsx`) — `vite-plugin-dts` excludes `*.test.tsx` from type generation automatically.
