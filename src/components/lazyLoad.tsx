/**
 * Lazy loading utility for large components
 * This file provides helpers for lazy loading components to improve initial load time
 */
import React, { Suspense, ComponentType, lazy, useState, useEffect } from 'react'

// Default loading component
export function LoadingFallback() {
  return (
    <div className="w-full h-32 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

// Skeleton loader for cards
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-14 w-14 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
      <div className="mb-3">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for metrics grids
export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700"
        >
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
          <div className="mt-3">
            <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton loader for tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800">
        {[...Array(rows)].map((_, i) => (
          <div 
            key={i}
            className="px-4 py-3 flex items-center border-b border-gray-200 dark:border-slate-700 last:border-0"
          >
            <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Lazy load a component with a custom loading component
 * 
 * @param factory Function that imports the component
 * @param LoadingComponent Optional custom loading component
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  LoadingComponent: React.ComponentType = LoadingFallback
) {
  const LazyComponent = lazy(factory);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy load a component with the card skeleton loading state
 * 
 * @param factory Function that imports the component
 * @returns Lazy loaded component with card skeleton
 */
export function lazyLoadCard<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazyLoad(factory, CardSkeleton);
}

/**
 * Lazy load a component with the metrics grid skeleton loading state
 * 
 * @param factory Function that imports the component
 * @returns Lazy loaded component with metrics grid skeleton
 */
export function lazyLoadMetricsGrid<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazyLoad(factory, MetricsGridSkeleton);
}

/**
 * Lazy load a component with the table skeleton loading state
 * 
 * @param factory Function that imports the component
 * @param rows Number of skeleton rows to display
 * @returns Lazy loaded component with table skeleton
 */
export function lazyLoadTable<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  rows = 5
) {
  return lazyLoad(factory, () => <TableSkeleton rows={rows} />);
}

// Replace any with proper types
export function withLazyLoadedImage<T>(
  Component: React.ComponentType<T & { imageUrl?: string }>,
  defaultImage: string
): React.FC<T & { imageUrl?: string }> {
  return function LazyImageComponent(props) {
    const [loaded, setLoaded] = useState(false);
    const imageUrl = props.imageUrl || defaultImage;
    
    // Add proper image loading implementation
    const handleImageLoad = () => {
      setLoaded(true);
    };

    return (
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
            <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin" />
          </div>
        )}
        <Component 
          {...props as T} 
          imageUrl={imageUrl}
          onLoad={handleImageLoad}
        />
      </div>
    );
  };
}

// Replace any with proper types
export function withLazyLoadedData<T, D>(
  Component: React.ComponentType<T & { data?: D }>,
  fetchDataFn: () => Promise<D>
): React.FC<T> {
  return function LazyDataComponent(props) {
    const [data, setData] = useState<D | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
      let isMounted = true;
      
      const loadData = async () => {
        setLoading(true);
        try {
          const result = await fetchDataFn();
          if (isMounted) {
            setData(result);
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error('Failed to load data'));
            setLoading(false);
          }
        }
      };
      
      loadData();
      
      return () => {
        isMounted = false;
      };
    }, []);
    
    if (loading) {
      return <LoadingFallback />;
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }
    
    return <Component {...props as T} data={data as D} />;
  };
}

// Replace any with proper types
export function withLazyLoadedContent<T>(
  Component: React.ComponentType<T & { content?: React.ReactNode }>,
  loadingDelay = 1000
): React.FC<T & { content?: React.ReactNode }> {
  return function LazyContentComponent(props) {
    const [visible, setVisible] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(true);
      }, loadingDelay);
      
      return () => {
        clearTimeout(timer);
      };
    }, [loadingDelay]);
    
    if (!visible) {
      return <LoadingFallback />;
    }
    
    return <Component {...props} />;
  };
}

// Replace any with proper types
export function withLazyLoadedProps<T, P extends object>(
  Component: React.ComponentType<T & P>,
  loadProps: () => Promise<P>
): React.FC<T> {
  return function LazyPropsComponent(props) {
    const [loadedProps, setLoadedProps] = useState<P | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
      let isMounted = true;
      
      const fetchProps = async () => {
        setLoading(true);
        try {
          const result = await loadProps();
          if (isMounted) {
            setLoadedProps(result);
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error('Failed to load props'));
            setLoading(false);
          }
        }
      };
      
      fetchProps();
      
      return () => {
        isMounted = false;
      };
    }, []);
    
    if (loading) {
      return <LoadingFallback />;
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error loading component properties</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }
    
    return loadedProps ? <Component {...props as T} {...loadedProps} /> : null;
  };
} 