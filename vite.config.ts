import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env': {}
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
    // Testing configuration (merged from vitest.config.ts)
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
      coverage: {
        reporter: ['text', 'html'],
        exclude: ['node_modules/', 'src/tests/setup.ts'],
      },
    },
  };
});
