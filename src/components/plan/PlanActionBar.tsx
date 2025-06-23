/**
 * Plan Action Bar Component
 * Header actions for plan management (save, regenerate, distribute, etc.)
 * Optimized for mobile-first responsive design
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { PLAN_ACTION_ICONS, getIconWithStyle } from '@/utils/plan-icons';
import { LoadingStateIndicator, InlineLoadingBadge } from './LoadingStateIndicator';
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

  const saveIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.save, 'md', 'primary');
  const loadingIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.loading, 'md', 'primary', 'animate-spin');
  const regenerateIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.regenerate, 'md', 'primary');
  const moreIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.more, 'md', 'primary');
  const distributeIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.distribute, 'md', 'primary');
  const printIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.print, 'md', 'primary');
  const exportIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.export, 'md', 'primary');
  const completeIconStyle = getIconWithStyle(PLAN_ACTION_ICONS.complete, 'md', 'success');

  const isCompact = className?.includes('py-2'); // Detect compact mode

  return (
    <div className={`${className}`}>
      {/* Enhanced Loading States - hidden in compact mode */}
      {!isCompact && (
        <div className="space-y-2">
          <LoadingStateIndicator
            isLoading={isSaving}
            loadingText="Saving your construction plan..."
            successText="Plan saved successfully!"
            variant="save"
            className="mx-4"
          />
          <LoadingStateIndicator
            isLoading={isGenerating}
            loadingText="Regenerating plan with AI optimization..."
            successText="Plan regenerated successfully!"
            variant="regenerate"
            className="mx-4"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className={`flex items-center gap-2 ${isCompact ? 'p-2' : 'p-4'} ${!isCompact ? 'bg-buildease-blue-50/20 dark:bg-buildease-blue-950/10 border-b border-buildease-blue-100/50 dark:border-buildease-blue-900/30' : ''}`}>
        <div className="flex items-center gap-2">
          {/* Primary Save Action - Enhanced styling */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="default"
                size={isCompact ? "xs" : "sm"}
                disabled={isSaving}
                className={`bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 border-0 relative ${isCompact ? 'px-2 py-1 text-xs h-7' : 'px-4 py-2'}`}
              >
                {isSaving ? (
                  <>
                    <loadingIconStyle.IconComponent className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} animate-spin`} />
                    <span className={`hidden ${isCompact ? 'md:inline' : 'sm:inline'}`}>Saving...</span>
                  </>
                ) : (
                  <>
                    <saveIconStyle.IconComponent className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
                    <span className={`hidden ${isCompact ? 'md:inline' : 'sm:inline'}`}>Save</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 shadow-lg border-buildease-blue-100/50 dark:border-buildease-blue-800/50">
            <DropdownMenuLabel className="text-construction-subtitle">Save Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSaveDraft} disabled={isSaving} className="py-2">
              <saveIconStyle.IconComponent className="h-4 w-4 mr-3 text-buildease-blue-600 dark:text-buildease-blue-400" />
              <div className="flex flex-col">
                <span className="font-medium">Save as Draft</span>
                <span className="text-xs text-muted-foreground">Continue editing later</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveFinal} disabled={isSaving} className="py-2">
              <completeIconStyle.IconComponent className="h-4 w-4 mr-3 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">Save as Final</span>
                <span className="text-xs text-muted-foreground">Ready for distribution</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Regenerate Button - Secondary style */}
        <Button
          variant="outline"
          size={isCompact ? "xs" : "sm"}
          onClick={onRegenerate}
          disabled={isGenerating || isSaving}
          className={`bg-white hover:bg-buildease-orange-50 dark:bg-gray-800 dark:hover:bg-buildease-orange-950/20 text-buildease-orange-600 dark:text-buildease-orange-400 border-buildease-orange-200/50 dark:border-buildease-orange-800/50 font-medium transition-all duration-200 shadow-sm hover:shadow-md ${isCompact ? 'px-2 py-1 text-xs h-7' : 'px-4 py-2'}`}
        >
          {isGenerating ? (
            <>
              <loadingIconStyle.IconComponent className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} animate-spin`} />
              <span className={`hidden ${isCompact ? 'md:inline' : 'sm:inline'}`}>Regenerating...</span>
            </>
          ) : (
            <>
              <regenerateIconStyle.IconComponent className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              <span className={`hidden ${isCompact ? 'md:inline' : 'sm:inline'}`}>Regenerate</span>
            </>
          )}
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Status Indicators - hidden in compact mode */}
        {!isCompact && (
          <div className="hidden sm:flex items-center gap-2">
            <InlineLoadingBadge
              isLoading={isSaving}
              text="Saving"
              variant="save"
            />
            <InlineLoadingBadge
              isLoading={isGenerating}
              text="Regenerating"
              variant="regenerate"
            />
          </div>
        )}

        {/* More Actions Dropdown - Tertiary style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size={isCompact ? "xs" : "sm"}
              disabled={isSaving || isGenerating}
              className={`text-buildease-earth-600 dark:text-buildease-earth-400 hover:bg-buildease-earth-50 dark:hover:bg-buildease-earth-950/20 font-medium transition-all duration-200 ${isCompact ? 'px-2 py-1 text-xs h-7' : 'px-3 py-2'}`}
            >
              <moreIconStyle.IconComponent className={`${isCompact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              <span className={`hidden ${isCompact ? 'lg:inline' : 'sm:inline'}`}>More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-lg border-buildease-earth-100/50 dark:border-buildease-earth-800/50">
            <DropdownMenuLabel className="text-construction-subtitle">Plan Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={onDistribute} className="py-2">
              <distributeIconStyle.IconComponent className="h-4 w-4 mr-3 text-buildease-blue-600 dark:text-buildease-blue-400" />
              <div className="flex flex-col">
                <span className="font-medium">Distribute Plan</span>
                <span className="text-xs text-muted-foreground">Share with team members</span>
              </div>
            </DropdownMenuItem>
            
            {onPrint && (
              <DropdownMenuItem onClick={onPrint} className="py-2">
                <printIconStyle.IconComponent className="h-4 w-4 mr-3 text-buildease-earth-600 dark:text-buildease-earth-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Print Plan</span>
                  <span className="text-xs text-muted-foreground">Print physical copy</span>
                </div>
              </DropdownMenuItem>
            )}
            
            {onExportPDF && (
              <DropdownMenuItem onClick={onExportPDF} className="py-2">
                <exportIconStyle.IconComponent className="h-4 w-4 mr-3 text-buildease-earth-600 dark:text-buildease-earth-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Export as PDF</span>
                  <span className="text-xs text-muted-foreground">Download PDF document</span>
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </div>
  );
});

export default PlanActionBar;