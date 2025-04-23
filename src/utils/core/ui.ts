/**
 * UI utility functions for consistent UI behavior
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges class names using clsx and tailwind-merge
 * @param inputs - Class names or conditional class objects
 * @returns Merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Detect dark mode without DOM operations
let cachedDarkMode: boolean | null = null;

/**
 * Dark mode detector and manager
 */
export const darkModeDetector = {
  /**
   * Check if dark mode is currently active
   * @returns True if dark mode is active
   */
  isDarkMode: () => {
    if (typeof document === 'undefined') return false;
    if (cachedDarkMode !== null) return cachedDarkMode;
    
    cachedDarkMode = document.documentElement.classList.contains('dark');
    return cachedDarkMode;
  },
  
  /**
   * Subscribe to dark mode changes
   * @param callback - Function to call when dark mode changes
   * @returns Unsubscribe function
   */
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
  },

  /**
   * Toggle dark mode
   * @returns New dark mode state
   */
  toggle: () => {
    if (typeof document === 'undefined') return false;
    const isDark = document.documentElement.classList.contains('dark');
    
    document.documentElement.classList.toggle('dark');
    cachedDarkMode = !isDark;
    return cachedDarkMode;
  },

  /**
   * Set dark mode explicitly
   * @param isDark - Whether to enable dark mode
   */
  setDarkMode: (isDark: boolean) => {
    if (typeof document === 'undefined') return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    cachedDarkMode = isDark;
  },
  
  /**
   * Initialize dark mode based on user preference or system setting
   */
  initialize: () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      cachedDarkMode = true;
      return;
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      cachedDarkMode = false;
      return;
    }
    
    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      cachedDarkMode = true;
    } else {
      document.documentElement.classList.remove('dark');
      cachedDarkMode = false;
    }
  }
};

/**
 * Get color variant based on theme
 * @param lightColor - Color to use in light mode
 * @param darkColor - Color to use in dark mode
 * @returns Appropriate color based on current theme
 */
export function getThemeColor(lightColor: string, darkColor: string): string {
  return darkModeDetector.isDarkMode() ? darkColor : lightColor;
}
