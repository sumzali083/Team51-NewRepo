import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
<<<<<<< HEAD
=======
    proxy: {
      "/uploads": "http://localhost:21051",
    },
>>>>>>> deploy-branch
  },
})
