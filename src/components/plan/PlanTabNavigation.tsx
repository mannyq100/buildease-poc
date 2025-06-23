/**
 * Plan Tab Navigation Component
 * Reusable tab navigation for construction plan views using compound Tab system
 * Optimized for mobile-first responsive design
 */

import React from 'react';
import { Tabs } from '@/components/ui/compound/TabSystem';
import { 
  Home, 
  Calendar, 
  Package, 
  DollarSign, 
  Users, 
  FileText 
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PlanTabNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const TAB_ITEMS: TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: Calendar
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: Package
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: DollarSign
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText
  }
];

export const PlanTabNavigation = React.memo(function PlanTabNavigation({
  activeView,
  onViewChange,
  className = ''
}: PlanTabNavigationProps) {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <Tabs 
          value={activeView} 
          onValueChange={onViewChange}
          variant="underline"
          size="md"
          defaultValue="overview"
        >
          <Tabs.List className="overflow-x-auto hide-scrollbar">
            {TAB_ITEMS.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                icon={tab.icon}
                className="whitespace-nowrap"
              >
                <span className="hidden sm:inline">{tab.label}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      </div>
    </div>
  );
});

export default PlanTabNavigation;