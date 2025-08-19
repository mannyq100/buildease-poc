/**
 * Performance utility functions for optimizing application performance
 * Enhanced with baseline measurements for Sprint 2 optimization tracking
 */

interface PerformanceBaseline {
  component: string;
  operation: string;
  baseline: number;
  current: number;
  improvement: number;
  timestamp: number;
}

// Performance baselines storage
const performanceBaselines = new Map<string, PerformanceBaseline[]>();

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

/**
 * Records a performance baseline for a component operation
 * 
 * @param component - Component name
 * @param operation - Operation being measured (e.g., 'render', 'query', 'calculation')
 * @param time - Time in milliseconds
 */
export function recordBaseline(component: string, operation: string, time: number): void {
  const key = `${component}-${operation}`;
  if (!performanceBaselines.has(key)) {
    performanceBaselines.set(key, []);
  }
  
  const baselines = performanceBaselines.get(key)!;
  const isFirstMeasurement = baselines.length === 0;
  const baseline = isFirstMeasurement ? time : baselines[0].baseline;
  
  const improvement = isFirstMeasurement ? 0 : ((baseline - time) / baseline) * 100;
  
  baselines.push({
    component,
    operation,
    baseline,
    current: time,
    improvement,
    timestamp: Date.now()
  });
  
  // Keep only last 10 measurements per operation
  if (baselines.length > 10) {
    baselines.shift();
  }
  
  // Log significant improvements in development
  if (process.env.NODE_ENV === 'development' && improvement > 10) {
    console.log(`🚀 Performance improvement: ${component} ${operation} is ${improvement.toFixed(1)}% faster (${time.toFixed(2)}ms vs ${baseline.toFixed(2)}ms baseline)`);
  }
}

/**
 * Creates a performance measurement function with baseline tracking
 * 
 * @param component - Component name
 * @param operation - Operation name
 * @returns A function that measures and records performance
 */
export function createPerformanceMeasurement(component: string, operation: string) {
  return function measureWithBaseline<Args extends unknown[], R>(
    func: (...args: Args) => R
  ): (...args: Args) => R {
    return function(...args: Args) {
      const start = performance.now();
      const result = func(...args);
      const end = performance.now();
      const duration = end - start;
      
      recordBaseline(component, operation, duration);
      
      return result;
    };
  };
}

/**
 * Gets performance improvement summary for Sprint 2
 */
export function getPerformanceImprovements(): Array<{
  component: string;
  operation: string;
  avgImprovement: number;
  currentAvg: number;
  baselineAvg: number;
  measurements: number;
}> {
  const results: ReturnType<typeof getPerformanceImprovements> = [];
  
  for (const [key, baselines] of performanceBaselines.entries()) {
    if (baselines.length < 2) continue; // Need at least 2 measurements
    
    const recentMeasurements = baselines.slice(-5); // Last 5 measurements
    const avgImprovement = recentMeasurements.reduce((sum, b) => sum + b.improvement, 0) / recentMeasurements.length;
    const currentAvg = recentMeasurements.reduce((sum, b) => sum + b.current, 0) / recentMeasurements.length;
    const baselineAvg = recentMeasurements[0].baseline;
    
    results.push({
      component: baselines[0].component,
      operation: baselines[0].operation,
      avgImprovement: Math.round(avgImprovement * 10) / 10,
      currentAvg: Math.round(currentAvg * 100) / 100,
      baselineAvg: Math.round(baselineAvg * 100) / 100,
      measurements: baselines.length
    });
  }
  
  return results.sort((a, b) => b.avgImprovement - a.avgImprovement);
}
