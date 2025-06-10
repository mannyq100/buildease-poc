/**
 * Supabase client configuration
 * Central point for Supabase service access
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'construction_mgr',
  },
  auth: {
    // Auth operations should use the default schema (public/auth)
    // Don't override this as it interferes with auth.users table operations
  },
  global: {
    headers: {
      'X-Client-Info': 'buildease-construction-mgr'
    }
  }
})
