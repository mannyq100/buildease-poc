/**
 * EntityActionBar Component
 * Reusable action bar with consistent spacing and layout
 * For grouping multiple action buttons together
 */

import React from 'react';
import { AddPhaseButton } from './AddPhaseButton';
import { EditPhaseAction } from './EditPhaseAction';
import { DeletePhaseAction } from './DeletePhaseAction';

interface EntityActionBarProps {
  /** Actions to display in the bar */
  children: React.ReactNode;
  
  /** Alignment of actions */
  align?: 'left' | 'center' | 'right' | 'between';
  
  /** Spacing between actions */
  spacing?: 'tight' | 'normal' | 'loose';
  
  /** Custom className */
  className?: string;
}

export function EntityActionBar({
  children,
  align = 'right',
  spacing = 'normal',
  className = ''
}: EntityActionBarProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between'
  };

  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-4'
  };

  return (
    <div className={`flex items-center ${alignmentClasses[align]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}

// Pre-configured action bars for common use cases

interface PhaseActionBarProps {
  phaseId: string;
  phaseName?: string;
  planId?: string;
  onEditPhase: (phaseId: string) => void;
  onDeletePhase: (phaseId: string) => void;
  onAddPhase?: (planId?: string) => void;
  showAddPhase?: boolean;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function PhaseActionBar({
  phaseId,
  phaseName,
  planId,
  onEditPhase,
  onDeletePhase,
  onAddPhase,
  showAddPhase = false,
  align = 'right',
  className = ''
}: PhaseActionBarProps) {
  return (
    <EntityActionBar align={align} className={className}>
      {showAddPhase && onAddPhase && (
        <AddPhaseButton
          onAddPhase={onAddPhase}
          planId={planId}
          variant="outline"
          size="sm"
        />
      )}
      <EditPhaseAction
        onEditPhase={onEditPhase}
        phaseId={phaseId}
      />
      <DeletePhaseAction
        onDeletePhase={onDeletePhase}
        phaseId={phaseId}
        phaseName={phaseName}
      />
    </EntityActionBar>
  );
}

interface HeaderActionBarProps {
  title: string;
  onAdd?: () => void;
  addButtonText?: string;
  addButtonIcon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  className?: string;
}

export function HeaderActionBar({
  title,
  onAdd,
  addButtonText = 'Add',
  addButtonIcon,
  children,
  className = ''
}: HeaderActionBarProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <EntityActionBar align="right">
        {children}
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#2B6CB0] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/20 transition-colors"
          >
            {addButtonIcon && React.createElement(addButtonIcon, { className: "h-4 w-4 mr-2" })}
            {addButtonText}
          </button>
        )}
      </EntityActionBar>
    </div>
  );
}