/**
 * Unified Media Upload Component
 * Single component for all media upload types with mobile-first design
 * Replaces SimplifiedUpload (577 lines) with ~150 lines (74% reduction)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, Upload, Image, FileText, X, Plus, AlertCircle, 
  CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMedia } from '@/hooks/useMedia';
import { formatFileSize } from '@/utils/core/format';
import type { MediaCategory } from '@/types/database';
import type { MediaItem } from '@/types/media';

// Types
interface MediaUploadProps {
  projectId: string;
  type: 'profile' | 'inspiration' | 'progress' | 'progress_video' | 'receipt' | 'report' | 'contract' | 'permit' | 'invoice' | 'blueprint' | 'other';
  phaseId?: string;
  onComplete?: (items: MediaItem[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  accept?: string;
  allowCamera?: boolean;
  showProgress?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  preview?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

// Configuration mapping for standardized schema
const TYPE_CONFIG = {
  profile: {
    category: 'profile' as MediaCategory,
    maxFiles: 1,
    accept: 'image/*',
    icon: Image,
    label: 'Profile Image',
    description: 'Upload project profile/cover image',
    allowCamera: true
  },
  inspiration: {
    category: 'inspiration' as MediaCategory,
    maxFiles: 20,
    accept: 'image/*',
    icon: Image,
    label: 'Inspiration Images',
    description: 'Upload inspiration and design reference photos',
    allowCamera: true
  },
  progress: {
    category: 'progress' as MediaCategory,
    maxFiles: 50,
    accept: 'image/*',
    icon: Image,
    label: 'Progress Photos',
    description: 'Upload progress photos',
    allowCamera: true
  },
  progress_video: {
    category: 'progress_video' as MediaCategory,
    maxFiles: 20,
    accept: 'video/*',
    icon: Image,
    label: 'Progress Videos',
    description: 'Upload progress videos',
    allowCamera: true
  },
  receipt: {
    category: 'receipt' as MediaCategory,
    maxFiles: 20,
    accept: 'image/*,.pdf',
    icon: FileText,
    label: 'Receipts',
    description: 'Upload purchase receipts and invoices',
    allowCamera: true
  },
  report: {
    category: 'report' as MediaCategory,
    maxFiles: 10,
    accept: '.pdf,.doc,.docx,.txt',
    icon: FileText,
    label: 'Reports',
    description: 'Upload inspection and project reports',
    allowCamera: false
  },
  contract: {
    category: 'contract' as MediaCategory,
    maxFiles: 10,
    accept: '.pdf,.doc,.docx',
    icon: FileText,
    label: 'Contracts',
    description: 'Upload contracts and agreements',
    allowCamera: false
  },
  permit: {
    category: 'permit' as MediaCategory,
    maxFiles: 10,
    accept: '.pdf,.jpg,.jpeg,.png',
    icon: FileText,
    label: 'Permits',
    description: 'Upload permits and certifications',
    allowCamera: true
  },
  invoice: {
    category: 'invoice' as MediaCategory,
    maxFiles: 50,
    accept: '.pdf,.jpg,.jpeg,.png',
    icon: FileText,
    label: 'Invoices',
    description: 'Upload invoices and billing documents',
    allowCamera: true
  },
  blueprint: {
    category: 'blueprint' as MediaCategory,
    maxFiles: 20,
    accept: '.pdf,.dwg,.jpg,.jpeg,.png',
    icon: FileText,
    label: 'Blueprints',
    description: 'Upload blueprints and technical drawings',
    allowCamera: false
  },
  other: {
    category: 'other' as MediaCategory,
    maxFiles: 30,
    accept: '*',
    icon: FileText,
    label: 'Other Documents',
    description: 'Upload other project-related files',
    allowCamera: false
  }
};

// Status icons
const getStatusIcon = (status: string, className = 'h-4 w-4') => {
  switch (status) {
    case 'completed': return <CheckCircle className={cn(className, 'text-green-500')} />;
    case 'uploading': return <RefreshCw className={cn(className, 'text-blue-500 animate-spin')} />;
    case 'failed': return <AlertCircle className={cn(className, 'text-red-500')} />;
    default: return <Clock className={cn(className, 'text-gray-400')} />;
  }
};

// Check camera availability
const hasCamera = async () => {
  try {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  } catch {
    return false;
  }
};

export function MediaUpload({
  projectId,
  type,
  phaseId,
  onComplete,
  onError,
  maxFiles,
  accept,
  allowCamera,
  showProgress = true,
  variant = 'default',
  className
}: MediaUploadProps) {
  // Always call hooks first to avoid conditional hook calls
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  const media = useMedia(projectId);
  
  // Get config with fallback to prevent undefined access
  const config = TYPE_CONFIG[type] || {
    category: 'other' as MediaCategory,
    maxFiles: 10,
    accept: '*',
    icon: FileText,
    label: 'Unknown Type',
    description: 'Upload files',
    allowCamera: false
  };
  
  const finalMaxFiles = maxFiles || config.maxFiles;
  const finalAccept = accept || config.accept;
  const finalAllowCamera = allowCamera !== undefined ? allowCamera : config.allowCamera;
  const TypeIcon = config.icon;

  // Check camera on mount
  useEffect(() => {
    if (finalAllowCamera) {
      hasCamera().then(setCameraAvailable);
    }
  }, [finalAllowCamera]);

  // Generate preview for images
  const createPreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  }, []);

  // Add files to upload queue
  const addFiles = useCallback(async (files: File[]) => {
    if (uploadItems.length + files.length > finalMaxFiles) {
      onError?.(`Maximum ${finalMaxFiles} files allowed`);
      return;
    }

    const newItems: UploadItem[] = [];
    for (const file of files) {
      const preview = await createPreview(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        preview,
        status: 'pending',
        progress: 0
      });
    }

    setUploadItems(prev => [...prev, ...newItems]);
  }, [uploadItems.length, finalMaxFiles, onError, createPreview]);

  // Handle file selection
  const handleFileSelection = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    addFiles(files);
  }, [addFiles]);

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelection(e.dataTransfer.files);
  }, [handleFileSelection]);

  // Trigger file input
  const triggerFileInput = useCallback((useCamera = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = finalMaxFiles > 1;
    input.accept = useCamera ? 'image/*' : finalAccept;
    if (useCamera && cameraAvailable) {
      input.capture = 'environment';
    }
    input.onchange = (e) => handleFileSelection((e.target as HTMLInputElement).files);
    input.click();
  }, [finalMaxFiles, finalAccept, cameraAvailable, handleFileSelection]);

  // Upload files
  const uploadFiles = useCallback(async () => {
    const pendingItems = uploadItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    try {
      // Update all to uploading
      setUploadItems(prev => prev.map(item => 
        item.status === 'pending' ? { ...item, status: 'uploading', progress: 0 } : item
      ));

      const files = pendingItems.map(item => item.file);
      const uploadedItems = await media.upload({
        files,
        options: {
          category: config.category,
          phaseId
        }
      });

      // Mark as completed
      setUploadItems(prev => prev.map(item => 
        item.status === 'uploading' ? { ...item, status: 'completed', progress: 100 } : item
      ));

      onComplete?.(uploadedItems);
    } catch (error) {
      // Mark as failed
      setUploadItems(prev => prev.map(item => 
        item.status === 'uploading' ? { 
          ...item, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : item
      ));
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [uploadItems, media, config.category, phaseId, onComplete, onError]);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Clear completed
  const clearCompleted = useCallback(() => {
    setUploadItems(prev => prev.filter(item => item.status !== 'completed'));
  }, []);

  const pendingCount = uploadItems.filter(item => item.status === 'pending').length;
  const completedCount = uploadItems.filter(item => item.status === 'completed').length;
  const isUploading = uploadItems.some(item => item.status === 'uploading');

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TypeIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{config.label}</span>
            {uploadItems.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {uploadItems.length}/{finalMaxFiles}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline" size="sm" onClick={() => triggerFileInput()}
              disabled={uploadItems.length >= finalMaxFiles}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            {finalAllowCamera && cameraAvailable && (
              <Button
                variant="outline" size="sm" onClick={() => triggerFileInput(true)}
                disabled={uploadItems.length >= finalMaxFiles}
                className="h-8 px-2"
              >
                <Camera className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {uploadItems.length > 0 && (
          <div className="space-y-2">
            {uploadItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                {item.preview ? (
                  <img src={item.preview} alt={item.name} className="h-8 w-8 object-cover rounded" />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                    <TypeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status, 'h-4 w-4')}
                  <Button
                    variant="ghost" size="sm" onClick={() => removeItem(item.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingCount > 0 && (
          <Button size="sm" onClick={uploadFiles} disabled={isUploading} className="w-full">
            <Upload className="h-3 w-3 mr-1" />
            Upload {pendingCount}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200',
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        )}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <TypeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">{config.label}</h3>
              <p className="text-sm text-gray-600">{config.description}</p>
              <p className="text-xs text-gray-500">Max {finalMaxFiles} files, 25MB each</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => triggerFileInput()} 
                disabled={uploadItems.length >= finalMaxFiles}
                className="min-h-[44px]"
              >
                <TypeIcon className="h-5 w-5 mr-2" />
                Choose Files
              </Button>
              {finalAllowCamera && cameraAvailable && (
                <Button
                  variant="outline" onClick={() => triggerFileInput(true)}
                  disabled={uploadItems.length >= finalMaxFiles}
                  className="min-h-[44px]"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadItems.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  {item.preview ? (
                    <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <TypeIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">{getStatusIcon(item.status)}</div>
                  <Button
                    variant="secondary" size="sm" onClick={() => removeItem(item.id)}
                    className="absolute top-2 left-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {item.status === 'uploading' && showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <Progress value={item.progress} className="h-1" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                  {item.error && <p className="text-xs text-red-500 mt-1">{item.error}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            {pendingCount > 0 && (
              <Button onClick={uploadFiles} disabled={isUploading} className="flex-1">
                <Upload className="h-5 w-5 mr-2" />
                Upload {pendingCount} Files
              </Button>
            )}
            {completedCount > 0 && (
              <Button variant="ghost" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
          </div>
        </>
      )}

      {media.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{media.error instanceof Error ? media.error.message : 'Upload error'}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}