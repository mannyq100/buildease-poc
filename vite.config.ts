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
          manualChunks: (id) => {
            // Node modules chunking
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // UI library - split Radix components more granularly
              if (id.includes('@radix-ui')) {
                return 'ui-vendor';
              }
              // State management and data fetching
              if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
                return 'state-vendor';
              }
              // Supabase and auth
              if (id.includes('@supabase') || id.includes('auth')) {
                return 'auth-vendor';
              }
              // Form handling
              if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
                return 'form-vendor';
              }
              // Date and utility libraries
              if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
                return 'utils-vendor';
              }
              // Animation libraries - split framer-motion separately due to size
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'icons-vendor';
              }
              // Charts and visualization - large library
              if (id.includes('recharts') || id.includes('d3')) {
                return 'chart-vendor';
              }
              // Map libraries - very large
              if (id.includes('leaflet') || id.includes('mapbox') || id.includes('google-maps')) {
                return 'maps-vendor';
              }
            }
            
            // Application code chunking for large components
            // Split large plan components
            if (id.includes('src/components/plan/') && 
                (id.includes('GeneratedPlan') || id.includes('LocationPlotForm'))) {
              return 'plan-heavy';
            }
            // Split ProjectDetails into smaller chunks
            if (id.includes('src/pages/ProjectDetails/') && 
                (id.includes('ProjectDocumentsSection') || id.includes('ProjectDetails.tsx'))) {
              return 'project-details';
            }
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
        // Enable aggressive tree shaking
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
        },
        // No external dependencies needed for this build
      },
      // Further optimize the build
      target: 'es2020', // Better compatibility while still modern
      minify: 'esbuild',
      cssMinify: true,
      // Split large chunks more aggressively
      chunkSizeWarningLimit: 300,
      // Optimize build performance
      reportCompressedSize: false, // Faster builds
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
