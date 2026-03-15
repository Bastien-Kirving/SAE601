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
