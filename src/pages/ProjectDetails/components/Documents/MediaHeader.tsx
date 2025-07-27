import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { ChevronDown, ImageIcon, Save } from 'lucide-react';

interface MediaHeaderProps {
  imagesCollapsed: boolean;
  onToggleCollapse: () => void;
  filteredItemsCount: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSaveChanges: () => void;
}

export function MediaHeader({
  imagesCollapsed,
  onToggleCollapse,
  filteredItemsCount,
  hasUnsavedChanges,
  isSaving,
  onSaveChanges
}: MediaHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-3 text-left group hover:bg-slate-50/50 -m-2 p-2 rounded-lg transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-buildease-blue-500 to-buildease-blue-600 rounded-xl group-hover:scale-105 transition-transform">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">Project Media</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            {!imagesCollapsed ? 'Click to collapse' : `${filteredItemsCount} items • Images & documents`}
          </p>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${imagesCollapsed ? 'rotate-0' : 'rotate-180'}`} />
      </button>
      
      {/* Save Controls */}
      {!imagesCollapsed && hasUnsavedChanges && (
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
