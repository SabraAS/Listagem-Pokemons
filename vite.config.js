import path from 'path';

import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';
import ViteRestart from 'vite-plugin-restart';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: 'build/',
    sourcemap: true,
    rollupOptions: {
      output: {
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
        api: 'modern-compiler', // or "modern"
      },
    },
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
      // Configurações para resolver o erro de source mapping
      skipFull: false,
      // Incluir apenas arquivos que queremos cobrir
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'build/**/*',
        'node_modules/**/*',
        'coverage/**/*',
        'dist/**/*',
        // Configuration files
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
        // Configuration directories
        '.config/**/*',
        '.husky/**/*',
        '.git/**/*',
        // Test configuration files
        'src/test/**/*',
        'src/test/performance/**',
        // Test files themselves
        'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        // Other common excludes
        'public/**/*',
        'docs/**/*',
        'index.html',
        // Exclude main.jsx and other entry points that might not be tested
        'src/main.jsx',
      ],
      // Configurações específicas para resolver o bug do V8
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 30000, // Timeout maior para testes de performance
  },
});
