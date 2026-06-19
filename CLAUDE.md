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

## Code Style Rules

### Comments
Do **not** add comments unless they are strictly necessary (e.g. an `eslint-disable` with a reason, or a non-obvious workaround). Never add descriptive, explanatory, or JSDoc comments — the code and types should be self-documenting.

### Component pattern
Always receive props as a single `props` object — never destructure in the function signature:

```tsx
// ✅ correct
export function MyComponent(props: MyComponentProps) {
  return <div style={{ height: props.height }}>{props.label}</div>;
}

// ❌ wrong
export function MyComponent({ height, label }: MyComponentProps) { ... }
```

### Children
Never include `children` in the component's own `Props` interface. Use `PropsWithChildren<Props>` from React instead:

```tsx
import { type PropsWithChildren } from 'react';

export interface MyComponentProps {
  title: string;
}

export function MyComponent(props: PropsWithChildren<MyComponentProps>) {
  return <div><h1>{props.title}</h1>{props.children}</div>;
}
```

## Component Architecture

### Render vs Editor

Each map feature has two separate components with distinct responsibilities:

**Render components** — receive ready data, display it, return `null`. No interactivity. Lightweight. Named after the feature (e.g. `AreaRestriction`, `DrawnAreas`, `Markers`).

**Editor components** — capture user interactions (clicks, drag, drawing). Emit structured data via callbacks. Isolate all input complexity. Named with `Editor` suffix (e.g. `AreaRestrictionEditor`, `DrawnAreaEditor`, `MarkerEditor`).

```tsx
<GoogleMapsProvider apiKey={key}>
  <GoogleMap center={...} zoom={...}>
    {/* render: display existing data */}
    <AreaRestriction bounds={bounds} />
    <DrawnAreas areas={areas} />
    <Markers items={markers} />

    {/* editor: capture new data */}
    <DrawnAreaEditor onComplete={(area) => addArea(area)} />
  </GoogleMap>
</GoogleMapsProvider>
```

### MapContext

`GoogleMap` provides the `google.maps.Map` instance via `MapContext`. All layer components (render and editor) consume it via `useMap()`, which throws if called outside a `<GoogleMap>`.

```
GoogleMapsProvider  →  GoogleMapsContext  { isLoaded, loadError }
  └── GoogleMap     →  MapContext         { map: google.maps.Map }
        └── layer components consume useMap()
```

### Layer component template

Every layer component follows this pattern — no DOM, imperative lifecycle via `useEffect`:

```tsx
export function MyLayer(props: MyLayerProps) {
  const map = useMap();

  useEffect(() => {
    // attach to map imperatively
    return () => { /* cleanup on unmount */ };
  }, [map, ...deps]);

  return null;
}
```

### Shared internal primitives (`src/hooks/`)

Logic reused between render and editor components lives in `src/hooks/` as internal hooks — **never exported** via `src/index.ts`. Before writing Google Maps logic inside a component, check if a hook in `src/hooks/` already covers it. If the same logic appears in two components, it becomes an internal hook.

Each component has a `.spec.md` in `specs/` describing its full contract. Read the relevant spec before implementing a component.

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

## Google Maps Libraries

Use `importLibrary(name)` from `@googlemaps/js-api-loader` inside each component (after `isLoaded === true`). Do **not** rely on the `libraries` prop of `GoogleMapsProvider` — it is vestigial in the v2 API.

```ts
import { importLibrary } from '@googlemaps/js-api-loader';

const { Map } = await importLibrary('maps');
const { AdvancedMarkerElement } = await importLibrary('marker');
```

Available libraries:

| Library | Purpose |
|---|---|
| `core` | Base types: `LatLng`, `LatLngBounds`, events. Loaded by `GoogleMapsProvider` internally. |
| `maps` | The `Map` class. Needed by any component that renders a map. |
| `marker` | `AdvancedMarkerElement` — new marker API (replaces legacy `Marker`). |
| `geometry` | Geometric calculations: distance, polygon area, polyline encode/decode. Most relevant for grid math. |
| `places` | Address autocomplete, place details, nearby search. |
| `drawing` | UI drawing tools on the map (polygons, circles, rectangles). |
| `elevation` | Altitude/elevation data for coordinates. |
| `geocoding` | Address ↔ coordinates conversion. |
| `routes` | Directions and routing between points. |
| `streetView` | Street View panoramas. |
| `visualization` | Heatmaps. |
| `journeySharing` | Fleet/ride-sharing real-time tracking UI. |
| `addressValidation` | Postal address validation and normalization. |
| `airQuality` | Air quality data by location. |
| `maps3d` | 3D maps (beta). |

Most relevant for this project: **`maps`**, **`marker`**, **`geometry`**.
