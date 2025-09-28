/**
 * Supabase client configuration with secure storage
 * Central point for Supabase service access with optimized performance
 */
import { createClient } from '@supabase/supabase-js'
import { storageAdapter } from '../utils/auth/StorageAdapter'
import { logger } from '../utils/core/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  logger.error(`Missing Supabase environment variables: ${missingVars.join(', ')}`)
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please configure these in your deployment environment.`)
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  logger.error('Invalid Supabase URL format:', supabaseUrl)
  throw new Error('VITE_SUPABASE_URL must be a valid URL')
}

// Storage implementation for optimal performance
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return await storageAdapter.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    return await storageAdapter.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    return await storageAdapter.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'construction_mgr',
  },
  auth: {
    // Use our secure storage adapter
    storage: secureStorage,
    storageKey: 'buildease_supabase_auth',
    // Enhanced security settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Construction-specific timeouts
    flowType: 'pkce', // More secure for public clients
  },
  global: {
    headers: {
      'X-Client-Info': 'buildease-construction-mgr',
      'X-Security-Version': '2.0'
    }
  }
})
