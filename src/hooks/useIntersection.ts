/**
 * Intersection Observer hook for performance-optimized infinite scroll
 * Optimized for construction sites with variable network conditions
 */

import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Hook for intersection observer with performance optimizations
 */
export function useIntersection(
  elementRef: RefObject<Element>,
  options: UseIntersectionOptions = {}
): boolean {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    ...restOptions
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    
    // Early return if no element or already visible and frozen
    if (!element || (freezeOnceVisible && isIntersecting)) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!window.IntersectionObserver) {
      // Fallback for older browsers - assume visible
      setIsIntersecting(true);
      return;
    }

    const observerParams: IntersectionObserverInit = {
      threshold,
      root,
      rootMargin,
      ...restOptions
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isElementIntersecting);
        
        // Disconnect if frozen once visible
        if (freezeOnceVisible && isElementIntersecting) {
          observer.disconnect();
        }
      },
      observerParams
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    elementRef,
    threshold,
    root,
    rootMargin,
    freezeOnceVisible,
    isIntersecting,
    restOptions
  ]);

  return isIntersecting;
}