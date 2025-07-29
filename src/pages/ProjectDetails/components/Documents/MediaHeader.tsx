import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { ImageIcon, Save } from 'lucide-react';

interface MediaHeaderProps {
  filteredItemsCount: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSaveChanges: () => void;
}

export function MediaHeader({
  filteredItemsCount,
  hasUnsavedChanges,
  isSaving,
  onSaveChanges
}: MediaHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">Project Media</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            {filteredItemsCount} items • Images & documents
          </p>
        </div>
      </div>
      
      {/* Save Controls */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2">
          <Button
            onClick={onSaveChanges}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
