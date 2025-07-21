/**
 * Online status detection for construction sites
 * Provides real-time network connectivity status
 */

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    // Check if we're in a browser environment
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    // Default to online for SSR
    return true;
  });
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleOnline = () => {
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    // Listen to browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Additional connectivity check using fetch
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource to verify actual connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };
    
    // Check connectivity every 30 seconds when offline
    let connectivityInterval: NodeJS.Timeout | null = null;
    
    if (!isOnline) {
      connectivityInterval = setInterval(checkConnectivity, 30000);
    }
    
    // Clean up event listeners and intervals
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connectivityInterval) {
        clearInterval(connectivityInterval);
      }
    };
  }, [isOnline]);
  
  return isOnline;
}

/**
 * Enhanced online status with connection quality estimation
 */
export function useConnectionQuality() {
  const isOnline = useOnlineStatus();
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  useEffect(() => {
    if (!isOnline) {
      setConnectionQuality('offline');
      return;
    }
    
    // Estimate connection quality using performance timing
    const estimateQuality = async () => {
      try {
        const startTime = performance.now();
        const response = await fetch('/favicon.ico?' + Date.now(), {
          method: 'HEAD',
          cache: 'no-cache',
        });
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        if (response.ok) {
          if (latency < 200) {
            setConnectionQuality('excellent');
          } else if (latency < 500) {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        } else {
          setConnectionQuality('poor');
        }
        
        setLastChecked(new Date());
      } catch {
        setConnectionQuality('poor');
        setLastChecked(new Date());
      }
    };
    
    // Check quality immediately and then every 60 seconds
    estimateQuality();
    const qualityInterval = setInterval(estimateQuality, 60000);
    
    return () => {
      clearInterval(qualityInterval);
    };
  }, [isOnline]);
  
  return {
    isOnline,
    quality: connectionQuality,
    lastChecked,
    isGoodConnection: connectionQuality === 'excellent' || connectionQuality === 'good',
    isPoorConnection: connectionQuality === 'poor',
  };
}

/**
 * Hook for adaptive behavior based on connection quality
 */
export function useAdaptiveLoading() {
  const { quality, isOnline } = useConnectionQuality();
  
  return {
    // Reduce image quality on poor connections
    imageQuality: quality === 'poor' ? 'low' : quality === 'good' ? 'medium' : 'high',
    
    // Adjust stale time based on connection
    staleTime: quality === 'poor' ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 min vs 5 min
    
    // Disable real-time features on poor connections
    enableRealtime: quality === 'excellent' || quality === 'good',
    
    // Reduce polling frequency on poor connections
    pollingInterval: quality === 'poor' ? 60000 : 30000, // 60s vs 30s
    
    // Show connection status indicator
    showConnectionIndicator: !isOnline || quality === 'poor',
  };
}