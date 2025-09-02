/**
 * UploadOptions component for media upload controls
 * Provides clean interface for different upload types
 */

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, FileText, Camera, Plus } from 'lucide-react';

interface UploadOptionsProps {
  showOptions: boolean;
  onToggleOptions: () => void;
  onOpenInspiration: () => void;
  onOpenProgress: () => void;
  onOpenDocuments: () => void;
}

export const UploadOptions = memo<UploadOptionsProps>(({
  showOptions,
  onToggleOptions,
  onOpenInspiration,
  onOpenProgress,
  onOpenDocuments
}) => {
  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onToggleOptions}
          className="flex items-center gap-2"
        >
          <Plus className={`h-4 w-4 transition-transform ${showOptions ? 'rotate-45' : ''}`} />
          {showOptions ? 'Hide Upload Options' : 'Show Upload Options'}
        </Button>
      </div>

      {/* Upload Options */}
      {showOptions && (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold mb-2">Add Media to Your Project</h4>
              <p className="text-slate-600">Choose what type of media you'd like to upload</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Inspiration Images */}
              <Button
                variant="outline"
                onClick={onOpenInspiration}
                className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="font-medium">Inspiration Images</div>
                  <div className="text-sm text-slate-600">Design ideas and references</div>
                </div>
              </Button>

              {/* Progress Images */}
              <Button
                variant="outline"
                onClick={onOpenProgress}
                className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-medium">Progress Images</div>
                  <div className="text-sm text-slate-600">Construction progress photos</div>
                </div>
              </Button>

              {/* Documents */}
              <Button
                variant="outline"
                onClick={onOpenDocuments}
                className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-slate-50"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-center">
                  <div className="font-medium">Documents</div>
                  <div className="text-sm text-slate-600">Contracts, permits, invoices</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

UploadOptions.displayName = 'UploadOptions';
