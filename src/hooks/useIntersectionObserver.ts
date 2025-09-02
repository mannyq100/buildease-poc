/**
 * useIntersectionObserver - Performance-optimized intersection observer for media loading
 * Designed for construction site usage with aggressive viewport management
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  onChange?: (entries: IntersectionObserverEntry[]) => void;
  enabled?: boolean;
}

interface UseIntersectionObserverResult {
  ref: (node: Element | null) => void;
  observer: IntersectionObserver | null;
}

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '50px',
  root = null,
  onChange,
  enabled = true,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverResult {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  // Cleanup function
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    elementsRef.current.clear();
  }, []);

  // Initialize observer
  useEffect(() => {
    if (!enabled || !onChange) {
      cleanup();
      return;
    }

    // Create observer with optimized settings for mobile performance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Batch process entries for better performance
        requestIdleCallback 
          ? requestIdleCallback(() => onChange(entries), { timeout: 100 })
          : setTimeout(() => onChange(entries), 0);
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    // Re-observe existing elements
    elementsRef.current.forEach(element => {
      observerRef.current?.observe(element);
    });

    return cleanup;
  }, [threshold, rootMargin, root, onChange, enabled, cleanup]);

  // Ref callback for elements
  const ref = useCallback((node: Element | null) => {
    if (!enabled || !observerRef.current) return;

    // Remove previous element if it exists
    if (elementsRef.current.size > 0) {
      elementsRef.current.forEach(element => {
        observerRef.current?.unobserve(element);
      });
      elementsRef.current.clear();
    }

    // Add new element
    if (node) {
      elementsRef.current.add(node);
      observerRef.current.observe(node);
    }
  }, [enabled]);

  return {
    ref,
    observer: observerRef.current,
  };
}