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
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        '@supabase/supabase-js',
        'react-hook-form',
        'zod',
        'clsx',
        'class-variance-authority',
        'date-fns',
        'lucide-react',
      ],
      // Force optimization of problematic dependencies
      force: mode === 'development',
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      // Optimize bundle size and code splitting
      rollupOptions: {
        output: {
          // Create separate chunks for large dependencies
          manualChunks: {
            // React ecosystem
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI library
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
            // State management and data fetching
            'state-vendor': ['@tanstack/react-query'],
            // Supabase and auth
            'auth-vendor': ['@supabase/supabase-js'],
            // Form handling
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            // Date and utility libraries
            'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority'],
            // Animation libraries
            'animation-vendor': ['framer-motion', 'lucide-react'],
            // Charts and visualization
            'chart-vendor': ['recharts'],
          },
          // Optimize chunk size
          chunkFileNames: () => {
            return `js/[name]-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'images';
            } else if (/woff2?|eot|ttf|otf/i.test(extType)) {
              extType = 'fonts';
            }
            return `${extType}/[name]-[hash][extname]`;
          },
        },
        // No external dependencies needed for this build
      },
      // Further optimize the build
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      // Split large chunks
      chunkSizeWarningLimit: 500,
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
