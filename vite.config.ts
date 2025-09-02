import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

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
      // Bundle analyzer for production builds
      mode === 'production' && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      }),
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
        'react-error-boundary',
        'framer-motion',
        'react-helmet-async',
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
          // Aggressive manual chunking to meet performance budget
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'ui-vendor': ['lucide-react', 'framer-motion'],
            'form-vendor': ['react-hook-form', 'zod'],
            'utils-vendor': ['clsx', 'class-variance-authority', 'date-fns'],
          },
          chunkFileNames: 'js/[name]-[hash].js',
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
        // Enable aggressive tree shaking
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
        },
        external: (_id) => {
          // Don't externalize anything for this build
          return false;
        }
      },
      // Further optimize the build
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: true,
      // More aggressive chunk size limits for construction sites
      chunkSizeWarningLimit: 200, // Stricter limit
      // Optimize build performance
      reportCompressedSize: false,
      
      // Performance optimizations for construction site networks
      assetsInlineLimit: 2048, // Smaller inline limit to reduce initial bundle
      cssCodeSplit: true,
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
