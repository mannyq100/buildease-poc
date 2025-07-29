import { Button } from '@/components/ui/button';
import { SimplifiedUpload } from '@/components/upload/SimplifiedUpload';
import { UploadResult } from '@/types/upload';
import { ImageIcon, FileText, X } from 'lucide-react';

interface MediaUploadSectionProps {
  projectId: string;
  showInspirationUpload: boolean;
  showProgressUpload: boolean;
  showDocumentUpload: boolean;
  onInspirationUploadComplete: (results: UploadResult[]) => void;
  onProgressUploadComplete: (results: UploadResult[]) => void;
  onDocumentUploadComplete: (results: UploadResult[]) => void;
  onCloseInspirationUpload: () => void;
  onCloseProgressUpload: () => void;
  onCloseDocumentUpload: () => void;
}

export function MediaUploadSection({
  projectId,
  showInspirationUpload,
  showProgressUpload,
  showDocumentUpload,
  onInspirationUploadComplete,
  onProgressUploadComplete,
  onDocumentUploadComplete,
  onCloseInspirationUpload,
  onCloseProgressUpload,
  onCloseDocumentUpload
}: MediaUploadSectionProps) {
  return (
    <>
      {/* Inspiration Images Upload Section */}
      {showInspirationUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-800">Upload Inspiration Images</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={onCloseInspirationUpload}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <SimplifiedUpload
                type="inspiration"
                projectId={projectId}
                onUploadComplete={onInspirationUploadComplete}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress Images Upload Section */}
      {showProgressUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-800">Upload Progress Images</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={onCloseProgressUpload}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <SimplifiedUpload
                type="progress"
                projectId={projectId}
                onUploadComplete={onProgressUploadComplete}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Section */}
      {showDocumentUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h4 className="text-lg font-bold text-slate-800">Upload Documents</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={onCloseDocumentUpload}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <SimplifiedUpload
                type="documents"
                projectId={projectId}
                onUploadComplete={onDocumentUploadComplete}
                enableMetadata={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface UploadOptionsProps {
  showUploadOptions: boolean;
  onShowInspirationUpload: () => void;
  onShowProgressUpload: () => void;
  onShowDocumentUpload: () => void;
  onCloseUploadOptions: () => void;
}

export function UploadOptions({
  showUploadOptions,
  onShowInspirationUpload,
  onShowProgressUpload,
  onShowDocumentUpload,
  onCloseUploadOptions
}: UploadOptionsProps) {
  if (!showUploadOptions) return null;

  return (
    <div className="bg-gradient-to-br from-buildease-blue-50/30 to-white p-4 rounded-xl border border-buildease-blue-100/50 space-y-4">
      {/* Header with close button */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Choose Upload Type</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCloseUploadOptions}
          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => {
            onShowInspirationUpload();
            onCloseUploadOptions();
          }}
          className="text-buildease-blue-600 border-buildease-blue-200 hover:bg-buildease-blue-50"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Inspiration Images
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            onShowProgressUpload();
            onCloseUploadOptions();
          }}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Progress Images
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            onShowDocumentUpload();
            onCloseUploadOptions();
          }}
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <FileText className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>
      
      <p className="text-xs text-slate-500 text-center">
        Choose the type of media you'd like to upload to your project
      </p>
    </div>
  );
}
