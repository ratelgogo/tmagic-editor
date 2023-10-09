import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias:
      process.env.NODE_ENV === 'production'
        ? [{ find: /^@editor/, replacement: path.join(__dirname, './src') }]
        : [
            { find: /^@editor/, replacement: path.join(__dirname, './src') },
            { find: /^@tmagic\/schema/, replacement: path.join(__dirname, '../schema/src/index.ts') },
            { find: /^@tmagic\/utils/, replacement: path.join(__dirname, '../utils/src/index.ts') },
            { find: /^@tmagic\/core/, replacement: path.join(__dirname, '../core/src/index.ts') },
            { find: /^@tmagic\/form/, replacement: path.join(__dirname, '../form/src/index.ts') },
            { find: /^@tmagic\/stage/, replacement: path.join(__dirname, '../stage/src/index.ts') },
          ],
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
