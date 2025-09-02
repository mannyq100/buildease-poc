/**
 * Bundle Optimization Utilities - Phase 3.4
 * Construction site performance optimization utilities
 */

// Performance monitoring types
export interface BundleMetrics {
  chunkLoadTime: number;
  totalBundleSize: number;
  networkQuality: 'excellent' | 'good' | 'poor' | 'offline';
  cacheHitRate: number;
  loadErrors: string[];
}

export interface PerformanceBudget {
  maxChunkSize: number; // KB
  maxLoadTime: number; // milliseconds
  maxTotalSize: number; // KB
  criticalChunks: string[];
}

// Construction site specific performance budget
export const CONSTRUCTION_SITE_BUDGET: PerformanceBudget = {
  maxChunkSize: 250, // 250KB max chunk size for poor connections
  maxLoadTime: 3000, // 3 seconds max load time
  maxTotalSize: 2048, // 2MB total initial bundle size
  criticalChunks: ['main', 'react-vendor', 'ui-vendor']
};

// Network quality detection for construction sites
export function detectNetworkQuality(): Promise<'excellent' | 'good' | 'poor' | 'offline'> {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve('offline');
      return;
    }

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        const { effectiveType, downlink } = connection;
        
        if (effectiveType === '4g' && downlink > 10) {
          resolve('excellent');
        } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 1.5)) {
          resolve('good');
        } else {
          resolve('poor');
        }
        return;
      }
    }

    // Fallback: simple connection test
    const startTime = performance.now();
    fetch('/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        const loadTime = performance.now() - startTime;
        if (loadTime < 200) resolve('excellent');
        else if (loadTime < 500) resolve('good');
        else resolve('poor');
      })
      .catch(() => resolve('poor'));
  });
}

// Dynamic chunk loading based on network conditions
export async function loadChunkWithFallback(
  chunkLoader: () => Promise<any>,
  fallback?: () => Promise<any>,
  timeout: number = 10000
): Promise<any> {
  const networkQuality = await detectNetworkQuality();
  
  // Adjust timeout based on network quality
  const adjustedTimeout = {
    excellent: timeout * 0.5,
    good: timeout,
    poor: timeout * 2,
    offline: timeout * 3
  }[networkQuality];

  return Promise.race([
    chunkLoader(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Chunk load timeout')), adjustedTimeout)
    )
  ]).catch(async (error) => {
    console.warn('Chunk loading failed, trying fallback:', error);
    
    if (fallback) {
      return fallback();
    }
    
    throw error;
  });
}

// Bundle size monitoring
export class BundleSizeMonitor {
  private static instance: BundleSizeMonitor;
  private metrics: BundleMetrics;
  private observers: ((metrics: BundleMetrics) => void)[] = [];

  private constructor() {
    this.metrics = {
      chunkLoadTime: 0,
      totalBundleSize: 0,
      networkQuality: 'good',
      cacheHitRate: 0,
      loadErrors: []
    };

    this.initializeMonitoring();
  }

  static getInstance(): BundleSizeMonitor {
    if (!BundleSizeMonitor.instance) {
      BundleSizeMonitor.instance = new BundleSizeMonitor();
    }
    return BundleSizeMonitor.instance;
  }

  private async initializeMonitoring() {
    // Monitor network quality
    this.metrics.networkQuality = await detectNetworkQuality();

    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            this.updateLoadMetrics(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }

    // Monitor bundle size via Navigation API
    if (performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const entry = navEntries[0];
        this.metrics.chunkLoadTime = entry.loadEventEnd - entry.loadEventStart;
      }
    }
  }

  private updateLoadMetrics(entry: PerformanceResourceTiming) {
    this.metrics.totalBundleSize += entry.encodedBodySize || 0;
    
    // Check cache hit rate
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
      this.metrics.cacheHitRate += 1;
    }

    this.notifyObservers();
  }

  subscribe(callback: (metrics: BundleMetrics) => void): () => void {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this.metrics));
  }

  getMetrics(): BundleMetrics {
    return { ...this.metrics };
  }

  // Check if current bundle meets construction site performance budget
  checkBudget(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const { totalBundleSize, chunkLoadTime } = this.metrics;

    if (totalBundleSize > CONSTRUCTION_SITE_BUDGET.maxTotalSize * 1024) {
      violations.push(`Total bundle size ${Math.round(totalBundleSize / 1024)}KB exceeds ${CONSTRUCTION_SITE_BUDGET.maxTotalSize}KB`);
    }

    if (chunkLoadTime > CONSTRUCTION_SITE_BUDGET.maxLoadTime) {
      violations.push(`Chunk load time ${Math.round(chunkLoadTime)}ms exceeds ${CONSTRUCTION_SITE_BUDGET.maxLoadTime}ms`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }
}

// Chunk preloading strategies for construction sites
export class ChunkPreloader {
  private preloadedChunks = new Set<string>();
  private networkQuality: 'excellent' | 'good' | 'poor' | 'offline' = 'good';

  constructor() {
    this.updateNetworkQuality();
  }

  private async updateNetworkQuality() {
    this.networkQuality = await detectNetworkQuality();
  }

  // Preload critical chunks based on route
  async preloadForRoute(routeName: string): Promise<void> {
    const chunkMap: Record<string, () => Promise<any>> = {
      'media-grid': () => import('../components/media/VirtualMediaGrid'),
    };

    const loader = chunkMap[routeName];
    if (loader && !this.preloadedChunks.has(routeName)) {
      try {
        // Only preload on good connections
        if (this.networkQuality === 'excellent' || this.networkQuality === 'good') {
          await loader();
          this.preloadedChunks.add(routeName);
        }
      } catch (error) {
        console.warn(`Failed to preload chunk for route ${routeName}:`, error);
      }
    }
  }

  // Intelligent preloading based on user behavior
  async preloadOnHover(element: HTMLElement, loader: () => Promise<any>): Promise<void> {
    const chunkId = element.dataset.chunkId;
    if (!chunkId || this.preloadedChunks.has(chunkId)) return;

    if (this.networkQuality === 'poor' || this.networkQuality === 'offline') {
      return; // Skip preloading on poor connections
    }

    element.addEventListener('mouseenter', async () => {
      try {
        await loader();
        this.preloadedChunks.add(chunkId);
      } catch (error) {
        console.warn(`Failed to preload chunk on hover:`, error);
      }
    }, { once: true });
  }
}

// Resource hints for construction site optimization
export function addResourceHints(resources: Array<{
  href: string;
  as: string;
  type?: 'preload' | 'prefetch' | 'preconnect';
}>) {
  const head = document.head;
  
  resources.forEach(({ href, as, type = 'preload' }) => {
    // Check if hint already exists
    const existing = head.querySelector(`link[href="${href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = type;
    link.href = href;
    if (as) link.setAttribute('as', as);
    
    head.appendChild(link);
  });
}

// Critical CSS extraction for construction site performance
export function extractCriticalCSS(): string {
  const criticalStyles: string[] = [];
  
  // Extract above-the-fold styles
  const styleSheets = Array.from(document.styleSheets);
  
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        // Check if rule applies to above-the-fold content
        if (rule.type === CSSRule.STYLE_RULE) {
          const styleRule = rule as CSSStyleRule;
          // Simple heuristic for critical styles
          if (styleRule.selectorText?.includes('header') ||
              styleRule.selectorText?.includes('nav') ||
              styleRule.selectorText?.includes('hero')) {
            criticalStyles.push(rule.cssText);
          }
        }
      });
    } catch (error) {
      // CORS or other issues accessing stylesheet
      console.warn('Cannot access stylesheet:', error);
    }
  });

  return criticalStyles.join('\n');
}

// Initialize bundle optimization for construction sites
export function initializeBundleOptimization() {
  const monitor = BundleSizeMonitor.getInstance();
  const preloader = new ChunkPreloader();

  // Initialize construction site optimizations (lazy loaded)
  let constructionOptimizer: any = null;
  
  // Load construction site optimizations asynchronously
  import('./constructionSiteOptimizations').then(({ initializeConstructionSiteOptimizations }) => {
    constructionOptimizer = initializeConstructionSiteOptimizations({
      enableOfflineMode: true,
      aggressiveCaching: true,
      reduceImageQuality: true,
      prioritizeEssentialFeatures: true,
      connectionAwareness: true
    });
  }).catch(error => {
    console.warn('Failed to load construction site optimizations:', error);
  });

  // Monitor performance budget
  const unsubscribe = monitor.subscribe((metrics) => {
    const budgetCheck = monitor.checkBudget();
    
    if (!budgetCheck.passed && process.env.NODE_ENV === 'development') {
      console.warn('Performance budget violations:', budgetCheck.violations);
    }

    // Adjust loading strategy based on performance
    if (metrics.networkQuality === 'poor' && metrics.totalBundleSize > 1024 * 1024) {
      console.warn('Large bundle detected on poor connection, consider reducing bundle size');
      
      // Update construction site optimizer for poor connection
      if (constructionOptimizer) {
        constructionOptimizer.updateConfig({
          reduceImageQuality: true,
          prioritizeEssentialFeatures: true
        });
      }
    }
  });

  // Add critical resource hints
  addResourceHints([
    { href: '/api', as: 'fetch', type: 'preconnect' },
    { href: process.env.VITE_SUPABASE_URL || '', as: 'fetch', type: 'preconnect' },
  ]);

  return {
    monitor,
    preloader,
    constructionOptimizer,
    cleanup: () => {
      unsubscribe();
      constructionOptimizer?.cleanup();
    }
  };
}