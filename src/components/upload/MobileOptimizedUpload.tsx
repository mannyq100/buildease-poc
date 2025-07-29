/**
 * Mobile Optimized Upload Component
 * Provides touch-friendly upload interface optimized for mobile devices
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Upload, 
  Image, 
  X, 
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MobileOptimizedUploadProps {
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSizeBytes?: number;
  bucket: string;
  className?: string;
  disabled?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  compact?: boolean;
}

interface PreviewFile {
  file: File;
  preview: string;
  id: string;
  uploadProgress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export function MobileOptimizedUpload({
  onFilesSelected,
  onRemoveFile,
  acceptedTypes = ['image/*'],
  maxFiles = 10,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  bucket,
  className,
  disabled = false,
  uploadProgress = 0,
  isUploading = false,
  compact = false
}: MobileOptimizedUploadProps) {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check if device has camera
  const [hasCamera, setHasCamera] = useState(false);
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          setHasCamera(devices.some(device => device.kind === 'videoinput'));
        })
        .catch(() => setHasCamera(false));
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Size validation
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`;
    }

    // Type validation
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [acceptedTypes, maxSizeBytes]);

  const createPreviewFile = useCallback((file: File): PreviewFile => {
    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file)
      : '';
    
    return {
      file,
      preview,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending'
    };
  }, []);

  const handleFileSelection = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check file count limit
    if (previewFiles.length + fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "File Validation Error",
        description: errors.join('\n'),
        variant: "destructive"
      });
      return;
    }

    const newPreviewFiles = validFiles.map(createPreviewFile);
    setPreviewFiles(prev => [...prev, ...newPreviewFiles]);
    onFilesSelected(validFiles);
  }, [previewFiles.length, maxFiles, validateFile, createPreviewFile, onFilesSelected, toast]);

  const handleRemoveFile = useCallback((index: number) => {
    setPreviewFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
    onRemoveFile(index);
  }, [onRemoveFile]);

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
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, [disabled, handleFileSelection]);

  const triggerFileInput = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const triggerCameraInput = useCallback(() => {
    if (disabled) return;
    cameraInputRef.current?.click();
  }, [disabled]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previewFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [previewFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Compact Upload Button */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileInput}
            disabled={disabled || previewFiles.length >= maxFiles}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Files ({previewFiles.length}/{maxFiles})
          </Button>
          
          {hasCamera && (
            <Button
              variant="outline"
              size="sm"
              onClick={triggerCameraInput}
              disabled={disabled || previewFiles.length >= maxFiles}
              className="px-3"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Compact File List */}
        {previewFiles.length > 0 && (
          <div className="space-y-2">
            {previewFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-8 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
          className="hidden"
        />
        
        {hasCamera && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
            className="hidden"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Files
              </h3>
              <p className="text-sm text-gray-600">
                Drag and drop files here, or tap to browse
              </p>
              <p className="text-xs text-gray-500">
                Max {maxFiles} files, {Math.round(maxSizeBytes / 1024 / 1024)}MB each
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={triggerFileInput}
                disabled={disabled || previewFiles.length >= maxFiles}
                className="min-h-[44px] touch-manipulation"
              >
                <Image className="h-5 w-5 mr-2" />
                Choose Files
              </Button>
              
              {hasCamera && (
                <Button
                  variant="outline"
                  onClick={triggerCameraInput}
                  disabled={disabled || previewFiles.length >= maxFiles}
                  className="min-h-[44px] touch-manipulation"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>

            {/* File Count Badge */}
            {previewFiles.length > 0 && (
              <Badge variant="outline" className="mt-2">
                {previewFiles.length} of {maxFiles} files selected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Preview Grid */}
      {previewFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewFiles.map((file, index) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="relative aspect-square">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Status Overlay */}
                <div className="absolute top-2 right-2">
                  {file.status === 'completed' && (
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  {file.status === 'failed' && (
                    <div className="bg-red-500 text-white rounded-full p-1">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-2 left-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Upload Progress */}
                {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <Progress value={file.uploadProgress} className="h-1" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.file.size)}
                </p>
                {file.error && (
                  <p className="text-xs text-red-500 mt-1">
                    {file.error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Global Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading files...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
        className="hidden"
      />
      
      {hasCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
          className="hidden"
        />
      )}
    </div>
  );
}

export default MobileOptimizedUpload;
