import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend runs at http://localhost:8080 with endpoints at the root
// (no /api prefix). We proxy the resource paths so the frontend can use
// relative URLs and avoid CORS (the backend has no CORS config).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tasks': 'http://localhost:8080',
      '/projects': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
    },
  },
})
