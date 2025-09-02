import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logEnvironmentInfo } from './lib/env-config'
import { initializeBundleOptimization } from './lib/bundleOptimization'

// Log environment information on app startup
logEnvironmentInfo()

// Set document title based on environment
document.title = import.meta.env.VITE_APP_TITLE || 'BuildEase'

// Initialize bundle optimization for construction sites
const bundleOptimization = initializeBundleOptimization()

// Register service worker for offline functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('[Main] Service Worker registered successfully:', registration.scope)
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, show update notification
              console.log('[Main] New service worker available')
              // You could show a user notification here
            }
          })
        }
      })
      
      // Preload critical chunks in service worker if on good connection
      const networkQuality = bundleOptimization.monitor.getMetrics().networkQuality
      if (networkQuality === 'excellent' || networkQuality === 'good') {
        registration.active?.postMessage({
          type: 'PRELOAD_CRITICAL_CHUNKS',
          payload: {
            urls: [
              '/js/react-vendor-*.js',
              '/js/ui-vendor-*.js'
            ]
          }
        })
      }
      
    } catch (error) {
      console.error('[Main] Service Worker registration failed:', error)
    }
  })
}

// Handle performance monitoring cleanup on page unload
window.addEventListener('beforeunload', () => {
  bundleOptimization.cleanup?.()
})

createRoot(document.getElementById("root")!).render(<App />)
