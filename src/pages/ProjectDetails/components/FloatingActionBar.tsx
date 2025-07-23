/**
 * Floating Action Bar optimized for construction workers
 * Provides quick access to critical project actions with touch-friendly design
 */

import React, { useState } from 'react';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { 
  Plus, 
  Phone, 
  PlayCircle,
  X,
  Camera,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/core/ui';

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'emergency';
  isHidden?: boolean;
}

interface FloatingActionBarProps {
  projectId: string;
  onUpdateProgress?: () => void;
  onContactTeam?: () => void;
  onTakePhoto?: () => void;
  onAddNote?: () => void;
  onReportIssue?: () => void;
  className?: string;
}

export function FloatingActionBar({
  projectId,
  onUpdateProgress,
  onContactTeam,
  onTakePhoto,
  onAddNote,
  onReportIssue,
  className
}: FloatingActionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryActions: FloatingAction[] = [
    {
      id: 'update-progress',
      label: 'Update Progress',
      icon: <PlayCircle className="h-5 w-5" />,
      onClick: () => {
        onUpdateProgress?.();
        setIsExpanded(false);
      },
      variant: 'primary'
    },
    {
      id: 'contact-team',
      label: 'Contact Team',
      icon: <Phone className="h-5 w-5" />,
      onClick: () => {
        onContactTeam?.();
        setIsExpanded(false);
      },
      variant: 'secondary'
    }
  ];

  const secondaryActions: FloatingAction[] = [
    {
      id: 'take-photo',
      label: 'Take Photo',
      icon: <Camera className="h-5 w-5" />,
      onClick: () => {
        onTakePhoto?.();
        setIsExpanded(false);
      }
    },
    {
      id: 'add-note',
      label: 'Add Note',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => {
        onAddNote?.();
        setIsExpanded(false);
      }
    },
    {
      id: 'report-issue',
      label: 'Report Issue',
      icon: <AlertTriangle className="h-5 w-5" />,
      onClick: () => {
        onReportIssue?.();
        setIsExpanded(false);
      },
      variant: 'emergency'
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-2 duration-300">
          {/* Secondary Actions */}
          {secondaryActions.map((action) => (
            <div key={action.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border">
                {action.label}
              </span>
              <TouchOptimizedButton
                touchSize="lg"
                variant={action.variant === 'emergency' ? 'destructive' : 'outline'}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg border-2",
                  action.variant === 'emergency' && "bg-red-500 hover:bg-red-600 border-red-600 text-white"
                )}
                onClick={action.onClick}
              >
                {action.icon}
              </TouchOptimizedButton>
            </div>
          ))}

          {/* Primary Actions */}
          {primaryActions.map((action) => (
            <div key={action.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border">
                {action.label}
              </span>
              <TouchOptimizedButton
                touchSize="lg"
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg border-2",
                  action.variant === 'primary' && "bg-buildease-blue-600 hover:bg-buildease-blue-700 border-buildease-blue-600"
                )}
                onClick={action.onClick}
              >
                {action.icon}
              </TouchOptimizedButton>
            </div>
          ))}
        </div>
      )}

      {/* Main Action Button */}
      <TouchOptimizedButton
        touchSize="xl"
        variant="default"
        className={cn(
          "h-14 w-14 rounded-full shadow-xl border-2 border-buildease-blue-600 bg-buildease-blue-600 hover:bg-buildease-blue-700 transition-all duration-300",
          isExpanded && "rotate-45"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </TouchOptimizedButton>
    </div>
  );
}