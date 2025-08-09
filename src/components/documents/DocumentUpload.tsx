/**
 * Document Upload Component
 * Mobile-first file upload with drag & drop, progress tracking, and validation
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { validateDocumentFile, formatFileSize, getDocumentTypeFromFilename, getDocumentTypeDisplayName, type DocumentType } from '@/services/documentService';
import { useUploadDocument } from '@/hooks/queries/useDocuments';

interface DocumentUploadProps {
  projectId: string;
  phaseId?: string;
  onUploadComplete?: (documentId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface FileWithPreview {
  file: File;
  id: string;
  documentType?: DocumentType;
  customName?: string;
  description?: string;
}

export function DocumentUpload({ 
  projectId, 
  phaseId, 
  onUploadComplete, 
  onCancel,
  className = '' 
}: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const uploadDocument = useUploadDocument(projectId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles
      .filter((file) => {
        // Additional safety check to ensure we have a valid File object
        if (!file || typeof file !== 'object') {
          console.warn('Invalid file object dropped:', file);
          return false;
        }
        
        if (typeof file.size !== 'number' || typeof file.name !== 'string') {
          console.warn('File object missing required properties:', file);
          return false;
        }
        
        return true;
      })
      .map((file) => {
        // Create a defensive copy to ensure file object integrity
        const fileWithPreview: FileWithPreview = {
          file: file, // Keep original File object intact
          id: Math.random().toString(36).substr(2, 9),
          documentType: getDocumentTypeFromFilename(file.name || 'unknown'),
          customName: (file.name || 'unknown').replace(/\.[^/.]+$/, ""), // Remove extension
          description: ''
        };

        return fileWithPreview;
      });

    if (newFiles.length !== acceptedFiles.length) {
      console.warn(`${acceptedFiles.length - newFiles.length} invalid files were rejected`);
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      // Add fallback for files without MIME type
      'application/octet-stream': ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    // Use dropzone's built-in validation, our custom validation happens later
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const updateFileMetadata = (fileId: string, field: 'documentType' | 'customName' | 'description', value: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, [field]: value } : f
    ));
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const fileWrapper of files) {
        // Additional safety checks before validation
        if (!fileWrapper.file || typeof fileWrapper.file !== 'object') {
          throw new Error(`Invalid file object for ${fileWrapper.customName || 'unknown file'}`);
        }
        
        if (typeof fileWrapper.file.size !== 'number') {
          throw new Error(`File object corrupted - missing size property for ${fileWrapper.file.name || 'unknown file'}`);
        }
        
        if (typeof fileWrapper.file.name !== 'string') {
          throw new Error(`File object corrupted - missing name property`);
        }

        // Validate the file before upload
        const validation = validateDocumentFile(fileWrapper.file);
        if (!validation.isValid) {
          throw new Error(`${fileWrapper.file.name}: ${validation.error}`);
        }

        // Double-check file integrity just before upload
        if (fileWrapper.file.size === 0) {
          throw new Error(`${fileWrapper.file.name}: File appears to be empty`);
        }

        await uploadDocument.mutateAsync({
          file: fileWrapper.file,
          projectId,
          phaseId,
          documentType: fileWrapper.documentType,
          name: fileWrapper.customName || fileWrapper.file.name,
          description: fileWrapper.description,
          onProgress: (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileWrapper.id]: progress
            }));
          }
        });
      }

      // Clear files and progress after successful upload
      setFiles([]);
      setUploadProgress({});
      onUploadComplete?.('success');
    } catch (error) {
      console.error('Upload failed:', error);
      // Show user-friendly error message
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const hasValidFiles = files.length > 0;
  const allFilesValid = files.every(fileWrapper => validateDocumentFile(fileWrapper.file).isValid);

  return (
    <div 
      className={`space-y-6 ${className}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isUploading && onCancel) {
          onCancel();
        }
      }}
      tabIndex={0}
    >
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-white/50 backdrop-blur-sm
          ${isDragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-slate-300 hover:border-purple-400'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Upload className="h-8 w-8 text-purple-600" />
        </div>
        
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop documents here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">
              Drag & drop documents here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, Word, Excel files up to 50MB each
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {hasValidFiles && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              Documents to Upload ({files.length})
            </h3>
            {!isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiles([])}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {files.map((fileWrapper) => {
              const validation = validateDocumentFile(fileWrapper.file);
              const progress = uploadProgress[fileWrapper.id] || 0;
              const isCompleted = progress === 100;

              return (
                <Card key={fileWrapper.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <File className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {fileWrapper.file?.name || 'Unknown file'}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{fileWrapper.file?.size ? formatFileSize(fileWrapper.file.size) : 'Unknown size'}</span>
                          <Badge
                            variant={validation.isValid ? 'outline' : 'destructive'}
                            className={validation.isValid ? 'text-xs border-green-200 text-green-700 bg-green-50' : 'text-xs'}
                          >
                            {validation.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileWrapper.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* File Metadata Form */}
                  {validation.isValid && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${fileWrapper.id}`} className="text-sm font-medium">
                          Document Name
                        </Label>
                        <Input
                          id={`name-${fileWrapper.id}`}
                          value={fileWrapper.customName || ''}
                          onChange={(e) => updateFileMetadata(fileWrapper.id, 'customName', e.target.value)}
                          placeholder="Enter document name"
                          disabled={isUploading}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`type-${fileWrapper.id}`} className="text-sm font-medium">
                          Document Type
                        </Label>
                        <Select
                          value={fileWrapper.documentType}
                          onValueChange={(value) => updateFileMetadata(fileWrapper.id, 'documentType', value as DocumentType)}
                          disabled={isUploading}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(['PERMIT', 'DRAWING', 'CONTRACT', 'INVOICE', 'RECEIPT', 'REPORT', 'SPECIFICATION', 'SCHEDULE', 'MANUAL', 'CERTIFICATE', 'OTHER'] as DocumentType[]).map(type => (
                              <SelectItem key={type} value={type}>
                                {getDocumentTypeDisplayName(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <Label htmlFor={`desc-${fileWrapper.id}`} className="text-sm font-medium">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id={`desc-${fileWrapper.id}`}
                          value={fileWrapper.description || ''}
                          onChange={(e) => updateFileMetadata(fileWrapper.id, 'description', e.target.value)}
                          placeholder="Brief description of the document"
                          disabled={isUploading}
                          rows={2}
                          className="text-sm resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {isUploading && progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {isCompleted ? 'Upload Complete' : 'Uploading...'}
                        </span>
                        <span className="text-gray-900 font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Validation Error */}
                  {!validation.isValid && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{validation.error}</span>
                    </div>
                  )}

                  {/* Upload Success */}
                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Upload successful</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
        {hasValidFiles ? (
          <>
            <Button
              onClick={uploadAllFiles}
              disabled={!allFilesValid || isUploading || files.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading {files.length} file{files.length !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} Document{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            {onCancel && (
              <Button
                variant="outline"
                onClick={() => {
                  if (files.length > 0 && !isUploading) {
                    setShowCancelConfirm(true);
                  } else {
                    onCancel();
                  }
                }}
                disabled={isUploading}
                className="flex-1 sm:flex-initial border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </>
        ) : (
          onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Upload
            </Button>
          )
        )}
      </div>
      
      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Cancel Upload?</h3>
                <p className="text-sm text-slate-600">You have {files.length} file{files.length !== 1 ? 's' : ''} ready to upload.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to cancel? All selected files and their details will be lost.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Keep Files
              </Button>
              <Button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setFiles([]);
                  setUploadProgress({});
                  onCancel?.();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}