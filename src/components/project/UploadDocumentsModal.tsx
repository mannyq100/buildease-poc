import React, { useState } from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload,
  FileText,
  Image,
  File
} from 'lucide-react';

// Document categories
const documentCategories = [
  'Plans',
  'Permits',
  'Reports',
  'Photos',
  'Contracts',
  'Specifications',
  'Inspections',
  'Invoices',
  'Other'
];

interface UploadDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], category: string) => void;
  uploadFiles: File[];
}

export function UploadDocumentsModal({
  isOpen,
  onClose,
  onUpload,
  uploadFiles
}: UploadDocumentsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('Plans');

  const handleUpload = () => {
    if (uploadFiles.length > 0) {
      onUpload(uploadFiles, selectedCategory);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.includes('word')) return <FileText className="h-8 w-8 text-blue-600" />;
    if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="h-8 w-8 text-green-600" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Documents"
      description="Upload new documents to your project. All files will be automatically organized."
      size="md"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Files to upload:</h4>
              {uploadFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-slate-900 dark:text-slate-100">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size / (1024 * 1024))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploadFiles.length === 0}
            className="bg-buildease-blue-600 hover:bg-buildease-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload {uploadFiles.length > 0 && `(${uploadFiles.length})`}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}