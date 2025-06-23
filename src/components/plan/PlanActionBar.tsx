/**
 * Plan Action Bar Component
 * Header actions for plan management (save, regenerate, distribute, etc.)
 * Optimized for mobile-first responsive design
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Save, 
  CheckCircle,
  Share2,
  Loader2,
  MoreHorizontal,
  Printer,
  Download
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

interface PlanActionBarProps {
  isGenerating: boolean;
  isSaving: boolean;
  onSave: (status: 'draft' | 'final') => void;
  onRegenerate: () => void;
  onDistribute: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  className?: string;
}

export const PlanActionBar = React.memo(function PlanActionBar({
  isGenerating,
  isSaving,
  onSave,
  onRegenerate,
  onDistribute,
  onPrint,
  onExportPDF,
  className = ''
}: PlanActionBarProps) {
  const handleSaveDraft = () => onSave('draft');
  const handleSaveFinal = () => onSave('final');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Save Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isSaving}
            className="bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#2B6CB0] dark:text-[#93C5FD] transition-all duration-200 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2 text-[#2B6CB0]" />
            Save as Draft
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSaveFinal} disabled={isSaving}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Save as Final
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Regenerate Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRegenerate}
        disabled={isGenerating || isSaving}
        className="bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#2B6CB0] dark:text-[#93C5FD] transition-all duration-200 shadow-sm"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            <span className="hidden sm:inline">Regenerating...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Regenerate</span>
          </>
        )}
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isSaving || isGenerating}
            className="bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#2B6CB0] dark:text-[#93C5FD] transition-all duration-200 shadow-sm"
          >
            <MoreHorizontal className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onDistribute}>
            <Share2 className="h-4 w-4 mr-2 text-[#2B6CB0]" />
            Distribute Plan
          </DropdownMenuItem>
          
          {onPrint && (
            <DropdownMenuItem onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2 text-[#2B6CB0]" />
              Print Plan
            </DropdownMenuItem>
          )}
          
          {onExportPDF && (
            <DropdownMenuItem onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-2 text-[#2B6CB0]" />
              Export as PDF
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

export default PlanActionBar;