# Phase 2: React Query Implementation Plan

This document outlines specific changes needed to implement Next.js-like data fetching patterns using React Query with Supabase in the BuildEase application.

## 2.1 React Query Configuration Enhancements

### Files to Create:

```typescript
// src/lib/reactQuery.ts
import { QueryClient } from '@tanstack/react-query'
import { type PersistedClient, persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import superjson from 'superjson'

// Create client with default configuration optimized for React 19
export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        // React 19 optimizations
        suspense: true,
      },
      mutations: {
        // React 19 optimizations
        throwOnError: true,
      },
    },
  })

  // Add persistence for offline support
  if (typeof window !== 'undefined') {
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
      serialize: superjson.stringify,
      deserialize: superjson.parse,
      prefix: 'buildease-cache',
    })

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // Only persist queries that are explicitly marked as persistent
          return query.meta?.persist === true
        },
      },
    })
  }

  return queryClient
}

// Helper to add metadata to queries for persistence
export const persistedQueryOptions = (options: any) => ({
  ...options,
  meta: {
    ...options.meta,
    persist: true,
  },
})
```

### Dependencies to Install:

```bash
npm install @tanstack/react-query@latest @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister superjson
```

### Modify main.tsx to use the Enhanced Query Client:

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createQueryClient } from './lib/reactQuery'
import App from './App.tsx'
import './index.css'
import { logEnvironmentInfo } from './lib/env-config'

// Log environment information on app startup
logEnvironmentInfo()

// Set document title based on environment
document.title = import.meta.env.VITE_APP_TITLE || 'BuildEase'

// Create React Query client
const queryClient = createQueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {import.meta.env.DEV && <ReactQueryDevtools />}
  </QueryClientProvider>
)
```

### Modify App.tsx to Remove Redundant QueryClientProvider:

```tsx
// src/App.tsx (partial)
function App() {
  return (
    <SupabaseAuthProvider>
      <LazyMotion features={domAnimation}>
        <ThemeProvider>
          <HelmetProvider>
            <TooltipProvider>
              <ToastContextProvider>
                {/* Rest of app content */}
              </ToastContextProvider>
            </TooltipProvider>
          </HelmetProvider>
        </ThemeProvider>
      </LazyMotion>
    </SupabaseAuthProvider>
  );
}
```

## 2.2 Query Hooks for Supabase Data Fetching

### Create Query Hook Factory:

```typescript
// src/hooks/query/createQueryHooks.ts
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { persistedQueryOptions } from '@/lib/reactQuery'

// Type for query options with persistence control
type PersistableQueryOptions<TData, TError> = UseQueryOptions<TData, TError> & {
  shouldPersist?: boolean;
};

/**
 * Create reusable query hooks for a specific resource type
 *
 * @param resource The resource name (used as query key prefix)
 * @param serviceModule The service module with CRUD methods
 */
export function createQueryHooks<T extends { id: string }, TError = Error>(
  resource: string,
  serviceModule: {
    getAll?: () => Promise<T[]>;
    getById?: (id: string) => Promise<T | null>;
    create?: (data: Omit<T, 'id'>) => Promise<T>;
    update?: (id: string, data: Partial<T>) => Promise<T | null>;
    delete?: (id: string) => Promise<boolean>;
    [key: string]: any;
  }
) {
  // Resource-specific query keys
  const keys = {
    all: [resource] as const,
    lists: () => [...keys.all, 'list'] as const,
    list: (filters: any) => [...keys.lists(), { filters }] as const,
    details: () => [...keys.all, 'detail'] as const,
    detail: (id: string) => [...keys.details(), id] as const,
  };

  // Get all resources with optional filters
  function useGetAll(options?: PersistableQueryOptions<T[], TError>) {
    const queryOptions = options?.shouldPersist ? persistedQueryOptions(options) : options;
    
    return useQuery<T[], TError>({
      queryKey: keys.lists(),
      queryFn: () => serviceModule.getAll!(),
      ...queryOptions,
    });
  }

  // Get a single resource by ID
  function useGetById(id: string, options?: PersistableQueryOptions<T | null, TError>) {
    const queryOptions = options?.shouldPersist ? persistedQueryOptions(options) : options;
    
    return useQuery<T | null, TError>({
      queryKey: keys.detail(id),
      queryFn: () => serviceModule.getById!(id),
      enabled: !!id,
      ...queryOptions,
    });
  }

  // Create a new resource
  function useCreate(options?: UseMutationOptions<T, TError, Omit<T, 'id'>, unknown>) {
    const queryClient = useQueryClient();
    
    return useMutation<T, TError, Omit<T, 'id'>>(
      (data) => serviceModule.create!(data),
      {
        // When mutate is called, invalidate all queries for this resource
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: keys.lists() });
          queryClient.setQueryData(keys.detail(data.id), data);
        },
        ...options,
      }
    );
  }

  // Update a resource
  function useUpdate(options?: UseMutationOptions<T | null, TError, { id: string; data: Partial<T> }, unknown>) {
    const queryClient = useQueryClient();
    
    return useMutation<T | null, TError, { id: string; data: Partial<T> }>(
      ({ id, data }) => serviceModule.update!(id, data),
      {
        // When mutate is called, update all affected queries
        onSuccess: (data, variables) => {
          if (data) {
            queryClient.invalidateQueries({ queryKey: keys.lists() });
            queryClient.setQueryData(keys.detail(variables.id), data);
          }
        },
        ...options,
      }
    );
  }

  // Delete a resource
  function useDelete(options?: UseMutationOptions<boolean, TError, string, unknown>) {
    const queryClient = useQueryClient();
    
    return useMutation<boolean, TError, string>(
      (id) => serviceModule.delete!(id),
      {
        // When mutate is called, update all affected queries
        onSuccess: (success, id) => {
          if (success) {
            queryClient.invalidateQueries({ queryKey: keys.lists() });
            queryClient.removeQueries({ queryKey: keys.detail(id) });
          }
        },
        ...options,
      }
    );
  }

  // Return all hooks and the query keys
  return {
    keys,
    useGetAll,
    useGetById,
    useCreate,
    useUpdate,
    useDelete,
  };
}
```

## 2.3 Example Resource Query Hooks Implementation

### Create Project Query Hooks:

```typescript
// src/hooks/query/useProjects.ts
import { createQueryHooks } from './createQueryHooks'
import * as projectService from '@/services/projectService'
import type { Project } from '@/types/project'

// Create project-specific hooks using the factory
export const {
  keys: projectKeys,
  useGetAll: useGetProjects,
  useGetById: useGetProjectById,
  useCreate: useCreateProject,
  useUpdate: useUpdateProject,
  useDelete: useDeleteProject,
} = createQueryHooks<Project>('projects', projectService)

// Optional: Add resource-specific custom hooks
export function useProjectsByStatus(status: string) {
  return useGetProjects({
    select: (projects) => projects.filter(p => p.status === status),
    shouldPersist: true,
  })
}
```

## 2.4 Next.js-like Data Prefetching

### Create a Prefetching Utility:

```typescript
// src/lib/prefetch.ts
import { QueryClient } from '@tanstack/react-query'

/**
 * Prefetch data for a route, similar to Next.js getServerSideProps
 * 
 * @param queryClient The React Query client instance
 * @param prefetchFn Function that contains prefetching logic
 * @returns A promise that resolves when prefetching is complete
 */
export async function prefetchRouteData(
  queryClient: QueryClient,
  prefetchFn: (queryClient: QueryClient) => Promise<void>
) {
  try {
    return await prefetchFn(queryClient)
  } catch (error) {
    console.error('Error prefetching route data:', error)
    throw error
  }
}

/**
 * Create a component wrapper for route-level data prefetching
 * 
 * @param Component The component to wrap
 * @param prefetchFn The prefetch function containing data loading logic
 * @returns A component with prefetched data
 */
export function withPrefetchedData(
  Component: React.ComponentType<any>,
  prefetchFn: (queryClient: QueryClient) => Promise<void>
) {
  // This would be improved with suspense in Phase 3
  const WithPrefetchedData = (props: any) => {
    const queryClient = useQueryClient()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
      let isMounted = true

      const loadData = async () => {
        try {
          await prefetchRouteData(queryClient, prefetchFn)
          if (isMounted) setIsLoading(false)
        } catch (e) {
          if (isMounted) {
            setError(e as Error)
            setIsLoading(false)
          }
        }
      }

      loadData()

      return () => {
        isMounted = false
      }
    }, [])

    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (error) {
      return <div className="text-red-500">Error loading data: {error.message}</div>
    }

    return <Component {...props} />
  }

  return WithPrefetchedData
}
```

## 2.5 Refactor Dashboard Page with React Query

### Refactor Dashboard Hook:

```typescript
// src/hooks/query/useDashboardData.ts
import { useQuery } from '@tanstack/react-query'
import {
  getProjectProgressData,
  getBudgetData,
  getMaterialUsageData,
  getTaskStatusData,
  getQuickStats,
  getQuickActions,
  getRecentActivity,
  getUpcomingDeadlines
} from '@/services/dashboardService'
import type { DeadlineItem, ActivityItem, PieChartItem, QuickStatCard, QuickAction } from '@/types/dashboard'
import { persistedQueryOptions } from '@/lib/reactQuery'

// Query keys for dashboard data
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  progress: () => [...dashboardKeys.all, 'progress'] as const,
  budget: () => [...dashboardKeys.all, 'budget'] as const,
  materials: () => [...dashboardKeys.all, 'materials'] as const,
  tasks: () => [...dashboardKeys.all, 'tasks'] as const,
  actions: () => [...dashboardKeys.all, 'actions'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  deadlines: () => [...dashboardKeys.all, 'deadlines'] as const
}

// Individual query hooks for dashboard components
export function useProjectProgress() {
  return useQuery({
    queryKey: dashboardKeys.progress(),
    queryFn: getProjectProgressData,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useBudgetData() {
  return useQuery({
    queryKey: dashboardKeys.budget(),
    queryFn: getBudgetData,
    staleTime: 15 * 60 * 1000 // 15 minutes
  })
}

export function useMaterialUsage() {
  return useQuery({
    queryKey: dashboardKeys.materials(),
    queryFn: getMaterialUsageData,
    staleTime: 15 * 60 * 1000 // 15 minutes
  })
}

export function useTaskStatus() {
  return useQuery({
    queryKey: dashboardKeys.tasks(),
    queryFn: getTaskStatusData,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useQuickStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getQuickStats,
    ...persistedQueryOptions({
      staleTime: 5 * 60 * 1000 // 5 minutes
    })
  })
}

export function useQuickActions() {
  return useQuery({
    queryKey: dashboardKeys.actions(),
    queryFn: getQuickActions,
    staleTime: 60 * 60 * 1000 // 1 hour
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: getRecentActivity,
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

export function useUpcomingDeadlines() {
  return useQuery({
    queryKey: dashboardKeys.deadlines(),
    queryFn: getUpcomingDeadlines,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Composite hook for convenience
export function useDashboardData() {
  const progress = useProjectProgress()
  const budget = useBudgetData()
  const materials = useMaterialUsage()
  const tasks = useTaskStatus()
  const stats = useQuickStats()
  const actions = useQuickActions()
  const activity = useRecentActivity()
  const deadlines = useUpcomingDeadlines()
  
  const isLoading = [
    progress, budget, materials, tasks,
    stats, actions, activity, deadlines
  ].some(query => query.isLoading)
  
  const isError = [
    progress, budget, materials, tasks,
    stats, actions, activity, deadlines
  ].some(query => query.isError)
  
  const refetchAll = () => {
    progress.refetch()
    budget.refetch()
    materials.refetch()
    tasks.refetch()
    stats.refetch()
    actions.refetch()
    activity.refetch()
    deadlines.refetch()
  }
  
  return {
    // Individual queries for granular control
    queries: {
      progress,
      budget,
      materials,
      tasks,
      stats,
      actions,
      activity,
      deadlines
    },
    // Consolidated data
    data: {
      projectProgressData: progress.data || [],
      budgetData: budget.data || [],
      materialUsageData: materials.data || [],
      taskStatusData: tasks.data || [],
      quickStats: stats.data || [],
      quickActions: actions.data || [],
      activityItems: activity.data || [],
      upcomingDeadlines: deadlines.data || []
    },
    // Status
    isLoading,
    isError,
    // Actions
    refetchAll,
    lastUpdated: new Date()
  }
}
```

## 2.6 Add API Route Pattern (Similar to Next.js API Routes)

### Create API Route Handler Factory:

```typescript
// src/api/createApiHandler.ts
import { supabase } from '@/lib/supabase'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

type ApiHandler<TRequest = any, TResponse = any> = (
  req: {
    params: Record<string, string>
    query: URLSearchParams
    body: TRequest
    headers: Headers
    auth: {
      userId: string | null
      isAuthenticated: boolean
    }
  },
  res: {
    status: (code: number) => {
      json: (data: TResponse) => Promise<Response>
      error: (message: string) => Promise<Response>
    }
  }
) => Promise<Response | void>

type ApiHandlers = {
  [key in Method]?: ApiHandler
}

/**
 * Create an API route handler similar to Next.js API routes
 */
export function createApiHandler(handlers: ApiHandlers) {
  return async (request: Request): Promise<Response> => {
    const method = request.method as Method
    const handler = handlers[method]
    
    if (!handler) {
      return new Response(
        JSON.stringify({ error: `Method ${method} not allowed` }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    try {
      // Parse URL and body
      const url = new URL(request.url)
      const pathSegments = url.pathname.split('/')
        .filter(Boolean)
        .slice(2) // Remove /api/{route} prefix
      
      // Create params object from path segments (every other segment is a param name/value)
      const params: Record<string, string> = {}
      for (let i = 0; i < pathSegments.length; i += 2) {
        if (i + 1 < pathSegments.length) {
          params[pathSegments[i]] = pathSegments[i + 1]
        }
      }
      
      // Parse body if present
      let body = {}
      if (method !== 'GET' && request.headers.get('content-type')?.includes('application/json')) {
        body = await request.json()
      }
      
      // Get authentication state from session
      const session = await supabase.auth.getSession()
      const userId = session.data.session?.user?.id || null
      
      // Create request and response objects
      const req = {
        params,
        query: url.searchParams,
        body,
        headers: request.headers,
        auth: {
          userId,
          isAuthenticated: !!userId
        }
      }
      
      const res = {
        status: (code: number) => ({
          json: async (data: any) => new Response(
            JSON.stringify(data),
            { status: code, headers: { 'Content-Type': 'application/json' } }
          ),
          error: async (message: string) => new Response(
            JSON.stringify({ error: message }),
            { status: code, headers: { 'Content-Type': 'application/json' } }
          )
        })
      }
      
      // Call the handler
      const response = await handler(req, res)
      return response || new Response(
        JSON.stringify({ error: 'Handler did not return a response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('API error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
```

### Example API Route Implementation:

```typescript
// src/api/projects.ts
import { createApiHandler } from './createApiHandler'
import { supabase } from '@/lib/supabase'

export default createApiHandler({
  GET: async (req, res) => {
    if (!req.auth.isAuthenticated) {
      return res.status(401).error('Unauthorized')
    }
    
    try {
      if (req.params.id) {
        // Get single project
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', req.params.id)
          .single()
          
        if (error) throw error
        return res.status(200).json(data)
      } else {
        // Get all projects
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          
        if (error) throw error
        return res.status(200).json(data)
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      return res.status(500).error(error.message)
    }
  },
  
  POST: async (req, res) => {
    if (!req.auth.isAuthenticated) {
      return res.status(401).error('Unauthorized')
    }
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...req.body, owner_id: req.auth.userId }])
        .select()
        .single()
        
      if (error) throw error
      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creating project:', error)
      return res.status(500).error(error.message)
    }
  },
  
  // Add PUT and DELETE handlers similarly
})
```

## 2.7 Set Up API Route Registration in Vite

### Create Vite Plugin for API Routes:

```typescript
// vite-plugins/api-routes.ts
import { Plugin } from 'vite'
import { resolve } from 'path'
import { readdir } from 'fs/promises'

/**
 * Vite plugin to create Next.js-like API routes
 */
export function apiRoutes(): Plugin {
  return {
    name: 'vite-plugin-api-routes',
    configureServer(server) {
      // Set up middleware to handle API routes
      server.middlewares.use(async (req, res, next) => {
        const url = req.url
        
        // Only process /api routes
        if (!url || !url.startsWith('/api/')) {
          return next()
        }
        
        try {
          // Extract the route path from the URL
          const routePath = url.split('/')[2] // e.g., /api/projects -> projects
          
          if (!routePath) {
            throw new Error('Invalid API route')
          }
          
          // Import the API route handler
          const apiDir = resolve(process.cwd(), 'src/api')
          const files = await readdir(apiDir)
          
          // Find matching route file (e.g., projects.ts for /api/projects)
          const routeFile = files.find(file => {
            const name = file.split('.')[0]
            return name === routePath
          })
          
          if (!routeFile) {
            throw new Error(`API route not found: ${routePath}`)
          }
          
          // Dynamically import the route handler
          const handler = await import(resolve(apiDir, routeFile))
          
          // Create a fetch Request object from the incoming request
          const serverUrl = `${req.protocol}://${req.headers.host}`
          const request = new Request(`${serverUrl}${url}`, {
            method: req.method,
            headers: new Headers(req.headers as any),
            body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
          })
          
          // Execute the handler
          const response = await handler.default(request)
          
          // Send the response back to the client
          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            res.setHeader(key, value)
          })
          
          const body = await response.text()
          res.end(body)
        } catch (error) {
          console.error('API route error:', error)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      })
    }
  }
}
```

### Update vite.config.ts to Use the API Routes Plugin:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { apiRoutes } from './vite-plugins/api-routes'

export default defineConfig({
  plugins: [
    react(),
    apiRoutes()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

These changes provide a solid foundation for implementing Next.js-like data fetching patterns in the BuildEase application using React Query and Supabase.
