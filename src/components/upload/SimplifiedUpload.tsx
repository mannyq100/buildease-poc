/**
 * Simplified Upload Component
 * Elegant, mobile-first upload interface that replaces the complex multi-component system
 */

import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Upload, 
  Image, 
  FileText,
  X, 
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSimplifiedUpload } from '@/hooks/useSimplifiedUpload';
import { UploadType, UploadResult } from '@/types/upload';
import { getStatusIcon, formatFileSize, hasCamera } from '@/utils/uploadUtils';

interface SimplifiedUploadProps {
  projectId: string;
  type: UploadType;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

export function SimplifiedUpload({
  projectId,
  type,
  onUploadComplete,
  onUploadError,
  className,
  compact = false,
  disabled = false
}: SimplifiedUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  
  const {
    files,
    isUploading,
    progress,
    error,
    pendingCount,
    completedCount,
    failedCount,
    canUpload,
    addFiles,
    removeFile,
    uploadAll,
    retryFailed,
    cancelUpload,
    clearCompleted,
    reset,
    config
  } = useSimplifiedUpload({
    projectId,
    type,
    onSuccess: onUploadComplete,
    onError: onUploadError
  });

  // Check camera availability on mount
  React.useEffect(() => {
    hasCamera().then(setCameraAvailable);
  }, []);

  const handleFileSelection = useCallback((fileList: FileList | null) => {
    if (!fileList || disabled) return;
    addFiles(Array.from(fileList));
  }, [addFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFileSelection(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelection]);

  const triggerFileInput = useCallback((capture?: boolean) => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = config.acceptedTypes.join(',');
    if (capture && cameraAvailable) {
      input.capture = 'environment';
      input.accept = 'image/*';
    }
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFileSelection(target.files);
    };
    input.click();
  }, [disabled, config.acceptedTypes, cameraAvailable, handleFileSelection]);

  const TypeIcon = ['inspiration', 'progress', 'profile'].includes(type) ? Image : FileText;

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TypeIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{config.label}</span>
            {files.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {files.length}/{config.maxFiles}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerFileInput()}
              disabled={disabled || files.length >= config.maxFiles}
              className="h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            
            {cameraAvailable && ['inspiration', 'progress', 'profile'].includes(type) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerFileInput(true)}
                disabled={disabled || files.length >= config.maxFiles}
                className="h-8 px-2"
              >
                <Camera className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.fileName}
                    className="h-8 w-8 object-cover rounded"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                    <TypeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    {file.status === 'uploading' && (
                      <span>{file.progress}%</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status, "h-4 w-4")}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex items-center space-x-2">
            {canUpload && (
              <Button
                size="sm"
                onClick={uploadAll}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload {pendingCount}
              </Button>
            )}
            
            {failedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryFailed}
                disabled={isUploading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            
            {completedCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                disabled={isUploading}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
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
              <TypeIcon className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                {config.label}
              </h3>
              <p className="text-sm text-gray-600">
                {config.description}
              </p>
              <p className="text-xs text-gray-500">
                Max {config.maxFiles} files, {Math.round(config.maxSizeBytes / 1024 / 1024)}MB each
              </p>
            </div>

            {/* Upload Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => triggerFileInput()}
                disabled={disabled || files.length >= config.maxFiles}
                className="min-h-[44px] touch-manipulation"
              >
                <TypeIcon className="h-5 w-5 mr-2" />
                Choose Files
              </Button>
              
              {cameraAvailable && ['inspiration', 'progress', 'profile'].includes(type) && (
                <Button
                  variant="outline"
                  onClick={() => triggerFileInput(true)}
                  disabled={disabled || files.length >= config.maxFiles}
                  className="min-h-[44px] touch-manipulation"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>

            {/* File Count */}
            {files.length > 0 && (
              <Badge variant="outline" className="mt-2">
                {files.length} of {config.maxFiles} files selected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Selected Files</h4>
            <div className="flex items-center space-x-2">
              {completedCount > 0 && (
                <Badge variant="outline" className="text-green-600">
                  {completedCount} completed
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="outline" className="text-red-600">
                  {failedCount} failed
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <TypeIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Overlay */}
                  <div className="absolute top-2 right-2">
                    {getStatusIcon(file.status)}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 left-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Upload Progress */}
                  {file.status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)}
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
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {canUpload && (
            <Button
              onClick={uploadAll}
              disabled={isUploading}
              className="min-h-[44px] flex-1"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload {pendingCount} Files
            </Button>
          )}
          
          {failedCount > 0 && (
            <Button
              variant="outline"
              onClick={retryFailed}
              disabled={isUploading}
              className="min-h-[44px]"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Retry Failed ({failedCount})
            </Button>
          )}
          
          {isUploading && (
            <Button
              variant="outline"
              onClick={cancelUpload}
              className="min-h-[44px]"
            >
              Cancel Upload
            </Button>
          )}
          
          {files.length > 0 && (
            <Button
              variant="ghost"
              onClick={reset}
              disabled={isUploading}
              className="min-h-[44px]"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Global Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading files...</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default SimplifiedUpload;
