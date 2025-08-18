/**
 * AutoTransitionIndicator - Visual indicator for automatic phase transitions
 * Shows a subtle animation when phase status changes automatically
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Zap, CheckCircle2, PlayCircle, RotateCcw } from 'lucide-react';

interface AutoTransitionIndicatorProps {
  isVisible: boolean;
  transitionType: 'started' | 'completed' | 'reopened';
  onAnimationComplete?: () => void;
  className?: string;
}

export function AutoTransitionIndicator({
  isVisible,
  transitionType,
  onAnimationComplete,
  className
}: AutoTransitionIndicatorProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      
      // Auto-hide after animation
      const timeout = setTimeout(() => {
        setShouldShow(false);
        onAnimationComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, onAnimationComplete]);

  if (!shouldShow) return null;

  const config = {
    started: {
      icon: PlayCircle,
      color: 'text-buildease-blue-600',
      bgColor: 'bg-buildease-blue-50',
      borderColor: 'border-buildease-blue-200',
      label: 'Auto-started'
    },
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Auto-completed'
    },
    reopened: {
      icon: RotateCcw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      label: 'Auto-reopened'
    }
  };

  const { icon: Icon, color, bgColor, borderColor, label } = config[transitionType];

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300',
        'animate-in fade-in slide-in-from-top-2',
        bgColor,
        borderColor,
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Zap className="h-3 w-3 text-yellow-500 animate-pulse" />
        <Icon className={cn('h-4 w-4', color)} />
        <span className={cn('text-sm font-medium', color)}>
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Hook to manage auto-transition indicator state
 */
export function useAutoTransitionIndicator() {
  const [indicators, setIndicators] = useState<Map<string, {
    type: 'started' | 'completed' | 'reopened';
    timestamp: number;
  }>>(new Map());

  const showIndicator = React.useCallback((
    phaseId: string, 
    type: 'started' | 'completed' | 'reopened'
  ) => {
    setIndicators(prev => new Map(prev).set(phaseId, {
      type,
      timestamp: Date.now()
    }));
  }, []);

  const hideIndicator = React.useCallback((phaseId: string) => {
    setIndicators(prev => {
      const newMap = new Map(prev);
      newMap.delete(phaseId);
      return newMap;
    });
  }, []);

  const getIndicator = React.useCallback((phaseId: string) => {
    return indicators.get(phaseId);
  }, [indicators]);

  return {
    showIndicator,
    hideIndicator,
    getIndicator
  };
}