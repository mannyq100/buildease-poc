# Phase 3: Routing Enhancements Implementation Plan

This document outlines specific changes needed to implement Next.js-like routing features in the BuildEase React 19 application using React Router 7.

## 3.1 Route Configuration Enhancements

### Create Route Definitions File:

```typescript
// src/routes/routes.tsx
import { Suspense, lazy } from 'react'
import { Outlet, useRouteError } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
)

// Lazy-loaded page components
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'))
const CreateProject = lazy(() => import('@/pages/CreateProject'))
const PhaseDetails = lazy(() => import('@/pages/PhaseDetails'))
const GeneratedPlan = lazy(() => import('@/pages/GeneratedPlan'))
const TaskPlanningSetup = lazy(() => import('@/pages/TaskPlanningSetup'))
const Schedule = lazy(() => import('@/pages/Schedule'))
const Team = lazy(() => import('@/pages/Team'))
const Materials = lazy(() => import('@/pages/Materials'))
const Expenses = lazy(() => import('@/pages/Expenses'))
const Documents = lazy(() => import('@/pages/Documents'))
const Messaging = lazy(() => import('@/pages/Messaging'))
const Settings = lazy(() => import('@/pages/Settings'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))

// Page-level error boundary
function PageErrorBoundary() {
  const error = useRouteError() as Error
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-2 text-gray-600">{error?.message || 'An unexpected error occurred'}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

// Wrap a component with Suspense and error boundary
const withSuspense = (Component: React.ComponentType<any>) => (
  props: any
) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
)

// Route definitions
export const routes = [
  {
    path: '/',
    element: withSuspense(LandingPage),
    errorElement: <PageErrorBoundary />
  },
  {
    path: '/unauthorized',
    element: withSuspense(Unauthorized),
    errorElement: <PageErrorBoundary />
  },
  {
    path: '/auth/callback',
    element: withSuspense(AuthCallback),
    errorElement: <PageErrorBoundary />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <PageErrorBoundary />,
    children: [
      {
        path: 'dashboard',
        element: withSuspense(Dashboard)
      },
      {
        path: 'projects',
        element: withSuspense(Projects)
      },
      {
        path: 'create-project',
        element: withSuspense(CreateProject)
      },
      {
        path: 'project/:id',
        element: withSuspense(ProjectDetails)
      },
      {
        path: 'phase/:id',
        element: withSuspense(PhaseDetails)
      },
      {
        path: 'generated-plan',
        element: withSuspense(GeneratedPlan)
      },
      {
        path: 'generate-tasks',
        element: withSuspense(TaskPlanningSetup)
      },
      {
        path: 'schedule',
        element: withSuspense(Schedule)
      },
      {
        path: 'team',
        element: withSuspense(Team)
      },
      {
        path: 'materials',
        element: withSuspense(Materials)
      },
      {
        path: 'expenses',
        element: withSuspense(Expenses)
      },
      {
        path: 'documents',
        element: withSuspense(Documents)
      },
      {
        path: 'messaging',
        element: withSuspense(Messaging)
      },
      {
        path: 'settings',
        element: withSuspense(Settings)
      },
      {
        path: 'settings/admin',
        element: (
          <ProtectedRoute requiredRoles={['owner', 'manager']}>
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: withSuspense(NotFound)
      }
    ]
  }
]
```

### Update App.tsx to Use Route Config:

```tsx
// src/App.tsx (updated for React Router 7)
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes/routes'
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HelmetProvider } from 'react-helmet-async'
import { TooltipProvider } from './components/ui/tooltip'
import { ToastContextProvider } from './components/ui/toast-context'
import { Toaster } from './components/ui/toaster'
import { Toaster as Sonner } from './components/ui/sonner'
import { LazyMotion, domAnimation } from 'framer-motion'
import { isProduction } from './lib/env-config'
import config from './lib/env-config'

// Create router using route definitions
const router = createBrowserRouter(routes)

function App() {
  return (
    <SupabaseAuthProvider>
      <LazyMotion features={domAnimation}>
        <ThemeProvider>
          <HelmetProvider>
            <TooltipProvider>
              <ToastContextProvider>
                <Toaster />
                <Sonner />
                {/* Display environment indicator in non-production environments */}
                {!isProduction() && (
                  <div className="fixed top-0 right-0 z-50 px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-bl-md">
                    {config.appTitle}
                  </div>
                )}
                
                <RouterProvider router={router} />
              </ToastContextProvider>
            </TooltipProvider>
          </HelmetProvider>
        </ThemeProvider>
      </LazyMotion>
    </SupabaseAuthProvider>
  )
}

export default App
```

## 3.2 File-Based Routing Utility

### Create a File-Based Route Generator:

```typescript
// vite-plugins/file-routes.ts
import { Plugin } from 'vite'
import { resolve, join, parse } from 'path'
import { readdir } from 'fs/promises'

/**
 * Vite plugin to generate routes based on the file system
 */
export function fileRoutes(): Plugin {
  return {
    name: 'vite-plugin-file-routes',
    async buildStart() {
      try {
        const routesFile = await generateRoutes()
        // Write routes file
        this.emitFile({
          type: 'asset',
          fileName: 'src/routes/__generated-routes.tsx',
          source: routesFile
        })
      } catch (error) {
        console.error('Error generating routes:', error)
      }
    }
  }
}

async function generateRoutes() {
  // Implementation details for scanning pages directory
  // and generating route configurations would go here
  
  // This is a simplified example - a real implementation would
  // recursively scan the pages directory and generate routes
  // based on file names and directory structure
  
  const pagesDir = resolve(process.cwd(), 'src/pages')
  const pages = await scanDirectory(pagesDir)
  
  // Generate routes based on page files
  const routes = pages.map(page => {
    const { name, dir } = parse(page)
    const relativeDir = dir.replace(pagesDir, '')
    
    // Convert file path to route path
    let routePath = join(relativeDir, name === 'index' ? '' : name)
    routePath = routePath.replaceAll('\\', '/')
    
    // Handle dynamic segments ([param])
    routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1')
    
    return `
  {
    path: '${routePath}',
    element: withSuspense(lazy(() => import('${page.replace(/\\/g, '/')}'))),
    errorElement: <ErrorBoundary />
  },`
  }).join('')
  
  return `
// GENERATED FILE - DO NOT EDIT
// This file is automatically generated by the file-routes plugin

import { lazy } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { withSuspense } from '../utils/withSuspense'

export const generatedRoutes = [${routes}
]
`
}

async function scanDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  
  const files = []
  for (const entry of entries) {
    const res = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await scanDirectory(res)))
    } else if (
      entry.isFile() && 
      (res.endsWith('.tsx') || res.endsWith('.jsx')) && 
      !entry.name.startsWith('_')
    ) {
      files.push(res)
    }
  }
  
  return files
}
```

## 3.3 Route Data Prefetching

### Create a Route Data Loading Utility:

```typescript
// src/lib/routeLoaders.ts
import { QueryClient } from '@tanstack/react-query'
import { defer, LoaderFunctionArgs } from 'react-router-dom'

/**
 * Create a loader function for routes that prefetches data
 * 
 * @param queryClient React Query client instance
 * @param loaderFn Function that performs data loading
 */
export function createLoader(
  queryClient: QueryClient,
  loaderFn: (args: LoaderFunctionArgs) => Promise<any>
) {
  return async (args: LoaderFunctionArgs) => {
    // For immediate data, load it now
    const result = await loaderFn(args)
    
    // Return the data using defer for progressive loading
    return defer({
      data: result
    })
  }
}

/**
 * Create a route data prefetcher that works with React Query
 * 
 * @param queryClient React Query client
 * @param queryKey The key for the query
 * @param queryFn The function to fetch the data
 */
export function createQueryLoader<TData>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: (args: LoaderFunctionArgs) => Promise<TData>
) {
  return async (args: LoaderFunctionArgs) => {
    // Prefetch and cache the data with React Query
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => queryFn(args),
    })
    
    // Return the cached data directly
    return queryClient.getQueryData<TData>(queryKey)
  }
}
```

### Example Route with Data Loading:

```typescript
// src/pages/ProjectDetails.tsx
import { useLoaderData, useParams } from 'react-router-dom'
import { useGetProjectById } from '@/hooks/query/useProjects'
import { queryClient } from '@/lib/reactQuery'
import { projectKeys } from '@/hooks/query/useProjects'

// Route loader function
export const projectLoader = async ({ params }) => {
  if (!params.id) return null
  
  return queryClient.fetchQuery({
    queryKey: projectKeys.detail(params.id),
    queryFn: () => projectService.getProjectById(params.id),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

export default function ProjectDetails() {
  const params = useParams()
  const initialData = useLoaderData() as Awaited<ReturnType<typeof projectLoader>>
  
  // Use the query hook with initialData
  const { data: project, isLoading, error } = useGetProjectById(params.id, {
    initialData,
    enabled: !!params.id
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!project) return <div>Project not found</div>
  
  return (
    <div>
      <h1>{project.name}</h1>
      {/* Rest of the project details */}
    </div>
  )
}
```

### Update Route Configuration to Use Loaders:

```typescript
// Add loader to route definition in routes.tsx
{
  path: 'project/:id',
  element: withSuspense(ProjectDetails),
  loader: projectLoader
}
```

## 3.4 Add Route Transitions

### Create a Route Transition Component:

```tsx
// src/components/RouteTransition.tsx
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'

interface RouteTransitionProps {
  children: ReactNode
}

const variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('enter')
  
  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('exit')
      
      // Wait for exit animation to complete
      const timeout = setTimeout(() => {
        setDisplayLocation(location)
        setTransitionStage('initial')
        
        // Start enter animation
        const enterTimeout = setTimeout(() => {
          setTransitionStage('enter')
        }, 10) // Short delay for the browser to catch up
        
        return () => clearTimeout(enterTimeout)
      }, 200) // Match exit animation duration
      
      return () => clearTimeout(timeout)
    }
  }, [location, displayLocation])
  
  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate={transitionStage}
      variants={variants}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}
```

### Add Route Transition to Layout Component:

```tsx
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { RouteTransition } from '../RouteTransition'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  )
}
```

## 3.5 Add Optimized Code Splitting

### Create a Dynamic Import Component with Preloading:

```typescript
// src/lib/dynamicImport.ts
import { ComponentType, lazy, LazyExoticComponent } from 'react'

interface DynamicImportOptions {
  preload?: boolean
  ssr?: boolean
}

type ImportFunction<T extends ComponentType<any>> = () => Promise<{ default: T }>

/**
 * Enhanced dynamic import with preloading support
 */
export function dynamicImport<T extends ComponentType<any>>(
  importFn: ImportFunction<T>,
  options: DynamicImportOptions = {}
): LazyExoticComponent<T> & { preload: () => void } {
  const { preload = false } = options
  
  // Create the lazy-loaded component
  const LazyComponent = lazy(importFn)
  
  // Add preload method
  const EnhancedComponent = LazyComponent as LazyExoticComponent<T> & { preload: () => void }
  
  // Add preload function
  EnhancedComponent.preload = () => {
    // Start loading the component
    importFn()
  }
  
  // If preload is true, start loading immediately
  if (preload) {
    EnhancedComponent.preload()
  }
  
  return EnhancedComponent
}

/**
 * Preload multiple components at once
 */
export function preloadComponents(components: Array<{ preload: () => void }>) {
  components.forEach(component => component.preload())
}
```

### Update Route Definitions with Enhanced Imports:

```typescript
// src/routes/routes.tsx (partial)
import { dynamicImport, preloadComponents } from '@/lib/dynamicImport'

// Enhanced lazy-loaded components with preload support
const Dashboard = dynamicImport(() => import('@/pages/Dashboard'), { preload: true })
const Projects = dynamicImport(() => import('@/pages/Projects'))
const ProjectDetails = dynamicImport(() => import('@/pages/ProjectDetails'))
// Other components...

// Preload route handler for navigation
export function preloadRoute(path: string) {
  switch (path) {
    case '/dashboard':
      return Dashboard.preload()
    case '/projects':
      return Projects.preload()
    case '/project':
      return ProjectDetails.preload()
    // Add cases for other routes
  }
}

// Preload next likely routes (e.g., call from dashboard for common next pages)
export function preloadDashboardNextRoutes() {
  preloadComponents([
    Projects,
    ProjectDetails,
    Team
  ])
}
```

## 3.6 Add CSS Chunking Optimization

### Configure Vite for CSS Chunking:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { apiRoutes } from './vite-plugins/api-routes'
import { fileRoutes } from './vite-plugins/file-routes'

export default defineConfig({
  plugins: [
    react(),
    apiRoutes(),
    fileRoutes()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for different parts of the app
          if (id.includes('node_modules')) {
            // Group third-party dependencies logically
            if (id.includes('@radix-ui')) {
              return 'vendor-radix-ui'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-react-query'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion'
            }
            return 'vendor'
          }
          
          // Group app code by major feature areas
          if (id.includes('/pages/')) {
            const page = id.split('/pages/')[1]?.split('/')[0] || '';
            return `page-${page}`;
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
        }
      }
    },
    cssCodeSplit: true, // Enable CSS code splitting
    cssMinify: true, // Minify CSS
    sourcemap: true, // Generate sourcemaps for better debugging
    chunkSizeWarningLimit: 1000 // Increase the warning limit
  }
})
```

## 3.7 Update Route Handling in AppLayout

### Implement Route-Based Title and Metadata:

```tsx
// src/components/layout/PageMetadata.tsx
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'BuildEase - Construction Management Platform',
    description: 'Manage construction projects with ease using BuildEase'
  },
  '/dashboard': {
    title: 'Dashboard - BuildEase',
    description: 'Your project dashboard and overview'
  },
  '/projects': {
    title: 'Projects - BuildEase',
    description: 'Manage your construction projects'
  },
  // Add metadata for other routes
}

const defaultMetadata = {
  title: 'BuildEase Construction Management',
  description: 'Simple and effective construction project management'
}

export function PageMetadata() {
  const location = useLocation()
  const path = location.pathname
  
  // Find the most specific matching route
  const metadata = routeMetadata[path] || defaultMetadata
  
  // For dynamic routes like /project/:id, handle specially
  if (path.startsWith('/project/')) {
    metadata.title = 'Project Details - BuildEase'
    metadata.description = 'View and manage project details'
  }
  
  return (
    <Helmet>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content="website" />
      {/* Add other metadata tags as needed */}
    </Helmet>
  )
}
```

### Add to AppLayout Component:

```tsx
// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { RouteTransition } from '../RouteTransition'
import { PageMetadata } from './PageMetadata'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <PageMetadata />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  )
}
```

These implementations provide a solid foundation for Next.js-like routing features in your React 19 application, including code splitting, route transitions, metadata handling, and optimized bundling.
