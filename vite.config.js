import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    // Opcional: só ative se as telas forem MUITO antigas (Chromium < 80).
    // Gera um bundle ES5 extra para navegadores antigos.
    // legacy({ targets: ['chrome >= 49', 'safari >= 10'] })
  ],
  base: './', // importante para servir via file:// ou servidor simples
  server: { host: true, port: 5173 }
});