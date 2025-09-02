/**
 * MediaModals component - consolidated modal management
 * Replaces duplicate modal code with reusable components
 */

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MediaUpload } from '@/components/MediaUpload';
import { DocumentUploadModal } from './DocumentUploadModal';
import type { MediaCategory } from '@/types/database';

interface UploadModalProps {
  isOpen: boolean;
  type: 'inspiration' | 'progress' | 'documents';
  projectId: string;
  onClose: () => void;
  onUploadComplete: (results: any[]) => void;
}

const UploadModal = memo<UploadModalProps>(({
  isOpen,
  type,
  projectId,
  onClose,
  onUploadComplete
}) => {
  if (!isOpen) return null;

  const titles = {
    inspiration: 'Upload Inspiration Images',
    progress: 'Upload Progress Images',
    documents: 'Upload Documents'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{titles[type]}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <MediaUpload
          type={type === 'documents' ? 'document' : type === 'inspiration' ? 'inspiration' : 'progress'}
          projectId={projectId}
          onComplete={onUploadComplete}
        />
      </div>
    </div>
  );
});

UploadModal.displayName = 'UploadModal';

interface PreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const PreviewModal = memo<PreviewModalProps>(({
  isOpen,
  imageUrl,
  onClose
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
});

PreviewModal.displayName = 'PreviewModal';

interface MediaModalsProps {
  // Upload modal state
  uploadModal: {
    type: 'inspiration' | 'progress' | 'documents' | null;
  };
  previewModal: {
    url: string | null;
  };
  projectId: string;
  
  // Actions
  onCloseUpload: () => void;
  onClosePreview: () => void;
  
  // Upload handlers
  onInspirationUpload: (results: any[]) => void;
  onProgressUpload: (results: any[]) => void;
  onDocumentUpload: (files: File[], metadata: Array<{ name: string; category: MediaCategory }>) => Promise<void>;
}

export const MediaModals = memo<MediaModalsProps>(({
  uploadModal,
  previewModal,
  projectId,
  onCloseUpload,
  onClosePreview,
  onInspirationUpload,
  onProgressUpload,
  onDocumentUpload
}) => {
  const getUploadHandler = (type: 'inspiration' | 'progress' | 'documents') => {
    switch (type) {
      case 'inspiration':
        return onInspirationUpload;
      case 'progress':
        return onProgressUpload;
      case 'documents':
        return onDocumentUpload;
      default:
        return () => {};
    }
  };

  return (
    <>
      {/* Upload Modal for Images */}
      {uploadModal.type && uploadModal.type !== 'documents' && (
        <UploadModal
          isOpen={true}
          type={uploadModal.type}
          projectId={projectId}
          onClose={onCloseUpload}
          onUploadComplete={getUploadHandler(uploadModal.type)}
        />
      )}

      {/* Enhanced Document Upload Modal */}
      {uploadModal.type === 'documents' && (
        <DocumentUploadModal
          isOpen={true}
          projectId={projectId}
          onClose={onCloseUpload}
          onUpload={onDocumentUpload}
        />
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={!!previewModal.url}
        imageUrl={previewModal.url}
        onClose={onClosePreview}
      />
    </>
  );
});

MediaModals.displayName = 'MediaModals';
