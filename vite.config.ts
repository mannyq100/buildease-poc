import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode = 'production' }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  // Check if running on Vercel
  const isVercel = process.env.VERCEL === '1';
  
  // Log environment info
  console.log(`Building for ${mode} environment${isVercel ? ' on Vercel' : ''}`);

  return {
    base: '/',
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
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
      'import.meta.env.VITE_FACEBOOK_APP_ID': JSON.stringify(env.VITE_FACEBOOK_APP_ID || ''),
      'import.meta.env.VITE_APPLE_CLIENT_ID': JSON.stringify(env.VITE_APPLE_CLIENT_ID || ''),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
      'import.meta.env.VITE_USE_MOCK': JSON.stringify(env.VITE_USE_MOCK || 'true'),
      'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || mode),
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'BuildEase'),
      'import.meta.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL || ''),
      'import.meta.env.VITE_ANALYTICS_ID': JSON.stringify(env.VITE_ANALYTICS_ID || ''),
      // Add Vercel environment variables
      'import.meta.env.VERCEL': JSON.stringify(process.env.VERCEL || ''),
      'import.meta.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV || ''),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        }
      }
    }
  };
});
