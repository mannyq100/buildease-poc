/**
 * Document Upload Form Component
 * Provides UI for uploading documents with metadata (name, description, type)
 */
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadProjectDocuments, uploadFile, type DocumentType, getDocumentTypeDisplayName, getDocumentTypeFromFilename } from '@/services/storageService';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface DocumentUploadFormProps {
  projectId: string;
  phaseId?: string;
  onUploadComplete?: (document: any) => void;
  onUploadError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

interface FormData {
  name: string;
  description: string;
  documentType: DocumentType;
}

const DOCUMENT_TYPES: DocumentType[] = [
  'PERMIT',
  'DRAWING', 
  'CONTRACT',
  'INVOICE',
  'RECEIPT',
  'REPORT',
  'SPECIFICATION',
  'SCHEDULE',
  'PHOTO',
  'VIDEO',
  'MANUAL',
  'CERTIFICATE',
  'OTHER'
];

export function DocumentUploadForm({
  projectId,
  phaseId,
  onUploadComplete,
  onUploadError,
  onClose,
  className
}: DocumentUploadFormProps) {
  const { user } = useSupabaseAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    documentType: 'OTHER'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(false);

      // Auto-populate form fields based on file
      const suggestedType = getDocumentTypeFromFilename(file.name);
      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name,
        documentType: suggestedType
      }));
    }
  }, []);

  const handleFormChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !user) {
      setError('Please select a file and ensure you are logged in');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter a document name');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Use the core uploadFile function with createDatabaseRecord option for better control
      const result = await uploadFile(selectedFile, {
        bucket: 'documents',
        projectId,
        phaseId,
        userId: user.id,
        documentType: formData.documentType,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        createDatabaseRecord: true,
        onProgress: setUploadProgress
      });

      if (result.success && result.document) {
        setSuccess(true);
        onUploadComplete?.(result.document);
        
        // Reset form after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setFormData({
            name: '',
            description: '',
            documentType: 'OTHER'
          });
          setSuccess(false);
          setUploadProgress(0);
        }, 2000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, user, projectId, phaseId, formData, onUploadComplete, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(false);
      
      // Auto-populate form fields based on file
      const suggestedType = getDocumentTypeFromFilename(file.name);
      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name,
        documentType: suggestedType
      }));
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
  }, []);

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Upload Document</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Add documents with metadata to your project
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-slate-700">Select Document</Label>
          
          {!selectedFile ? (
            <div 
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">
                Click to browse or drag and drop your document here
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, Word, Excel documents up to 50MB
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-600">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-slate-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Document Metadata Form */}
        {selectedFile && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document Name */}
              <div className="space-y-2">
                <Label htmlFor="doc-name" className="text-sm font-medium text-slate-700">
                  Document Name *
                </Label>
                <Input
                  id="doc-name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter document name"
                  className="w-full"
                />
              </div>

              {/* Document Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Document Type
                </Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value: DocumentType) => handleFormChange('documentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getDocumentTypeDisplayName(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="doc-description" className="text-sm font-medium text-slate-700">
                Description (Optional)
              </Label>
              <Textarea
                id="doc-description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Enter document description or notes"
                className="w-full min-h-[80px]"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Uploading document...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Document uploaded successfully! It's now available in your project.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !formData.name.trim() || isUploading}
            className="flex-1 min-h-[44px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload Document
              </>
            )}
          </Button>

          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Info Text */}
        {selectedFile && (
          <p className="text-xs text-slate-500 text-center">
            Document will be securely stored and accessible to project members
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default DocumentUploadForm;