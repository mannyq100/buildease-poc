/**
 * URL Validator Service
 * Comprehensive URL validation and health checking for BuildEase media system
 * Optimized for construction site reliability and signed URL management
 */

// Moved expiry check logic directly into URLValidator to reduce dependencies

/**
 * Checks if a Supabase signed URL is likely expired based on the token
 */
export function isSignedUrlExpired(url: string | null | undefined): boolean {
  if (!url || !url.includes('token=')) {
    return false; // Not a signed URL or no URL
  }

  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    
    if (!token) return false;

    // Try to decode the JWT token to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    return now >= expiry;
  } catch (error) {
    console.warn('Error checking signed URL expiry:', error);
    return true; // Assume expired if we can't parse
  }
}

export interface URLValidationResult {
  /** Whether the URL is valid and accessible */
  isValid: boolean;
  /** Type of URL detected */
  urlType: 'public' | 'signed' | 'relative' | 'invalid';
  /** Whether a signed URL has expired */
  isExpired: boolean;
  /** Whether the URL is accessible (HTTP check) */
  isAccessible: boolean;
  /** HTTP status code if accessible */
  statusCode?: number;
  /** Content type if available */
  contentType?: string;
  /** File size if available */
  contentLength?: number;
  /** Error message if validation failed */
  error?: string;
  /** Suggested action for fixing the URL */
  suggestedAction?: 'regenerate' | 'fallback' | 'retry' | 'none';
  /** Time taken for validation in milliseconds */
  validationTime: number;
}

export interface URLValidationOptions {
  /** Timeout for HTTP requests in milliseconds */
  timeout?: number;
  /** Whether to perform HEAD request to check accessibility */
  checkAccessibility?: boolean;
  /** Whether to follow redirects */
  followRedirects?: boolean;
  /** Maximum number of retries for network requests */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Cache validation results */
  useCache?: boolean;
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

export interface URLHealthMetrics {
  /** Total validations performed */
  totalValidations: number;
  /** Success rate percentage */
  successRate: number;
  /** Average validation time in milliseconds */
  averageValidationTime: number;
  /** Breakdown by URL type */
  typeBreakdown: Record<string, number>;
  /** Breakdown by failure reasons */
  failureReasons: Record<string, number>;
  /** Cache hit rate */
  cacheHitRate: number;
}

/**
 * URL Validator class with caching and metrics
 */
export class URLValidator {
  private static cache = new Map<string, { result: URLValidationResult; timestamp: number }>();
  private static metrics: URLHealthMetrics = {
    totalValidations: 0,
    successRate: 0,
    averageValidationTime: 0,
    typeBreakdown: {},
    failureReasons: {},
    cacheHitRate: 0
  };

  /**
   * Validate a single media URL with comprehensive checks
   */
  static async validateMediaURL(
    url: string | null | undefined,
    options: URLValidationOptions = {}
  ): Promise<URLValidationResult> {
    const startTime = Date.now();
    const {
      timeout = 10000,
      checkAccessibility = true,
      followRedirects = true,
      maxRetries = 2,
      retryDelay = 1000,
      useCache = true,
      cacheTTL = 300000 // 5 minutes
    } = options;

    // Increment total validations
    this.metrics.totalValidations++;

    // Basic null/undefined check
    if (!url || typeof url !== 'string' || url.trim() === '') {
      const result: URLValidationResult = {
        isValid: false,
        urlType: 'invalid',
        isExpired: false,
        isAccessible: false,
        error: 'URL is null, undefined, or empty',
        suggestedAction: 'regenerate',
        validationTime: Date.now() - startTime
      };
      this.updateMetrics(result);
      return result;
    }

    const trimmedUrl = url.trim();
    const cacheKey = `${trimmedUrl}_${JSON.stringify(options)}`;

    // Check cache if enabled
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        this.metrics.cacheHitRate = ((this.metrics.cacheHitRate * (this.metrics.totalValidations - 1)) + 1) / this.metrics.totalValidations;
        return {
          ...cached.result,
          validationTime: Date.now() - startTime
        };
      }
    }

    try {
      // Step 1: URL format validation
      const formatValidation = this.validateURLFormat(trimmedUrl);
      
      if (!formatValidation.isValid) {
        const result: URLValidationResult = {
          ...formatValidation,
          validationTime: Date.now() - startTime
        };
        this.cacheResult(cacheKey, result, useCache);
        this.updateMetrics(result);
        return result;
      }

      // Step 2: Signed URL expiry check
      const isExpired = isSignedUrlExpired(trimmedUrl);

      // Step 3: Accessibility check
      let accessibilityResult: Partial<URLValidationResult> = {
        isAccessible: false,
        suggestedAction: 'retry' as const
      };

      if (checkAccessibility && !isExpired) {
        accessibilityResult = await this.checkURLAccessibility(
          trimmedUrl,
          { timeout, followRedirects, maxRetries, retryDelay }
        );
      } else if (isExpired) {
        accessibilityResult = {
          isAccessible: false,
          error: 'Signed URL has expired',
          suggestedAction: 'regenerate'
        };
      }

      // Combine results
      const finalResult: URLValidationResult = {
        isValid: !isExpired && accessibilityResult.isAccessible,
        urlType: formatValidation.urlType,
        isExpired,
        isAccessible: accessibilityResult.isAccessible,
        statusCode: accessibilityResult.statusCode,
        contentType: accessibilityResult.contentType,
        contentLength: accessibilityResult.contentLength,
        error: isExpired ? 'URL has expired' : accessibilityResult.error,
        suggestedAction: isExpired ? 'regenerate' : (accessibilityResult.suggestedAction || 'none'),
        validationTime: Date.now() - startTime
      };

      this.cacheResult(cacheKey, finalResult, useCache);
      this.updateMetrics(finalResult);
      return finalResult;

    } catch (error) {
      const result: URLValidationResult = {
        isValid: false,
        urlType: 'invalid',
        isExpired: false,
        isAccessible: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
        suggestedAction: 'retry',
        validationTime: Date.now() - startTime
      };
      this.cacheResult(cacheKey, result, useCache);
      this.updateMetrics(result);
      return result;
    }
  }

  /**
   * Validate URL format and determine type
   */
  private static validateURLFormat(url: string): {
    isValid: boolean;
    urlType: 'public' | 'signed' | 'relative' | 'invalid';
    error?: string;
  } {
    try {
      // Check for relative URLs
      if (url.startsWith('/') && !url.startsWith('//')) {
        return {
          isValid: true,
          urlType: 'relative'
        };
      }

      // Parse as URL
      const urlObj = new URL(url);

      // Check for basic URL requirements
      if (!urlObj.protocol || !urlObj.hostname) {
        return {
          isValid: false,
          urlType: 'invalid',
          error: 'Invalid URL structure'
        };
      }

      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          urlType: 'invalid',
          error: 'Only HTTP and HTTPS protocols are supported'
        };
      }

      // Determine if it's a signed URL (contains token parameter)
      const isSignedUrl = urlObj.searchParams.has('token') || 
                         urlObj.href.includes('X-Amz-Algorithm') ||
                         urlObj.href.includes('Signature');

      return {
        isValid: true,
        urlType: isSignedUrl ? 'signed' : 'public'
      };

    } catch (error) {
      return {
        isValid: false,
        urlType: 'invalid',
        error: 'Malformed URL'
      };
    }
  }

  /**
   * Check URL accessibility with HEAD request
   */
  private static async checkURLAccessibility(
    url: string,
    options: {
      timeout: number;
      followRedirects: boolean;
      maxRetries: number;
      retryDelay: number;
    }
  ): Promise<Partial<URLValidationResult>> {
    const { timeout, followRedirects, maxRetries, retryDelay } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: followRedirects ? 'follow' : 'manual',
          headers: {
            'Cache-Control': 'no-cache',
            'User-Agent': 'BuildEase-Media-Validator/1.0'
          }
        });

        clearTimeout(timeoutId);

        const isAccessible = response.ok || (response.status >= 200 && response.status < 400);
        
        return {
          isAccessible,
          statusCode: response.status,
          contentType: response.headers.get('content-type') || undefined,
          contentLength: parseInt(response.headers.get('content-length') || '0') || undefined,
          error: isAccessible ? undefined : `HTTP ${response.status}: ${response.statusText}`,
          suggestedAction: this.getSuggestedActionFromStatus(response.status)
        };

      } catch (error) {
        clearTimeout(timeoutId);

        // If this is the last attempt, return the error
        if (attempt === maxRetries) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          
          return {
            isAccessible: false,
            error: errorMessage,
            suggestedAction: errorMessage.includes('abort') ? 'retry' : 'regenerate'
          };
        }

        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    return {
      isAccessible: false,
      error: 'All retry attempts failed',
      suggestedAction: 'regenerate'
    };
  }

  /**
   * Get suggested action based on HTTP status code
   */
  private static getSuggestedActionFromStatus(status: number): 'regenerate' | 'fallback' | 'retry' | 'none' {
    if (status >= 200 && status < 300) return 'none';
    if (status === 401 || status === 403) return 'regenerate';
    if (status === 404) return 'fallback';
    if (status >= 500) return 'retry';
    return 'regenerate';
  }

  /**
   * Cache validation result
   */
  private static cacheResult(key: string, result: URLValidationResult, useCache: boolean) {
    if (useCache) {
      this.cache.set(key, {
        result,
        timestamp: Date.now()
      });

      // Cleanup old cache entries (keep last 1000)
      if (this.cache.size > 1000) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        entries.slice(0, 100).forEach(([key]) => this.cache.delete(key));
      }
    }
  }

  /**
   * Update metrics
   */
  private static updateMetrics(result: URLValidationResult) {
    // Update type breakdown
    this.metrics.typeBreakdown[result.urlType] = (this.metrics.typeBreakdown[result.urlType] || 0) + 1;

    // Update failure reasons
    if (!result.isValid && result.error) {
      this.metrics.failureReasons[result.error] = (this.metrics.failureReasons[result.error] || 0) + 1;
    }

    // Calculate success rate
    const successCount = Object.entries(this.metrics.failureReasons)
      .reduce((sum, [, count]) => sum + count, 0);
    this.metrics.successRate = ((this.metrics.totalValidations - successCount) / this.metrics.totalValidations) * 100;

    // Update average validation time
    this.metrics.averageValidationTime = (
      (this.metrics.averageValidationTime * (this.metrics.totalValidations - 1)) + result.validationTime
    ) / this.metrics.totalValidations;
  }

  /**
   * Batch validate multiple URLs
   */
  static async validateMultipleURLs(
    urls: (string | null | undefined)[],
    options: URLValidationOptions & { concurrency?: number } = {}
  ): Promise<URLValidationResult[]> {
    const { concurrency = 5, ...validationOptions } = options;
    const results: URLValidationResult[] = new Array(urls.length);

    // Process URLs in batches to avoid overwhelming the network
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map(async (url, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          results[globalIndex] = await this.validateMediaURL(url, validationOptions);
        } catch (error) {
          results[globalIndex] = {
            isValid: false,
            urlType: 'invalid',
            isExpired: false,
            isAccessible: false,
            error: error instanceof Error ? error.message : 'Batch validation error',
            suggestedAction: 'retry',
            validationTime: 0
          };
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  /**
   * Get validation metrics
   */
  static getMetrics(): URLHealthMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  static resetMetrics() {
    this.metrics = {
      totalValidations: 0,
      successRate: 0,
      averageValidationTime: 0,
      typeBreakdown: {},
      failureReasons: {},
      cacheHitRate: 0
    };
  }

  /**
   * Clear cache
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: this.cache.size,
      hitRate: this.metrics.cacheHitRate
    };
  }
}

/**
 * Utility function for simple URL validation
 */
export async function validateURL(url: string): Promise<boolean> {
  const result = await URLValidator.validateMediaURL(url, {
    checkAccessibility: true,
    useCache: true
  });
  return result.isValid;
}

/**
 * Utility function for checking if URL needs refresh
 */
export async function checkURLNeedsRefresh(url: string): Promise<boolean> {
  const result = await URLValidator.validateMediaURL(url, {
    checkAccessibility: false,
    useCache: true
  });
  return result.isExpired || !result.isValid;
}

export default URLValidator;