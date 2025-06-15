/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_AUTH_ENCODING_KEY: string
  readonly VITE_AUTH_CACHE_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}