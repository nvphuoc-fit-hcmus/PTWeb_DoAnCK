import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // HTTPS configuration (uncomment when SSL certs are ready)
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem')),
    // },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
