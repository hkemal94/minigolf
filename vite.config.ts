import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Yayındaki deneme bağlantısı https://hkemal94.github.io/minigolf/ altında açılır;
// derlemede yollar bu alt klasöre göre yazılır. Bilgisayarda denerken kök klasör.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/minigolf/' : '/',
  plugins: [react()],
  // 3B kütüphanesi (Three.js) tek başına büyük; uyarı eşiği ona göre.
  build: { chunkSizeWarningLimit: 1500 },
}));
