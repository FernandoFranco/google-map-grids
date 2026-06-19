import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), dts({ include: ['src'], exclude: ['src/main.tsx', 'src/**/*.test.tsx'] })],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name: 'GoogleMapGrids',
      fileName: 'google-map-grids',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})
