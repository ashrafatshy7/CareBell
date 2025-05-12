import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
   
  },
})
