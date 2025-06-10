# Phase 1: Supabase Integration Implementation Plan

This document outlines specific changes needed to integrate Supabase for authentication, storage, and database functionality in the BuildEase application.

## 1.1 Supabase Client Setup

### Files to Create:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Environment Variables to Add:

Add these to `.env.local` and similar environment files:

```
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Package Dependencies to Install:

```bash
npm install @supabase/supabase-js
```

## 1.2 Authentication Migration (Auth0 to Supabase)

### Files to Create:

```typescript
// src/contexts/SupabaseAuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/user'

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'github' | 'facebook') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)

      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  async function signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'client'
          }
        }
      })
      
      if (error) throw error
      
      // Create profile record after signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              name: userData.name || '',
              role: userData.role || 'client',
              status: 'ACTIVE',
              created_at: new Date().toISOString()
            }
          ])
        
        if (profileError) throw profileError
      }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  async function signInWithProvider(provider: 'google' | 'github' | 'facebook') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      throw error
    }
  }

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithProvider
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}
```

### Files to Modify - ProtectedRoute component:

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import type { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { user, isLoading, profile } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Check for role requirements
  if (requiredRoles.length > 0 && profile) {
    const hasRequiredRole = requiredRoles.includes(profile.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
```

## 1.3 Database Schema for Supabase

### Example schema SQL for Supabase:

```sql
-- Create basic tables for BuildEase app

-- Profile table with extended user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'owner', 'manager', 'contractor', 'worker', 'client')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')),
  phone TEXT,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNING',
  type TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget NUMERIC(12,2),
  address JSONB,
  owner_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Add other necessary tables based on existing data models
```

## 1.4 Storage Implementation with Supabase

### Files to Create:

```typescript
// src/lib/storage.ts
import { supabase } from '@/lib/supabase'

/**
 * Upload a file to Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @param file The file to upload
 * @returns The file URL if successful
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Download a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @returns The downloaded file blob
 */
export async function downloadFile(bucket: string, path: string): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

/**
 * List files in a bucket/folder
 * @param bucket The storage bucket name
 * @param path The path to list (optional)
 * @returns Array of file objects
 */
export async function listFiles(bucket: string, path?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '')

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}
```

## 1.5 Modify API Service Implementation

### Example service conversion (src/services/projectService.ts):

```typescript
import { Project } from '@/types/project'
import { PlanPhase } from '@/types/projectInputs'
import { supabase } from '@/lib/supabase'
import { createService } from './serviceFactory'
import * as mockProjectService from '@/data/mock/services/projectService'

// Real API implementation with Supabase
const realProjectService = {
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Project[]
  },

  getProjectById: async (id: string): Promise<Project | null> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw error
      }
      
      return data as Project
    } catch (error: any) {
      if (error.code === 'PGRST116') return null
      throw error
    }
  },

  // Implement other methods with Supabase queries
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()
    
    if (error) throw error
    return data as Project
  },

  // Continue implementing other methods...
}

// Export the appropriate implementation based on configuration
export const {
  getProjects,
  getProjectById,
  getProjectSamplePlan,
  getProjectStatuses,
  getProjectTypes,
  createProject,
  updateProject,
  deleteProject
} = createService<typeof realProjectService>(
  'projects',
  mockProjectService,
  realProjectService
)
```

## 1.6 Update Main App to Use Supabase

### Modify App.tsx to replace Auth0Provider:

```tsx
// src/App.tsx (partial)
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';

function App() {
  return (
    <SupabaseAuthProvider>
      <LazyMotion features={domAnimation}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <HelmetProvider>
              <TooltipProvider>
                <ToastContextProvider>
                  <Toaster />
                  <Sonner />
                  {/* Rest of the App content */}
                </ToastContextProvider>
              </TooltipProvider>
            </HelmetProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </LazyMotion>
    </SupabaseAuthProvider>
  );
}
```

## 1.7 Add Supabase Auth Callback Route

### Add route in App.tsx:

```tsx
// Inside the Routes component in App.tsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/unauthorized" element={<Unauthorized />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  
  {/* Protected routes... */}
</Routes>
```
