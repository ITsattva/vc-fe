import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend runs at http://localhost:8080 with endpoints at the root
// (no /api prefix). We proxy under an /api prefix and strip it before
// forwarding, so backend paths don't collide with the SPA's own routes
// (/tasks, /projects, /users). Avoids CORS (the backend has no CORS config).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
