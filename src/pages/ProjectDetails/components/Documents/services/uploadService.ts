/**
 * Upload service for ProjectDocumentsSection
 * Centralizes all upload logic and error handling with retry mechanisms
 */

import { UploadResult } from '@/types/upload';
import { Project } from '@/types/project';

export interface UploadContext {
  projectId: string;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onSuccess?: (results: UploadResult[]) => void;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

/**
 * Upload service class for media operations
 * Provides centralized upload handling with retry mechanisms and error recovery
 */
export class MediaUploadService {
  private context: UploadContext;
  private retryConfig: RetryConfig;

  constructor(
    context: UploadContext,
    retryConfig: RetryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    }
  ) {
    this.context = context;
    this.retryConfig = retryConfig;
  }

  /**
   * Upload inspiration images with retry logic
   */
  async uploadInspirationImages(files: File[]): Promise<UploadResult[]> {
    return this.uploadWithRetry('inspiration', files);
  }

  /**
   * Upload progress images with retry logic
   */
  async uploadProgressImages(files: File[]): Promise<UploadResult[]> {
    return this.uploadWithRetry('progress', files);
  }

  /**
   * Upload documents with retry logic
   */
  async uploadDocuments(files: File[]): Promise<UploadResult[]> {
    return this.uploadWithRetry('documents', files);
  }

  /**
   * Generic upload method with retry mechanism
   */
  private async uploadWithRetry(
    type: 'inspiration' | 'progress' | 'documents',
    files: File[],
    attempt: number = 1
  ): Promise<UploadResult[]> {
    try {
      this.context.onProgress?.(0);
      
      // Simulate upload logic - replace with actual implementation
      const results = await this.performUpload(type, files);
      
      this.context.onProgress?.(100);
      this.context.onSuccess?.(results);
      
      return results;
    } catch (error) {
      const uploadError = error instanceof Error ? error : new Error('Upload failed');
      
      if (attempt < this.retryConfig.maxRetries) {
        // Calculate delay with exponential backoff
        const delay = this.retryConfig.retryDelay * 
          Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        
        console.warn(`Upload attempt ${attempt} failed, retrying in ${delay}ms...`, uploadError);
        
        await this.sleep(delay);
        return this.uploadWithRetry(type, files, attempt + 1);
      }
      
      // All retries exhausted
      this.context.onError?.(uploadError);
      throw uploadError;
    }
  }

  /**
   * Perform the actual upload operation
   * TODO: Replace with actual upload implementation using SimplifiedUpload
   */
  private async performUpload(
    type: 'inspiration' | 'progress' | 'documents',
    files: File[]
  ): Promise<UploadResult[]> {
    // Simulate upload process
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random failure for testing retry logic
        if (Math.random() < 0.1) { // 10% failure rate for testing
          reject(new Error(`Failed to upload ${type} files`));
          return;
        }
        
        // Simulate successful upload
        const results: UploadResult[] = files.map((file, index) => ({
          id: `${type}-${Date.now()}-${index}`,
          name: file.name,
          url: `https://example.com/${type}/${file.name}`,
          size: file.size,
          type: type, // Use upload type parameter, not file MIME type
          uploadedAt: new Date()
        }));
        
        resolve(results);
      }, 1000 + Math.random() * 2000); // 1-3 second upload time
    });
  }

  /**
   * Validate files before upload
   */
  validateFiles(files: File[], type: 'inspiration' | 'progress' | 'documents'): {
    valid: File[];
    invalid: { file: File; reason: string }[];
  } {
    const valid: File[] = [];
    const invalid: { file: File; reason: string }[] = [];

    const maxSize = type === 'documents' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for docs, 5MB for images
    const allowedTypes = type === 'documents' 
      ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      : ['image/jpeg', 'image/png', 'image/webp'];

    files.forEach(file => {
      if (file.size > maxSize) {
        invalid.push({ 
          file, 
          reason: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` 
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        invalid.push({ 
          file, 
          reason: `File type ${file.type} not allowed` 
        });
        return;
      }

      valid.push(file);
    });

    return { valid, invalid };
  }

  /**
   * Get upload progress for multiple files
   */
  getUploadProgress(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  /**
   * Cancel ongoing uploads
   */
  cancelUploads(): void {
    // TODO: Implement upload cancellation logic
    console.log('Upload cancellation requested');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create upload service instance
 */
export const createUploadService = (
  project: Project,
  callbacks?: {
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
    onSuccess?: (results: UploadResult[]) => void;
  }
): MediaUploadService => {
  const context: UploadContext = {
    projectId: project.id,
    ...callbacks
  };

  return new MediaUploadService(context);
};

/**
 * Hook for using upload service in React components
 */
export const useMediaUploadService = (
  project: Project,
  callbacks?: {
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
    onSuccess?: (results: UploadResult[]) => void;
  }
) => {
  const service = createUploadService(project, callbacks);
  
  return {
    service,
    uploadInspiration: (files: File[]) => service.uploadInspirationImages(files),
    uploadProgress: (files: File[]) => service.uploadProgressImages(files),
    uploadDocuments: (files: File[]) => service.uploadDocuments(files),
    validateFiles: (files: File[], type: 'inspiration' | 'progress' | 'documents') => 
      service.validateFiles(files, type),
    cancelUploads: () => service.cancelUploads()
  };
};
