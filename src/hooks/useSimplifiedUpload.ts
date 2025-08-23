/**
 * Simplified Upload Hook
 * Replaces complex upload queue service with elegant, straightforward solution
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/services/storageService';
import { 
  UploadFile, 
  UploadType, 
  UploadResult, 
  UploadStatus,
  UPLOAD_CONFIGS 
} from '@/types/upload';
import {
  createPreviewUrl,
  revokePreviewUrl as cleanupPreviewUrl
} from '@/services/storageService';
import {
  validateFile,
  generateUploadId,
  getErrorMessage
} from '@/utils/uploadUtils';

interface UseSimplifiedUploadOptions {
  projectId: string;
  type: UploadType;
  onSuccess?: (results: UploadResult[]) => void;
  onError?: (error: string) => void;
  maxConcurrent?: number;
}

interface UploadState {
  files: UploadFile[];
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useSimplifiedUpload({
  projectId,
  type,
  onSuccess,
  onError,
  maxConcurrent = 3
}: UseSimplifiedUploadOptions) {
  const [state, setState] = useState<UploadState>({
    files: [],
    isUploading: false,
    progress: 0,
    error: null
  });

  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const config = UPLOAD_CONFIGS[type];

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup preview URLs on unmount
      state.files.forEach(file => {
        if (file.preview) {
          cleanupPreviewUrl(file.preview);
        }
      });
    };
  }, [state.files]);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];

    // Validate each file
    newFiles.forEach(file => {
      const validation = validateFile(file, type);
      if (validation) {
        errors.push(`${file.name}: ${validation.message}`);
        return;
      }

      // Check if we're at max files limit
      if (state.files.length + validFiles.length >= config.maxFiles) {
        errors.push(`Maximum ${config.maxFiles} files allowed`);
        return;
      }

      const uploadFile: UploadFile = {
        id: generateUploadId(),
        fileName: file.name,
        fileSize: file.size,
        status: 'pending',
        progress: 0,
        file,
        preview: createPreviewUrl(file) || undefined,
        bucket: config.bucket,
        type
      };

      validFiles.push(uploadFile);
    });

    if (errors.length > 0) {
      toast({
        title: "File Validation Error",
        description: errors.join('\n'),
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles],
      error: null
    }));
  }, [state.files.length, config, type, toast]);

  const removeFile = useCallback((fileId: string) => {
    setState(prev => {
      const fileToRemove = prev.files.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        cleanupPreviewUrl(fileToRemove.preview);
      }
      
      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      };
    });
  }, []);

  const updateFileStatus = useCallback((fileId: string, status: UploadStatus, progress?: number, error?: string) => {
    setState(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.id === fileId
          ? { ...file, status, progress: progress ?? file.progress, error }
          : file
      )
    }));
  }, []);

  const uploadSingleFile = useCallback(async (fileToUpload: UploadFile): Promise<UploadResult | null> => {
    updateFileStatus(fileToUpload.id, 'uploading', 0);

    try {
      const result = await uploadFile(
        fileToUpload.file,
        {
          bucket: fileToUpload.bucket as any, // StorageBucket type
          projectId,
          allowedTypes: config.acceptedTypes,
          maxSizeMB: Math.round(config.maxSizeBytes / (1024 * 1024))
        }
      );

      if (result.success && result.publicUrl) {
        updateFileStatus(fileToUpload.id, 'completed', 100);
        return {
          id: fileToUpload.id,
          url: result.publicUrl,
          name: fileToUpload.fileName,
          size: fileToUpload.fileSize,
          type: fileToUpload.type,
          uploadedAt: new Date()
        };
      } else {
        updateFileStatus(fileToUpload.id, 'failed', 0);
        return null;
      }
    } catch {
      updateFileStatus(fileToUpload.id, 'failed', 0);
      return null;
    }
  }, [config.acceptedTypes, config.maxSizeBytes, projectId, updateFileStatus]);

  const uploadAll = useCallback(async () => {
    const pendingFiles = state.files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setState(prev => ({ ...prev, isUploading: true, error: null }));
    abortControllerRef.current = new AbortController();

    try {
      const results: UploadResult[] = [];
      const errors: string[] = [];

      // Process uploads in batches to respect concurrency limit
      for (let i = 0; i < pendingFiles.length; i += maxConcurrent) {
        const batch = pendingFiles.slice(i, i + maxConcurrent);
        const batchPromises = batch.map(file => uploadSingleFile(file));
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else {
            const file = batch[index];
            const errorMsg = result.status === 'rejected' ? String(result.reason) : 'Upload failed';
            errors.push(`${file.fileName}: ${errorMsg}`);
          }
        });

        // Update overall progress
        const completed = i + batch.length;
        const progress = Math.round((completed / pendingFiles.length) * 100);
        setState(prev => ({ ...prev, progress }));
      }

      if (errors.length > 0) {
        const errorMessage = errors.join(', ');
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `${results.length} files uploaded successfully`,
        });
      }

      if (results.length > 0) {
        onSuccess?.(results);
      }

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isUploading: false, progress: 0 }));
      abortControllerRef.current = null;
    }
  }, [state.files, maxConcurrent, uploadSingleFile, onSuccess, onError, toast]);

  const retryFailed = useCallback(async () => {
    const failedFiles = state.files.filter(f => f.status === 'failed');
    if (failedFiles.length === 0) return;

    // Reset failed files to pending
    setState(prev => ({
      ...prev,
      files: prev.files.map(file =>
        file.status === 'failed'
          ? { ...file, status: 'pending', progress: 0, error: undefined }
          : file
      )
    }));

    // Upload them
    await uploadAll();
  }, [state.files, uploadAll]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => ({
      ...prev,
      isUploading: false,
      progress: 0,
      files: prev.files.map(file =>
        file.status === 'uploading'
          ? { ...file, status: 'cancelled', progress: 0 }
          : file
      )
    }));
  }, []);

  const clearCompleted = useCallback(() => {
    setState(prev => {
      const completedFiles = prev.files.filter(f => f.status === 'completed');
      completedFiles.forEach(file => {
        if (file.preview) {
          cleanupPreviewUrl(file.preview);
        }
      });

      return {
        ...prev,
        files: prev.files.filter(f => f.status !== 'completed'),
        error: null
      };
    });
  }, []);

  const reset = useCallback(() => {
    // Cleanup all blob URLs
    state.files.forEach(file => {
      if (file.preview) {
        cleanupPreviewUrl(file.preview);
      }
    });

    setState({
      files: [],
      isUploading: false,
      progress: 0,
      error: null
    });
  }, [state.files]);

  return {
    // State
    files: state.files,
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
    
    // Computed
    pendingCount: state.files.filter(f => f.status === 'pending').length,
    completedCount: state.files.filter(f => f.status === 'completed').length,
    failedCount: state.files.filter(f => f.status === 'failed').length,
    canUpload: state.files.some(f => f.status === 'pending') && !state.isUploading,
    
    // Actions
    addFiles,
    removeFile,
    uploadAll,
    retryFailed,
    cancelUpload,
    clearCompleted,
    reset,
    
    // Config
    config
  };
}
