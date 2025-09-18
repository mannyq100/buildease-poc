/**
 * Upload Progress Hook
 * Provides real-time upload progress tracking for media files
 * Optimized for construction site usage with detailed progress feedback
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UploadProgressItem {
  /** Unique identifier for the upload */
  id: string;
  /** File being uploaded */
  file: File;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Upload status */
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  /** Upload speed in bytes per second */
  speed?: number;
  /** Estimated time remaining in seconds */
  eta?: number;
  /** Error message if upload failed */
  error?: string;
  /** File URL after successful upload */
  url?: string;
  /** Start time for calculating speed */
  startTime?: number;
  /** Bytes uploaded so far */
  loaded?: number;
  /** Total file size in bytes */
  total?: number;
}

export interface UploadProgressState {
  /** Map of upload ID to progress item */
  uploads: Map<string, UploadProgressItem>;
  /** Overall progress (0-100) */
  overallProgress: number;
  /** Number of active uploads */
  activeUploads: number;
  /** Total files being uploaded */
  totalFiles: number;
  /** Completed uploads count */
  completedUploads: number;
  /** Failed uploads count */
  failedUploads: number;
}

export interface UseUploadProgressOptions {
  /** Maximum number of concurrent uploads */
  maxConcurrent?: number;
  /** Callback when upload completes */
  onUploadComplete?: (upload: UploadProgressItem) => void;
  /** Callback when upload fails */
  onUploadError?: (upload: UploadProgressItem, error: Error) => void;
  /** Callback when all uploads complete */
  onAllUploadsComplete?: (results: UploadProgressItem[]) => void;
  /** Update interval for progress calculation */
  updateInterval?: number;
}

/**
 * Custom hook for managing upload progress with real-time tracking
 */
export function useUploadProgress(options: UseUploadProgressOptions = {}) {
  const {
    maxConcurrent = 3,
    onUploadComplete,
    onUploadError,
    onAllUploadsComplete,
    updateInterval = 500
  } = options;

  const [state, setState] = useState<UploadProgressState>({
    uploads: new Map(),
    overallProgress: 0,
    activeUploads: 0,
    totalFiles: 0,
    completedUploads: 0,
    failedUploads: 0
  });

  const uploadRefs = useRef<Map<string, XMLHttpRequest>>(new Map());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate upload speed and ETA
   */
  const calculateSpeedAndETA = useCallback((upload: UploadProgressItem): { speed: number; eta: number } => {
    if (!upload.startTime || !upload.loaded || upload.loaded === 0) {
      return { speed: 0, eta: 0 };
    }

    const elapsed = (Date.now() - upload.startTime) / 1000; // seconds
    const speed = upload.loaded / elapsed; // bytes per second
    const remaining = (upload.total || 0) - upload.loaded;
    const eta = speed > 0 ? remaining / speed : 0;

    return { speed, eta };
  }, []);

  /**
   * Update progress state and calculations
   */
  const updateProgress = useCallback((uploadId: string, updates: Partial<UploadProgressItem>) => {
    setState(prevState => {
      const newUploads = new Map(prevState.uploads);
      const existingUpload = newUploads.get(uploadId);
      
      if (!existingUpload) return prevState;

      const updatedUpload = { ...existingUpload, ...updates };

      // Calculate speed and ETA if progress is being updated
      if (updates.loaded !== undefined || updates.progress !== undefined) {
        const { speed, eta } = calculateSpeedAndETA(updatedUpload);
        updatedUpload.speed = speed;
        updatedUpload.eta = eta;
      }

      newUploads.set(uploadId, updatedUpload);

      // Calculate overall statistics
      const uploads = Array.from(newUploads.values());
      const totalFiles = uploads.length;
      const activeUploads = uploads.filter(u => u.status === 'uploading').length;
      const completedUploads = uploads.filter(u => u.status === 'completed').length;
      const failedUploads = uploads.filter(u => u.status === 'error').length;
      
      const overallProgress = totalFiles > 0 
        ? uploads.reduce((sum, upload) => sum + upload.progress, 0) / totalFiles 
        : 0;

      return {
        uploads: newUploads,
        overallProgress,
        activeUploads,
        totalFiles,
        completedUploads,
        failedUploads
      };
    });
  }, [calculateSpeedAndETA]);

  /**
   * Start upload for a single file
   */
  const uploadFile = useCallback(async (
    file: File,
    uploadUrl: string,
    options: {
      headers?: Record<string, string>;
      onProgress?: (progress: number) => void;
      uploadId?: string;
    } = {}
  ): Promise<UploadProgressItem> => {
    const uploadId = options.uploadId || `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize upload item
    const uploadItem: UploadProgressItem = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      startTime: Date.now(),
      loaded: 0,
      total: file.size
    };

    // Add to state
    setState(prevState => ({
      ...prevState,
      uploads: new Map(prevState.uploads).set(uploadId, uploadItem),
      totalFiles: prevState.totalFiles + 1
    }));

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      uploadRefs.current.set(uploadId, xhr);

      // Update status to uploading
      updateProgress(uploadId, { status: 'uploading' });

      // Progress handler
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          
          updateProgress(uploadId, {
            progress,
            loaded: event.loaded,
            total: event.total
          });

          options.onProgress?.(progress);
        }
      });

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const completedUpload: UploadProgressItem = {
            ...uploadItem,
            progress: 100,
            status: 'completed',
            loaded: file.size,
            url: xhr.responseURL || uploadUrl
          };

          updateProgress(uploadId, {
            progress: 100,
            status: 'completed',
            url: xhr.responseURL || uploadUrl
          });

          onUploadComplete?.(completedUpload);
          resolve(completedUpload);
        } else {
          const error = new Error(`Upload failed with status ${xhr.status}`);
          updateProgress(uploadId, {
            status: 'error',
            error: error.message
          });
          onUploadError?.(uploadItem, error);
          reject(error);
        }

        uploadRefs.current.delete(uploadId);
      });

      // Error handler
      xhr.addEventListener('error', () => {
        const error = new Error('Upload failed due to network error');
        updateProgress(uploadId, {
          status: 'error',
          error: error.message
        });
        onUploadError?.(uploadItem, error);
        uploadRefs.current.delete(uploadId);
        reject(error);
      });

      // Abort handler
      xhr.addEventListener('abort', () => {
        updateProgress(uploadId, {
          status: 'cancelled'
        });
        uploadRefs.current.delete(uploadId);
        reject(new Error('Upload cancelled'));
      });

      // Configure and send request
      xhr.open('POST', uploadUrl);
      
      // Set headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      xhr.send(formData);
    });
  }, [updateProgress, onUploadComplete, onUploadError]);

  /**
   * Upload multiple files with progress tracking
   */
  const uploadFiles = useCallback(async (
    files: File[],
    uploadUrl: string,
    options: {
      headers?: Record<string, string>;
      onProgress?: (overallProgress: number) => void;
      onFileComplete?: (file: File, result: UploadProgressItem) => void;
    } = {}
  ): Promise<UploadProgressItem[]> => {
    const results: UploadProgressItem[] = [];
    const semaphore = new Array(Math.min(maxConcurrent, files.length)).fill(null);
    let fileIndex = 0;

    const uploadNext = async (): Promise<void> => {
      if (fileIndex >= files.length) return;

      const currentIndex = fileIndex++;
      const file = files[currentIndex];

      try {
        const result = await uploadFile(file, uploadUrl, {
          ...options,
          uploadId: `batch_${Date.now()}_${currentIndex}`
        });

        results[currentIndex] = result;
        options.onFileComplete?.(file, result);
      } catch (error) {
        const errorResult: UploadProgressItem = {
          id: `batch_${Date.now()}_${currentIndex}`,
          file,
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results[currentIndex] = errorResult;
      }

      // Continue with next file
      await uploadNext();
    };

    // Start concurrent uploads
    await Promise.all(semaphore.map(() => uploadNext()));

    // Trigger completion callback
    onAllUploadsComplete?.(results);

    return results;
  }, [uploadFile, maxConcurrent, onAllUploadsComplete]);

  /**
   * Cancel specific upload
   */
  const cancelUpload = useCallback((uploadId: string) => {
    const xhr = uploadRefs.current.get(uploadId);
    if (xhr) {
      xhr.abort();
    }
  }, []);

  /**
   * Cancel all active uploads
   */
  const cancelAllUploads = useCallback(() => {
    uploadRefs.current.forEach((xhr) => {
      xhr.abort();
    });
  }, []);

  /**
   * Clear completed/failed uploads
   */
  const clearUploads = useCallback((filter?: (upload: UploadProgressItem) => boolean) => {
    setState(prevState => {
      const newUploads = new Map();
      
      prevState.uploads.forEach((upload, id) => {
        if (filter ? filter(upload) : upload.status === 'uploading') {
          newUploads.set(id, upload);
        }
      });

      const uploads = Array.from(newUploads.values());
      return {
        ...prevState,
        uploads: newUploads,
        totalFiles: uploads.length,
        activeUploads: uploads.filter(u => u.status === 'uploading').length,
        completedUploads: uploads.filter(u => u.status === 'completed').length,
        failedUploads: uploads.filter(u => u.status === 'error').length
      };
    });
  }, []);

  /**
   * Get upload by ID
   */
  const getUpload = useCallback((uploadId: string): UploadProgressItem | undefined => {
    return state.uploads.get(uploadId);
  }, [state.uploads]);

  /**
   * Get all uploads as array
   */
  const getAllUploads = useCallback((): UploadProgressItem[] => {
    return Array.from(state.uploads.values());
  }, [state.uploads]);

  /**
   * Format speed for display
   */
  const formatSpeed = useCallback((bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${Math.round(bytesPerSecond / 1024)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }, []);

  /**
   * Format time for display
   */
  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllUploads();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [cancelAllUploads]);

  return {
    // State
    ...state,
    uploads: getAllUploads(),

    // Actions
    uploadFile,
    uploadFiles,
    cancelUpload,
    cancelAllUploads,
    clearUploads,
    getUpload,

    // Utilities
    formatSpeed,
    formatTime,

    // Computed values
    isUploading: state.activeUploads > 0,
    hasErrors: state.failedUploads > 0,
    isComplete: state.totalFiles > 0 && state.activeUploads === 0,
    successRate: state.totalFiles > 0 ? (state.completedUploads / state.totalFiles) * 100 : 0
  };
}