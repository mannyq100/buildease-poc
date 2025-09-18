/**
 * DocumentUploadModal - Enhanced document upload with custom names and categories
 * Allows users to specify file names and document categories before uploading
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MediaCategory } from '@/types/database';

// Document categories available in the database
const DOCUMENT_CATEGORIES = [
  { value: 'receipt', label: 'Receipt', description: 'Purchase receipts and expense records' },
  { value: 'report', label: 'Report', description: 'Project reports and documentation' },
  { value: 'contract', label: 'Contract', description: 'Legal contracts and agreements' },
  { value: 'permit', label: 'Permit', description: 'Building permits and approvals' },
  { value: 'invoice', label: 'Invoice', description: 'Invoices and billing documents' },
  { value: 'specification', label: 'Specification', description: 'Technical specifications and requirements' },
  { value: 'schedule', label: 'Schedule', description: 'Project schedules and timelines' },
  { value: 'drawing', label: 'Drawing', description: 'Architectural plans and drawings' },
  { value: 'manual', label: 'Manual', description: 'User manuals and instructions' },
  { value: 'certificate', label: 'Certificate', description: 'Certificates and compliance documents' },
  { value: 'other_document', label: 'Other', description: 'Other documents' }
] as const;

interface FileWithMetadata {
  file: File;
  customName: string;
  category: MediaCategory;
}

interface DocumentUploadModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onUpload: (files: File[], metadata: Array<{ name: string; category: MediaCategory }>) => Promise<void>;
}

export function DocumentUploadModal({
  isOpen,
  projectId,
  onClose,
  onUpload
}: DocumentUploadModalProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList);
    const newFiles: FileWithMetadata[] = filesArray.map(file => ({
      file,
      customName: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension for default name
      category: 'other_document' as MediaCategory // Default category
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    processFiles(selectedFiles);
    // Reset the input
    event.target.value = '';
  }, [processFiles]);

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
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const updateFileMetadata = useCallback((index: number, field: 'customName' | 'category', value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCancel = useCallback(() => {
    // Reset form state on cancel
    setFiles([]);
    setIsUploading(false);
    setIsDragOver(false);
    onClose();
  }, [onClose]);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    // Validate all files have names
    const invalidFiles = files.filter(f => !f.customName.trim());
    if (invalidFiles.length > 0) {
      toast({
        title: "Missing File Names",
        description: "Please provide names for all files.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileList = files.map(f => f.file);
      const metadata = files.map(f => ({
        name: f.customName.trim(),
        category: f.category
      }));

      await onUpload(fileList, metadata);
      
      // Reset form
      setFiles([]);
      onClose();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload documents.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload, onClose, toast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Upload Documents</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <Label htmlFor="file-input" className="block text-sm font-medium mb-2">
              Select Documents
            </Label>
            <div 
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Click to select documents or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  Supports PDF, Word, Excel, images and other document types
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* File List with Metadata */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Configure Documents ({files.length})</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((fileWithMetadata, index) => (
                  <Card key={`${fileWithMetadata.file.name}-${index}`} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* Custom Name */}
                        <div>
                          <Label htmlFor={`name-${index}`} className="text-sm font-medium">
                            Document Name *
                          </Label>
                          <Input
                            id={`name-${index}`}
                            value={fileWithMetadata.customName}
                            onChange={(e) => updateFileMetadata(index, 'customName', e.target.value)}
                            placeholder="Enter document name"
                            className="mt-1"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Original: {fileWithMetadata.file.name}
                          </p>
                        </div>

                        {/* Category */}
                        <div>
                          <Label htmlFor={`category-${index}`} className="text-sm font-medium">
                            Category
                          </Label>
                          <Select
                            value={fileWithMetadata.category}
                            onValueChange={(value) => updateFileMetadata(index, 'category', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div>
                                    <div className="font-medium">{cat.label}</div>
                                    <div className="text-xs text-slate-500">{cat.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Remove Button */}
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} {files.length === 1 ? 'Document' : 'Documents'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}