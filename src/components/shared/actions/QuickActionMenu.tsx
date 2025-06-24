/**
 * QuickActionMenu Component
 * Reusable dropdown menu with common CRUD actions
 * Integrates with existing shared modals
 */

import React from 'react';
import { MoreVertical, Edit, Trash2, Plus, Copy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfirmation } from '@/hooks/useConfirmation';

interface ActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface QuickActionMenuProps {
  /** Array of action items to display */
  actions: ActionItem[];
  
  /** Custom trigger button */
  trigger?: React.ReactNode;
  
  /** Whether the menu is disabled */
  disabled?: boolean;
  
  /** Custom className for the trigger */
  className?: string;
}

export function QuickActionMenu({
  actions,
  trigger,
  disabled = false,
  className = ''
}: QuickActionMenuProps) {
  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${className}`}
      disabled={disabled}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <React.Fragment key={index}>
              <DropdownMenuItem
                onClick={action.onClick}
                disabled={action.disabled}
                className={`cursor-pointer ${
                  action.variant === 'destructive' 
                    ? 'text-red-600 focus:text-red-700 focus:bg-red-50' 
                    : ''
                }`}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
              {/* Add separator before destructive actions */}
              {action.variant === 'destructive' && index < actions.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Pre-configured quick action menus for common entities

interface PhaseQuickActionsProps {
  phaseId: string;
  phaseName?: string;
  onEditPhase: (phaseId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onAddTask?: (phaseId: string) => void;
  onAddMaterial?: (phaseId: string) => void;
  onEditDates?: (phaseId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PhaseQuickActions({
  phaseId,
  phaseName,
  onEditPhase,
  onDeletePhase,
  onAddTask,
  onAddMaterial,
  onEditDates,
  disabled = false,
  className = ''
}: PhaseQuickActionsProps) {
  const { confirmDelete } = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await confirmDelete(
      'Delete Phase',
      `Are you sure you want to delete ${phaseName ? `"${phaseName}"` : 'this phase'}? This action cannot be undone and will also delete all tasks and materials in this phase.`,
      'Delete Phase'
    );
    
    if (confirmed) {
      onDeletePhase(phaseId);
    }
  };

  const actions: ActionItem[] = [
    {
      label: 'Edit Phase',
      icon: Edit,
      onClick: () => onEditPhase(phaseId)
    },
    ...(onEditDates ? [{
      label: 'Edit Dates',
      icon: Calendar,
      onClick: () => onEditDates(phaseId)
    }] : []),
    ...(onAddTask ? [{
      label: 'Add Task',
      icon: Plus,
      onClick: () => onAddTask(phaseId)
    }] : []),
    ...(onAddMaterial ? [{
      label: 'Add Material',
      icon: Plus,
      onClick: () => onAddMaterial(phaseId)
    }] : []),
    {
      label: 'Delete Phase',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'destructive' as const
    }
  ];

  return (
    <QuickActionMenu
      actions={actions}
      disabled={disabled}
      className={className}
    />
  );
}

interface TaskQuickActionsProps {
  taskId: string;
  phaseId: string;
  taskName?: string;
  onEditTask: (phaseId: string, taskId: string) => void;
  onDeleteTask: (phaseId: string, taskId: string) => void;
  onDuplicateTask?: (phaseId: string, taskId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TaskQuickActions({
  taskId,
  phaseId,
  taskName,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  disabled = false,
  className = ''
}: TaskQuickActionsProps) {
  const { confirmDelete } = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await confirmDelete(
      'Delete Task',
      `Are you sure you want to delete ${taskName ? `"${taskName}"` : 'this task'}? This action cannot be undone.`,
      'Delete Task'
    );
    
    if (confirmed) {
      onDeleteTask(phaseId, taskId);
    }
  };

  const actions: ActionItem[] = [
    {
      label: 'Edit Task',
      icon: Edit,
      onClick: () => onEditTask(phaseId, taskId)
    },
    ...(onDuplicateTask ? [{
      label: 'Duplicate Task',
      icon: Copy,
      onClick: () => onDuplicateTask(phaseId, taskId)
    }] : []),
    {
      label: 'Delete Task',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'destructive' as const
    }
  ];

  return (
    <QuickActionMenu
      actions={actions}
      disabled={disabled}
      className={className}
    />
  );
}