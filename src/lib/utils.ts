import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Performance utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Detect dark mode without DOM operations
let cachedDarkMode: boolean | null = null;

// Export a singleton for dark mode detection
export const darkModeDetector = {
  isDarkMode: () => {
    if (typeof document === 'undefined') return false;
    if (cachedDarkMode !== null) return cachedDarkMode;
    
    cachedDarkMode = document.documentElement.classList.contains('dark');
    return cachedDarkMode;
  },
  
  subscribe: (callback: (isDark: boolean) => void) => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return () => {};
    
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      if (cachedDarkMode !== isDark) {
        cachedDarkMode = isDark;
        callback(isDark);
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Initial call
    callback(darkModeDetector.isDarkMode());
    
    // Return unsubscribe function
    return () => observer.disconnect();
  }
};

// Simple memo for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map();
  
  return function(...args: Parameters<T>) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  } as T;
}
