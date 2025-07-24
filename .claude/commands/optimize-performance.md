# Optimize BuildEase Construction Performance

Performance optimization guide for the BuildEase construction management platform with construction site-specific optimizations.

## Usage
```bash
# Example usage for different performance optimization scenarios:
# Optimize project dashboard for slow construction site connections
optimize-performance --component=ProjectDashboard --context=construction-site --priority=initial-load

# Optimize materials inventory for offline usage
optimize-performance --component=MaterialsInventory --context=offline --priority=data-sync

# Optimize team roster for battery efficiency
optimize-performance --component=TeamRoster --context=all-day-usage --priority=battery-life

# Optimize safety forms for quick submission
optimize-performance --component=SafetyChecklistForm --context=time-critical --priority=submission-speed
```

## Arguments
- `--component`: Component name to optimize (e.g., ProjectDashboard, MaterialsInventory)
- `--context`: Usage context (construction-site|offline|all-day-usage|time-critical|poor-connectivity)
- `--priority`: Optimization priority (initial-load|data-sync|battery-life|submission-speed|memory-usage)
- `--target-metrics`: Performance targets (e.g., "<3s initial load", "<100ms interactions")
- `--offline-support`: Include offline performance optimizations (default: true)

## Output Files
- Optimized component with performance improvements
- Bundle analysis report
- Performance metrics documentation
- Offline caching strategy (if applicable)

## Instructions

You are optimizing performance for the BuildEase construction management platform. Focus on mobile performance for construction professionals working on-site with challenging connectivity conditions.

### Performance Priorities

1. **Mobile-First Optimization** - Construction workers use mobile devices
2. **Offline Capability** - Sites may have poor connectivity  
3. **Fast Initial Load** - Critical for user retention
4. **Smooth Interactions** - Professional feel maintains trust
5. **Battery Efficiency** - Important for all-day field use

### React Performance Optimization

#### 1. Component Optimization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ExpensiveComponent = memo(function ExpensiveComponent({ 
  data, 
  onUpdate 
}: ComponentProps) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item)
    }));
  }, [data]);

  // Memoize callbacks to prevent child re-renders
  const handleUpdate = useCallback((id: string, changes: any) => {
    onUpdate(id, changes);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <ChildComponent 
          key={item.id}
          data={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});

// Only re-render when specific props change
function arePropsEqual(prevProps: ComponentProps, nextProps: ComponentProps) {
  return (
    prevProps.data.length === nextProps.data.length &&
    prevProps.onUpdate === nextProps.onUpdate
  );
}

export const OptimizedComponent = memo(Component, arePropsEqual);
```

#### 2. Virtual Scrolling for Large Lists
```typescript
import { FixedSizeList as List } from 'react-window';

// For large material lists, project lists, etc.
function VirtualizedMaterialList({ materials }: { materials: Material[] }) {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <MaterialCard material={materials[index]} />
    </div>
  );

  return (
    <List
      height={600}           // Viewport height
      itemCount={materials.length}
      itemSize={120}         // Height of each item
      itemData={materials}
      className="scrollbar-thin" // Custom scrollbar styling
    >
      {Row}
    </List>
  );
}
```

#### 3. Lazy Loading Components
```typescript
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'));
const GeneratedPlan = lazy(() => import('@/pages/GeneratedPlan'));
const MaterialsTable = lazy(() => import('@/components/materials/MaterialsTable'));

// With proper loading states
function App() {
  return (
    <Suspense fallback={<ProjectDetailsSkeleton />}>
      <ProjectDetails />
    </Suspense>
  );
}

// Create loading skeletons that match actual content
function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
```

### React Query Optimization

#### 1. Smart Caching Strategy
```typescript
// Optimize query configurations
export const useProjectDetails = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: !!projectId,
    
    // Performance optimizations
    staleTime: 5 * 60 * 1000,      // 5 minutes - data stays fresh
    cacheTime: 10 * 60 * 1000,     // 10 minutes - cache retention
    retry: 3,                       // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Mobile optimizations
    refetchOnWindowFocus: false,    // Don't refetch when switching apps
    refetchOnReconnect: true,       // Do refetch when connection restored
    networkMode: 'offlineFirst',    // Work offline when possible
  });
};

// Prefetch critical data
export function usePrefetchProjectData(projectId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Prefetch related data
    queryClient.prefetchQuery({
      queryKey: ['phases', projectId],
      queryFn: () => phaseService.getPhasesByProject(projectId),
      staleTime: 5 * 60 * 1000,
    });
    
    queryClient.prefetchQuery({
      queryKey: ['materials', projectId],
      queryFn: () => materialService.getMaterialsByProject(projectId),
      staleTime: 5 * 60 * 1000,
    });
  }, [projectId, queryClient]);
}
```

#### 2. Background Updates
```typescript
// Keep data fresh without blocking UI
export const useProjectsWithBackground = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
    staleTime: 1 * 60 * 1000,      // 1 minute
    refetchInterval: 5 * 60 * 1000, // Background refresh every 5 minutes
    refetchIntervalInBackground: true, // Continue when app backgrounded
  });
};

// Optimistic updates for better perceived performance
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectService.updateProject(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['project', id]);
      
      // Snapshot previous value
      const previousProject = queryClient.getQueryData(['project', id]);
      
      // Optimistically update
      queryClient.setQueryData(['project', id], (old: any) => ({
        ...old,
        ...data,
        updated_at: new Date().toISOString(),
      }));
      
      return { previousProject };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', variables.id], context.previousProject);
      }
    },
    
    // Always refetch after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['project', variables.id]);
    },
  });
};
```

### Image Optimization

#### 1. Responsive Images
```typescript
// Optimized image component
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({ src, alt, className, sizes }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc: string) => {
    return [
      `${baseSrc}?w=640&q=75 640w`,
      `${baseSrc}?w=1024&q=75 1024w`, 
      `${baseSrc}?w=1280&q=75 1280w`,
    ].join(', ');
  };

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={`${src}?w=1024&q=75`}
        srcSet={generateSrcSet(src)}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
```

#### 2. Image Lazy Loading with Intersection Observer
```typescript
import { useRef, useEffect, useState } from 'react';

export function useLazyLoading() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}

// Usage in component
function LazyImageCard({ src, alt }: { src: string; alt: string }) {
  const { ref, isIntersecting } = useLazyLoading();

  return (
    <div ref={ref} className="h-48 bg-gray-100">
      {isIntersecting ? (
        <OptimizedImage src={src} alt={alt} className="h-full" />
      ) : (
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400">Loading...</span>
        </div>
      )}
    </div>
  );
}
```

### Bundle Optimization

#### 1. Code Splitting
```typescript
// Route-based splitting
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'));

export const router = createBrowserRouter([
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/projects',
    element: <Projects />,
  },
  // Feature-based splitting
  {
    path: '/projects/:id',
    element: <ProjectDetails />,
    lazy: () => import('@/pages/ProjectDetails/loader'),
  },
]);

// Library splitting in vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks
          'auth-feature': ['./src/pages/Login', './src/pages/Signup'],
          'project-feature': ['./src/pages/Projects', './src/pages/ProjectDetails'],
        },
      },
    },
  },
});
```

#### 2. Tree Shaking Optimization
```typescript
// Import only what you need
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
// Instead of: import { format, parseISO } from 'date-fns';

// Use barrel exports efficiently
// src/utils/index.ts
export { formatCurrency } from './finance';
export { formatDate } from './date';
// Instead of re-exporting everything: export * from './finance';

// Optimize Lodash imports
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
// Instead of: import { debounce, throttle } from 'lodash';
```

### Mobile Performance

#### 1. Touch Optimization
```css
/* Optimize touch interactions */
.touch-optimized {
  /* Disable text selection on buttons */
  -webkit-user-select: none;
  user-select: none;
  
  /* Optimize touch response */
  touch-action: manipulation;
  
  /* Reduce tap delay */
  -webkit-tap-highlight-color: transparent;
}

/* Smooth scrolling */
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

#### 2. Battery Optimization
```typescript
// Reduce animation when battery is low
export function useBatteryOptimization() {
  const [lowBattery, setLowBattery] = useState(false);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryInfo = () => {
          setLowBattery(battery.level < 0.2); // Less than 20%
        };
        
        battery.addEventListener('levelchange', updateBatteryInfo);
        updateBatteryInfo();
      });
    }
  }, []);

  return { lowBattery };
}

// Conditional animations
function AnimatedComponent() {
  const { lowBattery } = useBatteryOptimization();
  
  return (
    <div className={`transition-transform ${
      lowBattery ? '' : 'hover:scale-105 duration-200'
    }`}>
      {/* Content */}
    </div>
  );
}
```

### Network Optimization

#### 1. Offline Support
```typescript
// Service worker for offline functionality
// public/sw.js
const CACHE_NAME = 'buildease-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

#### 2. Connection Monitoring
```typescript
export function useConnectionStatus() {
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
  });

  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectionStatus({
        isOnline: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
      });
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateConnectionStatus);
    }

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  return connectionStatus;
}

// Adaptive loading based on connection
function AdaptiveComponent() {
  const { isOnline, effectiveType } = useConnectionStatus();
  const isSlowConnection = effectiveType === '2g' || effectiveType === 'slow-2g';

  if (!isOnline) {
    return <OfflineIndicator />;
  }

  if (isSlowConnection) {
    return <LightweightVersion />;
  }

  return <FullFeaturedVersion />;
}
```

### Performance Monitoring

#### 1. Web Vitals Tracking
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log('Performance metric:', metric);
}

// Track Core Web Vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### 2. Performance Budget Monitoring
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Warn if chunks are too large
        chunkSizeWarningLimit: 500, // KB
      },
    },
  },
  
  // Bundle analyzer
  plugins: [
    process.env.ANALYZE && bundleAnalyzer({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
    }),
  ].filter(Boolean),
});
```

### Quick Performance Wins

#### Checklist
- [ ] Enable gzip/brotli compression
- [ ] Use CDN for static assets  
- [ ] Optimize images (WebP format, proper sizing)
- [ ] Implement lazy loading for images and components
- [ ] Use React.memo for expensive components
- [ ] Optimize bundle splitting
- [ ] Add service worker for offline support
- [ ] Monitor Core Web Vitals
- [ ] Test on actual mobile devices
- [ ] Optimize database queries (indexes, limit results)

### Remember
- Mobile users often have slower connections
- Construction sites may have poor network coverage
- Battery life is important for all-day use
- Test on real devices, not just desktop simulators
- Monitor performance metrics in production
- Optimize for the slowest expected connection speeds