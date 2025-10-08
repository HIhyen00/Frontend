import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    server: {
        proxy: {
            // Account API routes
            '/api/auth': {
                target: 'http://localhost:8005',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            // Pet-Walk API routes
            '/api/kakao-maps': {
                target: 'http://localhost:8002',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path
            },
            // My-Pet API routes
            '/api/pets': { target: 'http://localhost:8003', changeOrigin: true, secure: false },
            '/api/missions': { target: 'http://localhost:8003', changeOrigin: true, secure: false },
            '/api/users': { target: 'http://localhost:8003', changeOrigin: true, secure: false },
            '/api/health-reports': { target: 'http://localhost:8003', changeOrigin: true, secure: false },

            // Default fallback for any other /api routes
            '/api': {
                target: 'http://localhost:8002',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
