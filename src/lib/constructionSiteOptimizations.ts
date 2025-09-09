/**
 * Construction Site Network Optimizations - Phase 3.4
 * Specialized optimizations for construction site environments with poor connectivity
 */

import { preloadMediaComponents, preloadBasedOnConnection } from '../components/media/LazyMediaComponents';

export interface ConnectionQuality {
  type: 'excellent' | 'good' | 'poor' | 'offline';
  downlink?: number;
  rtt?: number;
  effectiveType?: string;
}

export interface ConstructionSiteConfig {
  enableOfflineMode: boolean;
  aggressiveCaching: boolean;
  reduceImageQuality: boolean;
  prioritizeEssentialFeatures: boolean;
  connectionAwareness: boolean;
}

// Default configuration optimized for construction sites
const DEFAULT_CONFIG: ConstructionSiteConfig = {
  enableOfflineMode: true,
  aggressiveCaching: true,
  reduceImageQuality: true,
  prioritizeEssentialFeatures: true,
  connectionAwareness: true
};

export class ConstructionSiteOptimizer {
  private config: ConstructionSiteConfig;
  private connectionQuality: ConnectionQuality = { type: 'good' };
  private offlineMode = false;
  private connectionObserver?: PerformanceObserver;

  constructor(config: Partial<ConstructionSiteConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeOptimizations();
  }

  private async initializeOptimizations() {
    // Monitor connection quality
    await this.updateConnectionQuality();
    this.startConnectionMonitoring();
    
    // Initialize offline detection
    this.setupOfflineDetection();
    
    // Preload critical resources based on connection
    this.intelligentPreloading();
    
    // Setup image optimization
    this.setupImageOptimization();
    
    // Initialize resource prioritization
    this.prioritizeResources();
  }

  private async updateConnectionQuality(): Promise<void> {
    if (!this.config.connectionAwareness) return;

    try {
      // Use Network Information API if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          this.connectionQuality = {
            type: this.classifyConnection(connection),
            downlink: connection.downlink,
            rtt: connection.rtt,
            effectiveType: connection.effectiveType
          };
          
          console.log('[ConstructionSite] Connection quality:', this.connectionQuality);
          return;
        }
      }

      // Fallback: measure connection speed
      const quality = await this.measureConnectionSpeed();
      this.connectionQuality = { type: quality };

    } catch (error) {
      console.warn('[ConstructionSite] Connection quality detection failed:', error);
      this.connectionQuality = { type: 'poor' }; // Conservative default
    }
  }

  private classifyConnection(connection: any): 'excellent' | 'good' | 'poor' | 'offline' {
    const { effectiveType, downlink, rtt } = connection;
    
    if (effectiveType === '4g' && downlink > 10 && rtt < 50) {
      return 'excellent';
    } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 1.5)) {
      return 'good';
    } else if (effectiveType === '3g' || effectiveType === '2g') {
      return 'poor';
    } else {
      return 'offline';
    }
  }

  private async measureConnectionSpeed(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
    try {
      const startTime = performance.now();
      const response = await fetch('/favicon.ico?' + Date.now(), { 
        cache: 'no-store',
        mode: 'no-cors'
      });
      
      if (!response.ok) throw new Error('Network test failed');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration < 100) return 'excellent';
      if (duration < 300) return 'good';
      return 'poor';
      
    } catch (error) {
      return 'offline';
    }
  }

  private startConnectionMonitoring(): void {
    // Monitor connection changes
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.updateConnectionQuality();
      console.log('[ConstructionSite] Back online');
    });

    window.addEventListener('offline', () => {
      this.offlineMode = true;
      this.connectionQuality = { type: 'offline' };
      console.log('[ConstructionSite] Gone offline');
    });

    // Monitor performance for connection quality changes
    if ('PerformanceObserver' in window && this.config.connectionAwareness) {
      try {
        this.connectionObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            // Adjust connection quality based on actual performance
            if (entry.name.includes('chunk') && entry.duration > 2000) {
              this.connectionQuality.type = 'poor';
              this.adaptToConnection();
            }
          });
        });

        this.connectionObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('[ConstructionSite] Performance monitoring failed:', error);
      }
    }
  }

  private setupOfflineDetection(): void {
    if (!this.config.enableOfflineMode) return;

    // Enhanced offline detection for construction sites
    const checkOnlineStatus = async () => {
      try {
        // Try to fetch a small resource
        const response = await fetch('/favicon.ico', { 
          cache: 'no-store',
          mode: 'no-cors'
        });
        
        this.offlineMode = !response.ok;
      } catch (error) {
        this.offlineMode = true;
      }
    };

    // Check connectivity every 30 seconds in poor conditions
    if (this.connectionQuality.type === 'poor') {
      setInterval(checkOnlineStatus, 30000);
    }
  }

  private async intelligentPreloading(): Promise<void> {
    const { type } = this.connectionQuality;

    // Only preload on good connections
    if (type === 'excellent' || type === 'good') {
      try {
        // Preload media components based on connection
        if (type === 'excellent') {
          await preloadMediaComponents.all();
        } else {
          // Only preload most critical components on good connections
          await Promise.all([
            preloadMediaComponents.virtualGrid(),
            preloadMediaComponents.mediaGrid()
          ]);
        }
        
        console.log('[ConstructionSite] Media components preloaded');
      } catch (error) {
        console.warn('[ConstructionSite] Preloading failed:', error);
      }
    }

    // Setup connection-aware preloading
    preloadBasedOnConnection();
  }

  private setupImageOptimization(): void {
    if (!this.config.reduceImageQuality) return;

    // Intercept image loading for construction site optimization
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string, ...args: any[]) {
      const element = originalCreateElement.call(this, tagName, ...args);
      
      if (tagName.toLowerCase() === 'img') {
        const img = element as HTMLImageElement;
        const originalSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
        
        if (originalSetter) {
          Object.defineProperty(img, 'src', {
            set: function(value: string) {
              // Modify image URLs for construction site optimization
              const optimizedSrc = optimizeImageForConnection(value, getConnectionQuality());
              originalSetter.call(this, optimizedSrc);
            },
            get: function() {
              return this.getAttribute('src');
            }
          });
        }
      }
      
      return element;
    };
  }

  private prioritizeResources(): void {
    if (!this.config.prioritizeEssentialFeatures) return;

    // Add resource hints for essential construction site features
    const essentialResources = [
      { href: '/api/projects', rel: 'preconnect' }
    ];

    essentialResources.forEach(({ href, rel }) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      document.head.appendChild(link);
    });
  }

  private adaptToConnection(): void {
    const { type } = this.connectionQuality;

    // Adjust application behavior based on connection quality
    switch (type) {
      case 'poor':
      case 'offline':
        // Reduce features for poor connections
        this.enablePoorConnectionMode();
        break;
      case 'excellent':
        // Enable all features for excellent connections
        this.enableFullFeatureMode();
        break;
      default:
        // Standard mode for good connections
        this.enableStandardMode();
    }
  }

  private enablePoorConnectionMode(): void {
    // Disable non-essential animations
    document.body.classList.add('reduce-motion');
    
    // Reduce image quality globally
    document.body.classList.add('low-quality-images');
    
    // Show connection warning
    this.showConnectionWarning('poor');
  }

  private enableFullFeatureMode(): void {
    document.body.classList.remove('reduce-motion', 'low-quality-images');
    this.hideConnectionWarning();
  }

  private enableStandardMode(): void {
    document.body.classList.remove('reduce-motion', 'low-quality-images');
    this.hideConnectionWarning();
  }

  private showConnectionWarning(type: 'poor' | 'offline'): void {
    const existingWarning = document.getElementById('connection-warning');
    if (existingWarning) return;

    const warning = document.createElement('div');
    warning.id = 'connection-warning';
    warning.className = 'fixed top-0 left-0 right-0 bg-amber-100 border-b border-amber-300 p-2 text-center text-sm z-50';
    warning.textContent = type === 'offline' 
      ? '📱 You\'re offline. Some features may not work.'
      : '📶 Poor connection detected. Optimizing for construction site use...';
    
    document.body.appendChild(warning);
  }

  private hideConnectionWarning(): void {
    const warning = document.getElementById('connection-warning');
    if (warning) {
      warning.remove();
    }
  }

  // Public API
  getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality;
  }

  isOffline(): boolean {
    return this.offlineMode;
  }

  async forceConnectionTest(): Promise<void> {
    await this.updateConnectionQuality();
    this.adaptToConnection();
  }

  updateConfig(config: Partial<ConstructionSiteConfig>): void {
    this.config = { ...this.config, ...config };
    this.adaptToConnection();
  }

  cleanup(): void {
    this.connectionObserver?.disconnect();
    window.removeEventListener('online', this.updateConnectionQuality);
    window.removeEventListener('offline', this.updateConnectionQuality);
    this.hideConnectionWarning();
  }
}

// Global instance for construction site optimization
let globalOptimizer: ConstructionSiteOptimizer | null = null;

export function initializeConstructionSiteOptimizations(
  config?: Partial<ConstructionSiteConfig>
): ConstructionSiteOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new ConstructionSiteOptimizer(config);
  }
  return globalOptimizer;
}

export function getConstructionSiteOptimizer(): ConstructionSiteOptimizer | null {
  return globalOptimizer;
}

// Helper functions
function getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
  return globalOptimizer?.getConnectionQuality().type || 'good';
}

function optimizeImageForConnection(
  src: string, 
  quality: 'excellent' | 'good' | 'poor' | 'offline'
): string {
  if (quality === 'poor' || quality === 'offline') {
    // Add quality reduction parameters for construction site images
    const url = new URL(src, window.location.origin);
    
    // For Supabase storage images
    if (url.hostname.includes('supabase')) {
      url.searchParams.set('quality', '60');
      url.searchParams.set('resize', '800x600');
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    // For other images, try to append quality parameters
    if (src.includes('?')) {
      return `${src}&quality=60&format=webp`;
    } else {
      return `${src}?quality=60&format=webp`;
    }
  }
  
  return src;
}

// CSS for construction site optimizations
const constructionSiteCSS = `
  .reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .low-quality-images img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* Construction site themed loading indicators */
  .construction-loader {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #ed8936;
    border-radius: 50%;
    animation: construction-spin 1s linear infinite;
  }
  
  @keyframes construction-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject construction site CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = constructionSiteCSS;
  document.head.appendChild(style);
}