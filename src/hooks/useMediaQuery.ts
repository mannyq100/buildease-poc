/**
 * useMediaQuery.ts
 * Custom hook for responsive design with media queries
 * Allows components to respond to screen size changes
 */
import { useState, useEffect } from 'react';

/**
 * Hook that returns true if the media query matches
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state
  const [matches, setMatches] = useState<boolean>(() => {
    // Check for window to support SSR
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Return early if no window (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Update the state initially
    setMatches(mediaQueryList.matches);

    // Define listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the listener to the media query
    if (mediaQueryList.addEventListener) {
      // Modern browsers
      mediaQueryList.addEventListener('change', listener);
    } else {
      // Older browsers (Safari < 14)
      mediaQueryList.addListener(listener);
    }

    // Clean up
    return () => {
      if (mediaQueryList.removeEventListener) {
        // Modern browsers
        mediaQueryList.removeEventListener('change', listener);
      } else {
        // Older browsers (Safari < 14)
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
