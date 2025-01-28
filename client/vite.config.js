import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

const dirname = new URL('/', import.meta.url).pathname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'), 
    },
  },
})
