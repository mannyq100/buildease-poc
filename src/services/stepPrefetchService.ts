/**
 * Step Prefetching Service
 * Intelligently prefetches next step components for better perceived performance
 */

interface StepComponent {
  component: React.LazyExoticComponent<React.ComponentType<unknown>>;
  preloaded: boolean;
  loading: boolean;
}

class StepPrefetchService {
  private static instance: StepPrefetchService;
  private stepComponents: Map<number, StepComponent> = new Map();
  private prefetchQueue: Set<number> = new Set();
  private maxConcurrentPrefetch = 2;
  private currentPrefetching = 0;

  private constructor() {}

  static getInstance(): StepPrefetchService {
    if (!StepPrefetchService.instance) {
      StepPrefetchService.instance = new StepPrefetchService();
    }
    return StepPrefetchService.instance;
  }

  /**
   * Register a step component for prefetching
   */
  registerStep(stepIndex: number, component: React.LazyExoticComponent<React.ComponentType<any>>): void {
    this.stepComponents.set(stepIndex, {
      component,
      preloaded: false,
      loading: false
    });
  }

  /**
   * Prefetch the next step(s) based on current step
   */
  async prefetchNextSteps(currentStep: number, totalSteps: number): Promise<void> {
    // Prefetch next 1-2 steps
    const stepsToPrefetch = [currentStep + 1, currentStep + 2].filter(
      step => step <= totalSteps && step > 0
    );

    for (const step of stepsToPrefetch) {
      this.queuePrefetch(step);
    }

    this.processPrefetchQueue();
  }

  /**
   * Prefetch a specific step immediately (for navigation)
   */
  async prefetchStep(stepIndex: number): Promise<void> {
    const stepComponent = this.stepComponents.get(stepIndex);
    if (!stepComponent || stepComponent.preloaded || stepComponent.loading) {
      return;
    }

    return this.loadStepComponent(stepIndex);
  }

  /**
   * Check if a step is already preloaded
   */
  isStepPreloaded(stepIndex: number): boolean {
    const stepComponent = this.stepComponents.get(stepIndex);
    return stepComponent?.preloaded || false;
  }

  /**
   * Preload critical steps (first 3 steps) immediately
   */
  async preloadCriticalSteps(): Promise<void> {
    const criticalSteps = [1, 2, 3];
    const promises = criticalSteps.map(step => this.prefetchStep(step));
    
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Failed to preload some critical steps:', error);
    }
  }

  /**
   * Queue a step for prefetching
   */
  private queuePrefetch(stepIndex: number): void {
    const stepComponent = this.stepComponents.get(stepIndex);
    if (!stepComponent || stepComponent.preloaded || stepComponent.loading) {
      return;
    }

    this.prefetchQueue.add(stepIndex);
  }

  /**
   * Process the prefetch queue with concurrency control
   */
  private async processPrefetchQueue(): Promise<void> {
    if (this.currentPrefetching >= this.maxConcurrentPrefetch || this.prefetchQueue.size === 0) {
      return;
    }

    const stepIndex = this.prefetchQueue.values().next().value;
    this.prefetchQueue.delete(stepIndex);

    try {
      await this.loadStepComponent(stepIndex);
    } catch (error) {
      console.warn(`Failed to prefetch step ${stepIndex}:`, error);
    }

    // Process next item in queue
    this.processPrefetchQueue();
  }

  /**
   * Load a step component
   */
  private async loadStepComponent(stepIndex: number): Promise<void> {
    const stepComponent = this.stepComponents.get(stepIndex);
    if (!stepComponent || stepComponent.preloaded || stepComponent.loading) {
      return;
    }

    stepComponent.loading = true;
    this.currentPrefetching++;

    try {
      // Use requestIdleCallback for non-blocking prefetch
      await new Promise<void>((resolve) => {
        const prefetchTask = async () => {
          try {
            // Preload the component
            await stepComponent.component.preload();
            stepComponent.preloaded = true;
            resolve();
          } catch (error) {
            console.warn(`Failed to preload step ${stepIndex}:`, error);
            resolve(); // Don't block on prefetch failures
          }
        };

        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => prefetchTask(), { timeout: 5000 });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => prefetchTask(), 100);
        }
      });
    } finally {
      stepComponent.loading = false;
      this.currentPrefetching--;
    }
  }

  /**
   * Clear prefetch cache (useful for memory management)
   */
  clearCache(): void {
    this.stepComponents.clear();
    this.prefetchQueue.clear();
    this.currentPrefetching = 0;
  }

  /**
   * Get prefetch statistics for debugging
   */
  getStats(): {
    totalSteps: number;
    preloadedSteps: number;
    loadingSteps: number;
    queuedSteps: number;
  } {
    const preloadedSteps = Array.from(this.stepComponents.values()).filter(s => s.preloaded).length;
    const loadingSteps = Array.from(this.stepComponents.values()).filter(s => s.loading).length;

    return {
      totalSteps: this.stepComponents.size,
      preloadedSteps,
      loadingSteps,
      queuedSteps: this.prefetchQueue.size
    };
  }
}

export const stepPrefetchService = StepPrefetchService.getInstance();
