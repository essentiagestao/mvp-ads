import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src',
  plugins: [react()],
  build: {
    outDir: '../dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: '../vitest.setup.ts'
  }
});
