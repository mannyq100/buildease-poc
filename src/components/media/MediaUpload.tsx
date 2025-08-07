/**
 * MediaUpload Component
 * Advanced file upload with drag-and-drop, previews, and metadata entry
 * Supports multiple files, progress tracking, and error handling
 */

import { useState, useRef, useCallback } from 'react';
import { useUploadDocument } from '@/hooks/mutations/useDocumentMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  Video, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  formatBytes, 
  validateFileSize, 
  validateFileType, 
  isImageFile, 
  isVideoFile,
  createFilePreviewUrl,
  cleanupObjectUrl
} from '@/utils/fileUtils';
import { toast } from 'sonner';
import type { DocumentType } from '@/types/database';

interface MediaUploadProps {
  projectId: string;
  phaseId?: string;
  onUploadComplete?: (documents: any[]) => void;
  className?: string;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

interface FileUpload {
  id: string;
  file: File;
  preview?: string;
  caption: string;
  description: string;
  documentType: DocumentType;
  tags: string[];
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'PHOTO', label: 'Photo' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'DRAWING', label: 'Drawing' },
  { value: 'SPECIFICATION', label: 'Specification' },
  { value: 'REPORT', label: 'Report' },
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'PERMIT', label: 'Permit' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SCHEDULE', label: 'Schedule' },
  { value: 'OTHER', label: 'Other' }
];

const DEFAULT_ALLOWED_TYPES = [
  'image/*',
  'video/*',
  'application/pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.ppt', '.pptx',
  '.txt', '.csv'
];

export function MediaUpload({
  projectId,
  phaseId,
  onUploadComplete,
  className = '',
  maxFiles = 10,
  maxFileSize = 100,
  allowedTypes = DEFAULT_ALLOWED_TYPES
}: MediaUploadProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<FileUpload | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  // Generate unique ID for file uploads
  const generateFileId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get appropriate document type based on file
  const getDefaultDocumentType = (file: File): DocumentType => {
    if (isImageFile(file)) return 'PHOTO';
    if (isVideoFile(file)) return 'VIDEO';
    if (file.type === 'application/pdf') return 'REPORT';
    if (file.name.toLowerCase().includes('contract')) return 'CONTRACT';
    if (file.name.toLowerCase().includes('invoice')) return 'INVOICE';
    if (file.name.toLowerCase().includes('receipt')) return 'RECEIPT';
    return 'OTHER';
  };

  // File validation
  const validateFile = (file: File): string | null => {
    if (!validateFileSize(file, maxFileSize)) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    if (!validateFileType(file, allowedTypes)) {
      return 'File type not supported';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: FileUpload[] = [];

    fileArray.forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        return;
      }

      const fileUpload: FileUpload = {
        id: generateFileId(),
        file,
        preview: createFilePreviewUrl(file),
        caption: '',
        description: '',
        documentType: getDefaultDocumentType(file),
        tags: [],
        status: 'pending',
        progress: 0
      };

      newFiles.push(fileUpload);
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, maxFileSize, allowedTypes]);

  // Drag and drop handlers
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
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFileSelect(selectedFiles);
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Cleanup preview URLs
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.preview) {
        cleanupObjectUrl(removedFile.preview);
      }
      return updatedFiles;
    });
  };

  // Edit file metadata
  const editFileMetadata = (file: FileUpload) => {
    setEditingFile(file);
    setShowMetadataDialog(true);
  };

  // Update file metadata
  const updateFileMetadata = (updates: Partial<FileUpload>) => {
    if (!editingFile) return;

    setFiles(prev => prev.map(f => 
      f.id === editingFile.id 
        ? { ...f, ...updates }
        : f
    ));
    
    setEditingFile(prev => prev ? { ...prev, ...updates } : null);
  };

  // Upload all files
  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('No files to upload');
      return;
    }

    setIsUploading(true);
    const uploadedDocuments: any[] = [];

    for (const fileUpload of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        // Upload file
        const document = await uploadMutation.mutateAsync({
          file: fileUpload.file,
          projectId,
          phaseId,
          documentType: fileUpload.documentType,
          metadata: {
            caption: fileUpload.caption || null,
            description: fileUpload.description || null,
            tags: fileUpload.tags.length > 0 ? fileUpload.tags : null
          }
        });

        // Update status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));

        uploadedDocuments.push(document);

      } catch (error) {
        console.error('Upload failed for file:', fileUpload.file.name, error);
        
        // Update status to error
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ));
      }
    }

    setIsUploading(false);

    if (uploadedDocuments.length > 0) {
      toast.success(`Successfully uploaded ${uploadedDocuments.length} file${uploadedDocuments.length !== 1 ? 's' : ''}`);
      onUploadComplete?.(uploadedDocuments);
      
      // Clear completed files after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
      }, 2000);
    }
  };

  // Clear all files
  const clearAllFiles = () => {
    // Cleanup preview URLs
    files.forEach(file => {
      if (file.preview) {
        cleanupObjectUrl(file.preview);
      }
    });
    setFiles([]);
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    if (isImageFile(file)) return <ImageIcon className="h-4 w-4" />;
    if (isVideoFile(file)) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Get status icon
  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'uploading': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const hasFiles = files.length > 0;
  const pendingFiles = files.filter(f => f.status === 'pending').length;
  const uploadingFiles = files.filter(f => f.status === 'uploading').length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`
          border-2 border-dashed transition-colors cursor-pointer
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${hasFiles ? 'border-solid' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
          <h3 className="text-lg font-medium mb-2">
            {hasFiles ? 'Add More Files' : 'Upload Media Files'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or click to select
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Maximum {maxFiles} files, up to {maxFileSize}MB each</p>
            <p>Supports images, videos, PDFs, and documents</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {hasFiles && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Selected Files ({files.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {pendingFiles > 0 && (
                  <Badge variant="secondary">{pendingFiles} pending</Badge>
                )}
                {uploadingFiles > 0 && (
                  <Badge variant="default">{uploadingFiles} uploading</Badge>
                )}
                {completedFiles > 0 && (
                  <Badge variant="default" className="bg-green-500">{completedFiles} completed</Badge>
                )}
                {errorFiles > 0 && (
                  <Badge variant="destructive">{errorFiles} failed</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {files.map((fileUpload) => (
              <div
                key={fileUpload.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {fileUpload.preview ? (
                    <img
                      src={fileUpload.preview}
                      alt={fileUpload.file.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      {getFileIcon(fileUpload.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{fileUpload.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(fileUpload.file.size)} • {fileUpload.documentType}
                      </p>
                      {fileUpload.caption && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {fileUpload.caption}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(fileUpload.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editFileMetadata(fileUpload)}
                        disabled={fileUpload.status === 'uploading'}
                        className="h-8 w-8 p-0 touch-manipulation"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileUpload.id)}
                        disabled={fileUpload.status === 'uploading'}
                        className="h-8 w-8 p-0 touch-manipulation text-destructive hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {fileUpload.status === 'uploading' && (
                    <Progress value={fileUpload.progress} className="mt-2" />
                  )}

                  {/* Error Message */}
                  {fileUpload.status === 'error' && fileUpload.error && (
                    <p className="text-sm text-destructive mt-1">{fileUpload.error}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Controls */}
      {hasFiles && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={clearAllFiles}
            disabled={isUploading}
          >
            Clear All
          </Button>
          
          <Button
            onClick={uploadAllFiles}
            disabled={isUploading || pendingFiles === 0}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload {pendingFiles} File{pendingFiles !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Metadata Editor Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Metadata</DialogTitle>
            <DialogDescription>
              Add details to help organize and find this file later.
            </DialogDescription>
          </DialogHeader>
          
          {editingFile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-type">Document Type</Label>
                <Select
                  value={editingFile.documentType}
                  onValueChange={(value: DocumentType) => updateFileMetadata({ documentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={editingFile.caption}
                  onChange={(e) => updateFileMetadata({ caption: e.target.value })}
                  placeholder="Brief description or title"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingFile.description}
                  onChange={(e) => updateFileMetadata({ description: e.target.value })}
                  placeholder="Detailed description"
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetadataDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowMetadataDialog(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}