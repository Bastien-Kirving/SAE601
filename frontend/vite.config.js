import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
    plugins: [react()],

    // ---- Serveur de développement ----
    // Le proxy redirige /api et /uploads vers le backend PHP local.
    // En production (build), ce bloc est ignoré.
    server: command === 'serve' ? {
        port: 3000,
        proxy: {
            // Fichiers uploadés : /api/uploads/... → localhost:8080/uploads/...
            // (les fichiers sont dans backend/public/uploads/, sans préfixe /api)
            '/api/uploads': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            '/uploads': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    } : {},

    // ---- Build de production ----
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
}))
