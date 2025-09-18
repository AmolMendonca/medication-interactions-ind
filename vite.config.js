import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Simple build configuration for reliable deployment
  build: {
    // Use esbuild for faster builds (default)
    minify: 'esbuild',
    
    // Basic optimization
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    
    // Compress assets
    assetsInlineLimit: 4096
  },
  
  // Server configuration for development
  server: {
    cors: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'lucide-react'
    ]
  }
})