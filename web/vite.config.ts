import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cmms/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-map': ['maplibre-gl'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      // Fix date-fns v3 bundling issue with MUI x-date-pickers
      'date-fns/_lib/format/longFormatters': 'date-fns',
    },
  },
  optimizeDeps: {
    include: ['date-fns'],
  },
})
