import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Performance optimizations for better Core Web Vitals
  build: {
    // Enable minification
    minify: 'terser',
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react'],
          
          // App chunks
          'medication-components': [
            './src/components/medication/MedicationSearch.jsx',
            './src/components/medication/MedicationList.jsx'
          ],
          'interaction-components': [
            './src/components/interactions/InteractionResults.jsx',
            './src/components/interactions/InteractionCard.jsx'
          ],
          'services': [
            './src/services/hybridInteractionService.js',
            './src/services/knownInteractions.js',
            './src/services/openFDAInteractionService.js'
          ]
        }
      }
    },
    
    // Optimize bundle size
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false, // Disable in production for smaller builds
    
    // Compress assets
    assetsInlineLimit: 4096 // Inline small assets
  },
  
  // Server configuration for development
  server: {
    // Enable compression
    compress: true,
    
    // CORS for API calls
    cors: true,
    
    // Performance headers
    headers: {
      'Cache-Control': 'public, max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'lucide-react',
      'react-helmet-async'
    ]
  },
  
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})