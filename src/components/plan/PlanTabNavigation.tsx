/**
 * Plan Tab Navigation Component
 * Reusable tab navigation for construction plan views using compound Tab system
 * Optimized for mobile-first responsive design
 */

import React from 'react';
import { Tabs } from '@/components/ui/compound/TabSystem';
import { PLAN_NAV_ICONS } from '@/utils/plan-icons';
import { PlanActionBar } from './PlanActionBar';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PlanTabNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
  // Plan action props
  isGenerating?: boolean;
  isSaving?: boolean;
  onSave?: (status: 'draft' | 'final') => void;
  onRegenerate?: () => void;
  onDistribute?: () => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
}

const TAB_ITEMS: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: PLAN_NAV_ICONS.overview
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: PLAN_NAV_ICONS.timeline
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: PLAN_NAV_ICONS.materials
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: PLAN_NAV_ICONS.budget
  },
  {
    id: 'team',
    label: 'Team',
    icon: PLAN_NAV_ICONS.team
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: PLAN_NAV_ICONS.documents
  }
];

export const PlanTabNavigation = React.memo(function PlanTabNavigation({
  activeView,
  onViewChange,
  className = '',
  isGenerating,
  isSaving,
  onSave,
  onRegenerate,
  onDistribute,
  onPrint,
  onExportPDF
}: PlanTabNavigationProps) {
  return (
    <div className={`border-b border-buildease-blue-100/50 dark:border-buildease-blue-900/30 bg-buildease-blue-50/20 dark:bg-buildease-blue-950/10 sticky top-0 z-10 shadow-sm backdrop-blur-sm ${className}`}>
      {/* Plan Actions Bar - moved from PageHeader */}
      {(onSave || onRegenerate || onDistribute) && (
        <div className="border-b border-buildease-blue-100/30 dark:border-buildease-blue-900/20">
          <div className="container mx-auto px-3 sm:px-6">
            <PlanActionBar
              isGenerating={isGenerating || false}
              isSaving={isSaving || false}
              onSave={onSave || (() => {})}
              onRegenerate={onRegenerate || (() => {})}
              onDistribute={onDistribute || (() => {})}
              onPrint={onPrint}
              onExportPDF={onExportPDF}
              className="py-2"
            />
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="container mx-auto px-4 sm:px-6">
        <Tabs 
          value={activeView} 
          onValueChange={onViewChange}
          variant="underline"
          size="sm"
          defaultValue="overview"
        >
          <Tabs.List className="overflow-x-auto hide-scrollbar">
            {TAB_ITEMS.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                icon={tab.icon}
                className={`whitespace-nowrap font-medium transition-all duration-200 px-3 py-2 text-xs
                  ${activeView === tab.id 
                    ? 'text-buildease-blue-700 dark:text-buildease-blue-300 border-b-2 border-buildease-blue-600 dark:border-buildease-blue-400 bg-buildease-blue-50/50 dark:bg-buildease-blue-950/20' 
                    : 'text-buildease-earth-600 dark:text-buildease-earth-400 hover:text-buildease-blue-600 dark:hover:text-buildease-blue-400 hover:bg-buildease-blue-50/30 dark:hover:bg-buildease-blue-950/10'
                  }`}
              >
                <div className="flex items-center gap-1.5">
                   <span className="hidden sm:inline text-xs font-medium">{tab.label}</span>
                </div>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      </div>
      
      {/* Professional construction industry accent line */}
      <div className="h-0.5 bg-gradient-to-r from-buildease-blue-300/40 via-buildease-orange-400/40 to-buildease-blue-300/40 dark:from-buildease-blue-600/40 dark:via-buildease-orange-600/40 dark:to-buildease-blue-600/40"></div>
    </div>
  );
});

export default PlanTabNavigation;