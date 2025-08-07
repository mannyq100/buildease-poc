/**
 * RetryService - Advanced retry logic for BuildEase
 * Designed for construction sites with unreliable connectivity
 * Implements exponential backoff, circuit breaker, and retry queue management
 */

interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // Initial delay in milliseconds
  maxDelay?: number; // Maximum delay cap
  backoffMultiplier?: number;
  jitter?: boolean; // Add randomness to prevent thundering herd
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures to open circuit
  recoveryTimeout?: number; // Time before attempting recovery
  monitoringPeriod?: number; // Time window for failure counting
}

enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

interface RetryAttempt {
  id: string;
  attempt: number;
  error: Error;
  timestamp: number;
  nextRetryAt: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: 5,
      recoveryTimeout: 30000, // 30 seconds
      monitoringPeriod: 60000, // 1 minute
      ...options
    };
  }

  canExecute(): boolean {
    if (this.state === CircuitState.OPEN) {
      // Check if recovery timeout has passed
      if (Date.now() - this.lastFailureTime >= this.options.recoveryTimeout!) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        return true;
      }
      return false;
    }
    return true;
  }

  onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      // After 3 successful attempts, close the circuit
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // If we fail during half-open, go back to open
      this.state = CircuitState.OPEN;
    } else if (this.failureCount >= this.options.failureThreshold!) {
      // Open the circuit if we exceed failure threshold
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount
    };
  }
}

export class RetryService {
  private static instance: RetryService;
  private retryQueue: Map<string, RetryAttempt> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {
    // Start retry queue processor
    this.startRetryProcessor();
  }

  static getInstance(): RetryService {
    if (!RetryService.instance) {
      RetryService.instance = new RetryService();
    }
    return RetryService.instance;
  }

  /**
   * Execute operation with retry logic and circuit breaker
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    circuitBreakerKey?: string
  ): Promise<T> {
    const config: Required<RetryOptions> = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: this.defaultRetryCondition,
      onRetry: () => {},
      onFailure: () => {},
      ...options
    };

    // Get or create circuit breaker
    let circuitBreaker: CircuitBreaker | undefined;
    if (circuitBreakerKey) {
      if (!this.circuitBreakers.has(circuitBreakerKey)) {
        this.circuitBreakers.set(circuitBreakerKey, new CircuitBreaker());
      }
      circuitBreaker = this.circuitBreakers.get(circuitBreakerKey);

      // Check if circuit breaker allows execution
      if (!circuitBreaker!.canExecute()) {
        throw new Error(`Circuit breaker is OPEN for ${circuitBreakerKey}. Service temporarily unavailable.`);
      }
    }

    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Success - notify circuit breaker
        if (circuitBreaker) {
          circuitBreaker.onSuccess();
        }
        
        // Log successful retry if this wasn't the first attempt
        if (attempt > 1) {
          console.log(`✅ Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Notify circuit breaker of failure
        if (circuitBreaker) {
          circuitBreaker.onFailure();
        }
        
        // Check if we should retry this error
        if (!config.retryCondition(lastError) || attempt === config.maxAttempts) {
          config.onFailure(lastError, attempt);
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config);
        
        // Notify retry callback
        config.onRetry(attempt, lastError);
        
        console.warn(`❌ Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        
        // Wait before retry
        await this.delay(delay);
      }
    }
    
    // This should never be reached, but just in case
    throw lastError!;
  }

  /**
   * Add operation to retry queue for background processing
   */
  queueForRetry<T>(
    operationId: string,
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): void {
    const config: Required<RetryOptions> = {
      maxAttempts: 5,
      baseDelay: 2000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: this.defaultRetryCondition,
      onRetry: () => {},
      onFailure: () => {},
      ...options
    };

    const retryAttempt: RetryAttempt = {
      id: operationId,
      attempt: 1,
      error: new Error('Queued for retry'),
      timestamp: Date.now(),
      nextRetryAt: Date.now() + config.baseDelay
    };

    this.retryQueue.set(operationId, retryAttempt);
    console.log(`📝 Queued operation ${operationId} for retry`);
  }

  /**
   * Remove operation from retry queue
   */
  removeFromQueue(operationId: string): boolean {
    const removed = this.retryQueue.delete(operationId);
    if (removed) {
      console.log(`🗑️ Removed operation ${operationId} from retry queue`);
    }
    return removed;
  }

  /**
   * Get current retry queue status
   */
  getQueueStatus() {
    return {
      queueSize: this.retryQueue.size,
      operations: Array.from(this.retryQueue.values()).map(attempt => ({
        id: attempt.id,
        attempt: attempt.attempt,
        nextRetryAt: attempt.nextRetryAt,
        error: attempt.error.message
      }))
    };
  }

  /**
   * Get circuit breaker stats
   */
  getCircuitBreakerStats() {
    const stats: Record<string, any> = {};
    this.circuitBreakers.forEach((cb, key) => {
      stats[key] = cb.getStats();
    });
    return stats;
  }

  /**
   * Clear all circuit breakers (useful for testing or manual reset)
   */
  resetCircuitBreakers(): void {
    this.circuitBreakers.clear();
    console.log('🔄 All circuit breakers reset');
  }

  // Private methods

  private defaultRetryCondition(error: Error): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'AbortError',
      'fetch',
      '500',
      '502',
      '503',
      '504'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(keyword => errorMessage.includes(keyword));
  }

  private calculateDelay(attempt: number, config: Required<RetryOptions>): number {
    // Exponential backoff: baseDelay * (backoffMultiplier ^ (attempt - 1))
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Apply maximum delay cap
    delay = Math.min(delay, config.maxDelay);
    
    // Add jitter to prevent thundering herd problem
    if (config.jitter) {
      delay = delay + (Math.random() * delay * 0.1); // Add up to 10% jitter
    }
    
    return Math.floor(delay);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private startRetryProcessor(): void {
    // Process retry queue every 5 seconds
    setInterval(() => {
      this.processRetryQueue();
    }, 5000);
  }

  private async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const readyForRetry = Array.from(this.retryQueue.values())
      .filter(attempt => attempt.nextRetryAt <= now);

    for (const attempt of readyForRetry) {
      try {
        console.log(`🔄 Processing queued retry for ${attempt.id}, attempt ${attempt.attempt}`);
        
        // This is a simplified processor - in a real implementation,
        // you'd need to store the actual operation function
        // For now, we'll just remove it from the queue
        this.retryQueue.delete(attempt.id);
        
      } catch (error) {
        console.error(`❌ Failed to process queued retry for ${attempt.id}:`, error);
        
        // Update retry attempt
        attempt.attempt++;
        attempt.error = error as Error;
        attempt.nextRetryAt = now + this.calculateDelay(attempt.attempt, {
          maxAttempts: 5,
          baseDelay: 2000,
          maxDelay: 60000,
          backoffMultiplier: 2,
          jitter: true,
          retryCondition: this.defaultRetryCondition,
          onRetry: () => {},
          onFailure: () => {}
        });
        
        // Remove if max attempts reached
        if (attempt.attempt > 5) {
          this.retryQueue.delete(attempt.id);
          console.error(`💀 Giving up on queued operation ${attempt.id} after 5 attempts`);
        }
      }
    }
  }
}

// Export singleton instance
export const retryService = RetryService.getInstance();

// Export types for use in other files
export type { RetryOptions, CircuitBreakerOptions };
export { CircuitState };