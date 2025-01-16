import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ],
  server: {
    https: {
      key: fs.readFileSync('./certs/localhost.key'), // Path to your private key
      cert: fs.readFileSync('./certs/localhost.crt'), // Path to your certificate
    },
    port: 5173,
  },
 
})
