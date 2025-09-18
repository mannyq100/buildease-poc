/**
 * Viewport Width Hook
 * Detects viewport width for responsive image loading and layout adjustments
 * Optimized for BuildEase construction site mobile usage
 */

import { useState, useEffect, useMemo } from 'react';

export interface ViewportBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface UseViewportWidthResult {
  /** Current viewport width in pixels */
  width: number;
  /** Current breakpoint name */
  breakpoint: keyof ViewportBreakpoints;
  /** Whether viewport is mobile-sized */
  isMobile: boolean;
  /** Whether viewport is tablet-sized */
  isTablet: boolean;
  /** Whether viewport is desktop-sized */
  isDesktop: boolean;
  /** Whether viewport is in portrait orientation */
  isPortrait: boolean;
  /** Device pixel ratio */
  devicePixelRatio: number;
}

// Default Tailwind CSS breakpoints
const DEFAULT_BREAKPOINTS: ViewportBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

/**
 * Get current breakpoint based on width
 */
function getBreakpoint(width: number, breakpoints: ViewportBreakpoints): keyof ViewportBreakpoints {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Hook to track viewport width and responsive breakpoints
 */
export function useViewportWidth(customBreakpoints?: Partial<ViewportBreakpoints>): UseViewportWidthResult {
  const breakpoints = useMemo(() => ({ ...DEFAULT_BREAKPOINTS, ...customBreakpoints }), [customBreakpoints]);
  
  const [state, setState] = useState<UseViewportWidthResult>(() => {
    // Initialize with sensible defaults for SSR
    const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const initialDPR = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    
    return {
      width: initialWidth,
      breakpoint: getBreakpoint(initialWidth, breakpoints),
      isMobile: initialWidth < breakpoints.md,
      isTablet: initialWidth >= breakpoints.md && initialWidth < breakpoints.lg,
      isDesktop: initialWidth >= breakpoints.lg,
      isPortrait: initialHeight > initialWidth,
      devicePixelRatio: initialDPR
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let timeoutId: NodeJS.Timeout;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      setState(prevState => {
        const newState = {
          width,
          breakpoint: getBreakpoint(width, breakpoints),
          isMobile: width < breakpoints.md,
          isTablet: width >= breakpoints.md && width < breakpoints.lg,
          isDesktop: width >= breakpoints.lg,
          isPortrait: height > width,
          devicePixelRatio
        };
        
        // Only update if values actually changed to prevent unnecessary re-renders
        if (
          prevState.width === newState.width &&
          prevState.breakpoint === newState.breakpoint &&
          prevState.isPortrait === newState.isPortrait &&
          prevState.devicePixelRatio === newState.devicePixelRatio
        ) {
          return prevState;
        }
        
        return newState;
      });
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewport, 100); // Debounce to avoid excessive updates
    };

    const orientationChangeHandler = () => {
      // Delay to ensure viewport has updated after orientation change
      setTimeout(updateViewport, 200);
    };

    // Listen for resize events
    window.addEventListener('resize', debouncedUpdate);
    
    // Listen for orientation changes (mobile)
    window.addEventListener('orientationchange', orientationChangeHandler);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', orientationChangeHandler);
    };
  }, [breakpoints]);

  return state;
}

/**
 * Hook to determine optimal image size based on viewport
 */
export function useResponsiveImageSize(options: {
  /** Base width for calculations */
  baseWidth?: number;
  /** Quality levels for different breakpoints */
  qualityMap?: Partial<Record<keyof ViewportBreakpoints, number>>;
  /** Size multipliers for different breakpoints */
  sizeMap?: Partial<Record<keyof ViewportBreakpoints, number>>;
} = {}) {
  const { 
    baseWidth = 400,
    qualityMap = {
      xs: 60,
      sm: 70,
      md: 80,
      lg: 85,
      xl: 90,
      '2xl': 95
    },
    sizeMap = {
      xs: 0.5,
      sm: 0.7,
      md: 0.8,
      lg: 1.0,
      xl: 1.2,
      '2xl': 1.5
    }
  } = options;

  const { breakpoint, devicePixelRatio, isMobile } = useViewportWidth();

  const quality = qualityMap[breakpoint] || 80;
  const sizeMultiplier = sizeMap[breakpoint] || 1;
  const width = Math.round(baseWidth * sizeMultiplier * (isMobile ? 1 : devicePixelRatio));

  return {
    width,
    quality,
    breakpoint,
    isMobile,
    devicePixelRatio,
    // Helper for generating URL parameters
    getImageParams: () => ({
      w: width,
      q: quality,
      f: 'webp' // Prefer WebP format
    }),
    // Helper for generating optimized URL
    getOptimizedUrl: (baseUrl: string) => {
      const params = new URLSearchParams({
        w: width.toString(),
        q: quality.toString(),
        f: 'webp'
      });
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}${params.toString()}`;
    }
  };
}

/**
 * Hook to detect network quality for adaptive loading
 */
export function useNetworkQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
  const [networkQuality, setNetworkQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    // Check if Network Information API is available
    const connection = (navigator as any).connection;
    
    const updateNetworkQuality = () => {
      if (!navigator.onLine) {
        setNetworkQuality('offline');
        return;
      }

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;

        if (effectiveType === '4g' && downlink > 10) {
          setNetworkQuality('excellent');
        } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 2)) {
          setNetworkQuality('good');
        } else {
          setNetworkQuality('poor');
        }
      } else {
        // Fallback if Network Information API is not available
        setNetworkQuality('good');
      }
    };

    updateNetworkQuality();

    // Listen for connection changes
    window.addEventListener('online', updateNetworkQuality);
    window.addEventListener('offline', updateNetworkQuality);
    
    if (connection) {
      connection.addEventListener('change', updateNetworkQuality);
    }

    return () => {
      window.removeEventListener('online', updateNetworkQuality);
      window.removeEventListener('offline', updateNetworkQuality);
      if (connection) {
        connection.removeEventListener('change', updateNetworkQuality);
      }
    };
  }, []);

  return networkQuality;
}

export default useViewportWidth;