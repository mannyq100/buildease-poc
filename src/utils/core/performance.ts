/**
 * Performance utility functions for optimizing application performance
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Args) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * 
 * @param func - The function to throttle
 * @param wait - The number of milliseconds to throttle invocations to
 * @returns A throttled version of the function
 */
export function throttle<Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number
): (...args: Args) => void {
  let lastCall = 0;
  return function(...args: Args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Creates a memoized function that caches results based on input arguments.
 * Only use for pure functions with primitive arguments that can be safely JSON stringified.
 * 
 * @param func - The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<Args extends unknown[], R>(
  func: (...args: Args) => R
): (...args: Args) => R {
  const cache = new Map<string, R>();
  
  return function(...args: Args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Measures the execution time of a function
 * 
 * @param func - The function to measure
 * @param name - Optional name for logging
 * @returns A wrapped function that logs execution time
 */
export function measurePerformance<Args extends unknown[], R>(
  func: (...args: Args) => R,
  name: string = 'Function'
): (...args: Args) => R {
  return function(...args: Args) {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    console.log(`${name} execution time: ${end - start}ms`);
    return result;
  };
}

/**
 * Runs a function with a specified delay asynchronously
 * 
 * @param func - The function to run after delay
 * @param delay - Time to delay in milliseconds 
 * @returns A promise that resolves with the function result
 */
export function delay<T>(func: () => T, delay: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(func());
    }, delay);
  });
}
