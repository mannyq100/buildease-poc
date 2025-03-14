import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log(`Building for ${mode} environment`);

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy API requests during development
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Add references to env variables
      __APP_ENV__: JSON.stringify(mode),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      'import.meta.env.VITE_FACEBOOK_APP_ID': JSON.stringify(env.VITE_FACEBOOK_APP_ID),
      'import.meta.env.VITE_APPLE_CLIENT_ID': JSON.stringify(env.VITE_APPLE_CLIENT_ID),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_USE_MOCK': JSON.stringify(env.VITE_USE_MOCK || 'true'),
      'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || mode),
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'BuildEase'),
      'import.meta.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL),
      'import.meta.env.VITE_ANALYTICS_ID': JSON.stringify(env.VITE_ANALYTICS_ID),
    },
    build: {
      sourcemap: mode !== 'production',
      // Configure different output directories based on the environment
      outDir: `dist/${mode}`,
      // Optimize chunk sizes
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react', 
              'react-dom', 
              'react-router-dom',
              'framer-motion'
            ],
            ui: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              // ... more UI dependencies
            ]
          }
        }
      }
    }
  };
});
