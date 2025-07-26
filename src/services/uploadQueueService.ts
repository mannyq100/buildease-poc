import React from 'react';
import type { FileUploadResult } from '@/utils/core/storageUtils';

/**
 * Upload Queue Service
 * Manages concurrent upload operations with proper queuing, retry logic, and error handling
 */

export interface UploadTask {
  id: string;
  file: File;
  bucket: string;
  projectId?: string;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: Error;
  taskId: string;
}

export interface QueueStatus {
  pending: number;
  active: number;
  completed: number;
  failed: number;
  totalProgress: number;
}

class UploadQueueService {
  private queue: UploadTask[] = [];
  private activeUploads: Map<string, UploadTask> = new Map();
  private completedTasks: Map<string, UploadResult> = new Map();
  private maxConcurrent: number = 3;
  private isProcessing: boolean = false;
  private listeners: Set<(status: QueueStatus) => void> = new Set();

  /**
   * Add a new upload task to the queue
   */
  addTask(task: Omit<UploadTask, 'id' | 'retryCount'>): string {
    const uploadTask: UploadTask = {
      ...task,
      id: this.generateTaskId(),
      retryCount: 0,
      maxRetries: task.maxRetries || 3
    };

    // Insert based on priority
    const insertIndex = this.findInsertIndex(uploadTask.priority);
    this.queue.splice(insertIndex, 0, uploadTask);

    this.notifyListeners();
    this.processQueue();

    return uploadTask.id;
  }

  /**
   * Remove a task from queue (if not started) or cancel active upload
   */
  cancelTask(taskId: string): boolean {
    // Check if task is in queue
    const queueIndex = this.queue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
      this.notifyListeners();
      return true;
    }

    // Check if task is active
    if (this.activeUploads.has(taskId)) {
      // Mark for cancellation - actual cancellation depends on upload implementation
      const task = this.activeUploads.get(taskId);
      if (task?.onError) {
        task.onError(new Error('Upload cancelled by user'));
      }
      this.activeUploads.delete(taskId);
      this.notifyListeners();
      return true;
    }

    return false;
  }

  /**
   * Get current queue status
   */
  getStatus(): QueueStatus {
    const pending = this.queue.length;
    const active = this.activeUploads.size;
    const completed = Array.from(this.completedTasks.values()).filter(r => r.success).length;
    const failed = Array.from(this.completedTasks.values()).filter(r => !r.success).length;
    
    // Calculate total progress across all active uploads
    let totalProgress = 0;
    if (active > 0) {
      // This is a simplified progress calculation
      // In practice, you'd track individual upload progress
      totalProgress = (completed / (completed + failed + active + pending)) * 100;
    } else if (pending === 0) {
      totalProgress = 100;
    }

    return {
      pending,
      active,
      completed,
      failed,
      totalProgress
    };
  }

  /**
   * Subscribe to queue status changes
   */
  subscribe(listener: (status: QueueStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Clear completed and failed tasks
   */
  clearCompleted(): void {
    this.completedTasks.clear();
    this.notifyListeners();
  }

  /**
   * Retry failed tasks
   */
  retryFailed(): void {
    const failedTasks = Array.from(this.completedTasks.entries())
      .filter(([_, result]) => !result.success)
      .map(([taskId, _]) => taskId);

    failedTasks.forEach(taskId => {
      this.completedTasks.delete(taskId);
      // Re-add to queue logic would go here
      // This is simplified for now
    });

    this.notifyListeners();
  }

  /**
   * Process the upload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeUploads.size < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) break;

      this.activeUploads.set(task.id, task);
      this.notifyListeners();

      // Process upload asynchronously
      this.processUpload(task).catch(error => {
        console.error('Upload processing error:', error);
        this.handleTaskCompletion(task.id, { success: false, error, taskId: task.id });
      });
    }

    this.isProcessing = false;
  }

  /**
   * Process individual upload task
   */
  private async processUpload(task: UploadTask): Promise<void> {
    try {
      // Import upload utility dynamically to avoid circular dependencies
      const { uploadFile } = await import('../utils/core/storageUtils');
      
      const result = await uploadFile(
        task.file,
        task.bucket,
        task.projectId
      );

      if (result.success) {
        this.handleTaskCompletion(task.id, {
          success: true,
          data: result.data,
          taskId: task.id
        });
        
        if (task.onSuccess) {
          task.onSuccess(result.data);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      await this.handleUploadError(task, error as Error);
    }
  }

  /**
   * Handle upload errors with retry logic
   */
  private async handleUploadError(task: UploadTask, error: Error): Promise<void> {
    task.retryCount++;

    if (task.retryCount <= task.maxRetries) {
      // Add back to queue for retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, task.retryCount - 1), 10000);
      
      setTimeout(() => {
        this.queue.unshift(task); // Add to front for priority
        this.activeUploads.delete(task.id);
        this.processQueue();
      }, delay);
    } else {
      // Max retries exceeded
      this.handleTaskCompletion(task.id, {
        success: false,
        error,
        taskId: task.id
      });

      if (task.onError) {
        task.onError(error);
      }
    }
  }

  /**
   * Handle task completion
   */
  private handleTaskCompletion(taskId: string, result: UploadResult): void {
    this.activeUploads.delete(taskId);
    this.completedTasks.set(taskId, result);
    this.notifyListeners();
    
    // Continue processing queue
    this.processQueue();
  }

  /**
   * Find insertion index based on priority
   */
  private findInsertIndex(priority: 'low' | 'normal' | 'high'): number {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const targetPriority = priorityOrder[priority];

    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] > targetPriority) {
        return i;
      }
    }
    return this.queue.length;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in upload queue listener:', error);
      }
    });
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueueService();

// Export hook for React components
export function useUploadQueue() {
  const [status, setStatus] = React.useState<QueueStatus>(() => uploadQueue.getStatus());

  React.useEffect(() => {
    return uploadQueue.subscribe(setStatus);
  }, []);

  return {
    status,
    addTask: uploadQueue.addTask.bind(uploadQueue),
    cancelTask: uploadQueue.cancelTask.bind(uploadQueue),
    clearCompleted: uploadQueue.clearCompleted.bind(uploadQueue),
    retryFailed: uploadQueue.retryFailed.bind(uploadQueue)
  };
}

export default uploadQueue;
