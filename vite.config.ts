// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Nos permite probar la PWA en desarrollo
      },
      manifest: {
        name: 'Libreta de Obra',
        short_name: 'Libreta',
        description: 'Control de gastos para contratistas',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone', // Esto hace que se vea a pantalla completa sin el navegador
        icons: [
          {
            src: 'pwa-192x192.png', // Íconos que crearemos enseguida
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})