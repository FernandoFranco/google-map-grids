# google-map-grids

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)

A React component library for [Google Maps](https://developers.google.com/maps/documentation/javascript) focused on grid overlays and interactive map editors — draw and edit markers, polygons, and map restrictions, and render coordinate grids (including MGRS/UTM) on top of a map.

## Features

Every feature ships as a matched pair: a **render** component that just displays data, and (where interactivity is needed) an **editor** component that captures user input and hands you back structured data.

- **`GoogleMapsProvider` / `GoogleMap`** — loads the Maps JS API and renders the base map.
- **`GridLayer` / `MgrsLayer`** — coordinate grid overlays, including MGRS/UTM precision grids.
- **`MarkerLayer` / `MarkerEditor`** — display markers; create, drag, and delete them interactively.
- **`PolygonLayer` / `PolygonEditor`** — display polygons; draw and edit their shape and metadata.
- **`MapRestriction` / `MapRestrictionEditor`** — constrain the map to an area; draw or adjust that area interactively.
- **`EditorProvider`** — shares editor tool/activation state across any layout you compose yourself; `MapControl` places React content as a native Google Maps control (e.g. an editor's toolbar button rendered inside the map).

## Installation

```bash
yarn add google-map-grids
# or
npm install google-map-grids
```

`react` and `react-dom` (^18) are peer dependencies — install them in your app if you haven't already.

You'll also need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with the Maps JavaScript API enabled.

## Quick start

```tsx
import { GoogleMapsProvider, GoogleMap, MarkerLayer } from 'google-map-grids';

function App() {
  return (
    <GoogleMapsProvider apiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap center={{ lat: -23.5505, lng: -46.6333 }} zoom={12} mapId="YOUR_MAP_ID">
        <MarkerLayer
          items={[{ id: '1', position: { lat: -23.5505, lng: -46.6333 }, title: 'São Paulo' }]}
        />
      </GoogleMap>
    </GoogleMapsProvider>
  );
}
```

## Documentation

Every component has a live Storybook doc — including a Playground with interactive Controls for every prop. Clone this repo and run:

```bash
yarn dev
```

to browse them locally at `http://localhost:3000`.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for how to set up the project locally and the checklist for opening a pull request.

## License

[MIT](./LICENSE) © Fernando Franco
