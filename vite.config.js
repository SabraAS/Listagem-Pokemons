import path from 'path';

import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import ViteRestart from 'vite-plugin-restart';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    sourcemap: true,
    // Configuração para cache eficiente
    assetsDir: '_assets',
    // Adiciona hash aos nomes dos arquivos para cache busting quando o conteúdo muda
    rollupOptions: {
      output: {
        // Adiciona hash ao nome dos arquivos para permitir cache de longa duração
        entryFileNames: '_assets/[name]-[hash].js',
        chunkFileNames: '_assets/[name]-[hash].js',
        assetFileNames: '_assets/[name]-[hash].[ext]',
        manualChunks: {
          // Separar dependências grandes em chunks separados
          react: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          utils: ['axios', 'zustand'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    devSourcemap: true,
  },
  // Otimização de cache para recursos estáticos
  optimizeDeps: {
    // Pré-empacota dependências para melhor desempenho de desenvolvimento
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'axios',
      'zustand',
    ],
  },
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy'],
        },
      },
    }),
    ViteRestart({ restart: ['yalc.lock'] }),
    // Bundle analyzer - só ativa quando ANALYZE=true
    process.env.ANALYZE &&
      analyzer({
        analyzerMode: 'server',
        analyzerPort: 8888,
        openAnalyzer: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Configuração para otimização de assets
  assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: true,
    deps: {
      inline: ['react-dom'],
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/build/**',
      ],
      include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      clean: true,
      skipFull: false,
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'dist/**/*',
        'node_modules/**/*',
        'coverage/**/*',
        '*.config.js',
        '*.config.cjs',
        '*.config.mjs',
        '.eslintrc.*',
        '.prettierrc.*',
        '.stylelintrc.*',
        'jsconfig.json',
        'package.json',
        'yarn.lock',
        'package-lock.json',
        '.config/**/*',
        '.husky/**/*',
        '.git/**/*',
        'src/test/**/*',
        'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        'public/**/*',
        'docs/**/*',
        'index.html',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 30000,
  },
});
