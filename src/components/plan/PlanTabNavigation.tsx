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
    <div className={`border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 sticky top-0 z-10 shadow-md backdrop-blur-sm ${className}`}>
      {/* Plan Actions Bar - moved from PageHeader */}
      {(onSave || onRegenerate || onDistribute) && (
        <div className="border-b border-blue-100 dark:border-blue-800/50">
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
                    ? 'text-blue-900 dark:text-blue-100 border-b-2 border-blue-600 dark:border-blue-400 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
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
      
    </div>
  );
});

export default PlanTabNavigation;