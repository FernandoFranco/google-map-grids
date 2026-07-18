# Contributing to google-map-grids

Thanks for your interest in contributing! This guide covers the practical steps to get set up and submit a change. For the project's architecture, component patterns, and code style rules, see [CLAUDE.md](./CLAUDE.md) — it's the canonical reference and this guide won't repeat it.

## Prerequisites

- Node.js
- [Yarn 4 (Berry)](https://yarnpkg.com/) — this repo uses Yarn's `packageManager` field, so run `yarn` commands, not `npm`.
- A [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) for running Storybook locally.

## Getting started

```bash
git clone https://github.com/FernandoFranco/google-map-grids.git
cd google-map-grids
yarn install
cp .env.example .env.local   # then fill in VITE_GOOGLE_MAPS_API_KEY
yarn dev                     # starts Storybook on http://localhost:3000
```

## Making changes

- Every component needs a co-located story file (`ComponentName.stories.tsx`) with `autodocs` and a Controls-driven Playground — see [CLAUDE.md](./CLAUDE.md#storybook-stories) for the full checklist.
- Follow the existing component/props conventions (single `props` object, no destructuring in the signature, `PropsWithChildren<Props>` for children) documented in [CLAUDE.md](./CLAUDE.md#code-style-rules).
- Keep new logic reused between components in `src/hooks/` as internal hooks — check there first before writing new Google Maps logic inline.

## Before opening a pull request

Run the full check locally:

```bash
yarn lint
yarn test
yarn format:check
yarn build
```

All four should pass. `yarn build` in particular catches type errors that show up only in the compiled `.d.ts` output.

## Commit messages

This repo follows `type(scope): short description`, e.g.:

```
feat(marker-editor): add drag-to-reposition support
fix(polygon-layer): stop other polygons reacting to clicks while editing
docs: add CONTRIBUTING.md
```

Common types: `feat`, `fix`, `docs`, `refactor`, `chore`.

## Reporting bugs / requesting features

Please open a [GitHub Issue](https://github.com/FernandoFranco/google-map-grids/issues) — include a minimal reproduction (a Storybook story is ideal) for bugs.
