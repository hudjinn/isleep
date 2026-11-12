import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'inline',
    manifest: {
      name: 'iSleep — Diário Inteligente do Sono', short_name: 'iSleep', lang: 'pt-BR',
      description: 'Diário Inteligente do Sono', theme_color: '#08111f', background_color: '#08111f',
      id: './', display: 'standalone', scope: './', start_url: './',
      icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: 'index.html',
      globPatterns: ['**/*.{js,css,html,svg,woff2}'],
    }
  })],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' }
})
