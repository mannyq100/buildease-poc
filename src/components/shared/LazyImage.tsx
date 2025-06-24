/**
 * LazyImage Component
 * Optimized image loading with intersection observer, progressive enhancement,
 * and mobile-specific optimizations for construction site use
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ImageIcon, AlertCircle, Loader2 } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
  enableProgressiveLoading?: boolean;
}

export const LazyImage = React.memo(function LazyImage({
  src,
  alt,
  className = '',
  placeholder,
  blurDataURL,
  width,
  height,
  aspectRatio = '16/9',
  objectFit = 'cover',
  priority = false,
  quality = 75,
  sizes,
  onLoad,
  onError,
  fallbackSrc,
  showLoadingIndicator = true,
  enableProgressiveLoading = true
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(
    priority ? src : undefined
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate optimized image URLs for different screen sizes
  const generateOptimizedSrc = useCallback((originalSrc: string, targetWidth?: number) => {
    // In a real implementation, this would integrate with a service like:
    // - Cloudinary: `https://res.cloudinary.com/demo/image/fetch/w_${targetWidth},f_auto,q_${quality}/${encodeURIComponent(originalSrc)}`
    // - Next.js Image Optimization API
    // - Custom image optimization service
    
    // For now, return the original src (placeholder for actual optimization)
    return originalSrc;
  }, [quality]);

  // Generate responsive srcSet for different screen densities
  const generateSrcSet = useCallback((originalSrc: string) => {
    if (!width) return undefined;
    
    const sizes = [1, 1.5, 2]; // 1x, 1.5x, 2x for different device pixel ratios
    return sizes
      .map(scale => {
        const scaledWidth = Math.round(width * scale);
        return `${generateOptimizedSrc(originalSrc, scaledWidth)} ${scale}x`;
      })
      .join(', ');
  }, [width, generateOptimizedSrc]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setCurrentSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView, src]);

  // Progressive loading: load low-quality placeholder first
  useEffect(() => {
    if (!enableProgressiveLoading || !blurDataURL || !isInView) return;

    const img = new Image();
    img.onload = () => {
      // Small delay to show the blur effect
      setTimeout(() => {
        setCurrentSrc(src);
      }, 100);
    };
    img.src = blurDataURL;
  }, [isInView, blurDataURL, src, enableProgressiveLoading]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error with fallback
  const handleError = useCallback(() => {
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setIsError(true);
    }
    onError?.();
  }, [fallbackSrc, currentSrc, onError]);

  // Placeholder component
  const PlaceholderContent = () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
      {isError ? (
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600">
          <AlertCircle className="h-8 w-8" />
          <span className="text-xs font-medium">Failed to load</span>
        </div>
      ) : isLoading && showLoadingIndicator ? (
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium">Image</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}
      style={{
        aspectRatio,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Blur placeholder for progressive loading */}
      {blurDataURL && enableProgressiveLoading && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: objectFit,
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)', // Slightly scale to hide blur edges
          }}
        />
      )}

      {/* Loading/Error placeholder */}
      <AnimatePresence>
        {(isLoading || isError || !currentSrc) && (
          <m.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10"
          >
            {placeholder ? (
              <img
                src={placeholder}
                alt=""
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <PlaceholderContent />
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Main image */}
      {currentSrc && (
        <m.img
          ref={imgRef}
          src={currentSrc}
          srcSet={generateSrcSet(currentSrc)}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 left-1 z-20 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
          {isInView ? (isLoading ? 'Loading' : 'Loaded') : 'Lazy'}
        </div>
      )}
    </div>
  );
});

export default LazyImage;