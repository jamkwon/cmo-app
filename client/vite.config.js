import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3457, // Back to original port
    host: '0.0.0.0', // Enable external access from other devices on network
    strictPort: true
  },
  preview: {
    port: 3457,
    host: '0.0.0.0'
  }
})
