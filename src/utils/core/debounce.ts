/**
 * Debounce utility for delaying function execution
 * Useful for optimizing expensive operations like auto-save and validation
 */

export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Creates a debounced version of the provided function
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced function with cancel and flush methods
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunction = (...args: Parameters<T>): void => {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debouncedFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFunction.flush = (): void => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFunction;
}

/**
 * React hook for creating a stable debounced function
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @param deps Dependencies array (similar to useCallback)
 * @returns A memoized debounced function
 */
import { useRef, useEffect, useMemo } from 'react';

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  deps: React.DependencyList = []
): DebouncedFunction<T> {
  const funcRef = useRef(func);

  // Update function reference when dependencies change
  useEffect(() => {
    funcRef.current = func;
  }, [func, ...deps]);

  // Create stable debounced function
  const debouncedFunction = useMemo(() => {
    return debounce((...args: Parameters<T>) => {
      funcRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFunction.cancel();
    };
  }, [debouncedFunction]);

  return debouncedFunction;
}