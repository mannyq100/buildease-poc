/**
 * LazyPhaseList Component
 * Implements lazy loading for large phase lists with intersection observer
 * Optimized for mobile performance with batched rendering
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { SortablePhaseCard } from './SortablePhaseCard';
import { motion as m, AnimatePresence } from 'framer-motion';
import { LoadingState } from '@/hooks/usePlanLoading';

interface LazyPhaseListProps {
  phases: Phase[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onDeleteTask?: (phaseId: string, taskId: string) => void;
  onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  onEditPhaseDates?: (phaseId: string) => void;
  loadingState?: LoadingState;
  isDragDisabled?: boolean;
  batchSize?: number;
  threshold?: number;
}

export const LazyPhaseList = React.memo(function LazyPhaseList({
  phases,
  onDelete,
  onEdit,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onEditPhaseDates,
  loadingState,
  isDragDisabled = false,
  batchSize = 5, // Render 5 phases at a time for mobile optimization
  threshold = 200 // Start loading when 200px from bottom
}: LazyPhaseListProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize visible phases to prevent unnecessary recalculations
  const visiblePhases = useMemo(() => {
    return phases.slice(0, visibleCount);
  }, [phases, visibleCount]);

  const hasMorePhases = visibleCount < phases.length;

  // Load more phases function
  const loadMorePhases = useCallback(() => {
    if (isLoading || !hasMorePhases) return;

    setIsLoading(true);
    
    // Simulate async loading with small delay for smoother UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + batchSize, phases.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, hasMorePhases, batchSize, phases.length]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!loadingRef.current || !hasMorePhases) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePhases();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loadMorePhases, hasMorePhases, threshold]);

  // Reset visible count when phases change
  useEffect(() => {
    setVisibleCount(Math.min(batchSize, phases.length));
  }, [phases.length, batchSize]);

  if (phases.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="space-y-4">
      <AnimatePresence mode="popLayout">
        {visiblePhases.map((phase, index) => (
          <m.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index >= batchSize ? 0 : index * 0.05,
              ease: "easeOut"
            }}
            layout
          >
            <SortablePhaseCard
              phase={phase}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onAddMaterial={onAddMaterial}
              onEditMaterial={onEditMaterial}
              onDeleteMaterial={onDeleteMaterial}
              onEditPhaseDates={onEditPhaseDates}
              loadingState={loadingState}
              isDragDisabled={isDragDisabled}
            />
          </m.div>
        ))}
      </AnimatePresence>

      {/* Loading trigger and indicator */}
      {hasMorePhases && (
        <div
          ref={loadingRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading ? (
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 text-buildease-blue-600 dark:text-buildease-blue-400"
            >
              <div className="w-6 h-6 border-2 border-buildease-blue-600/30 border-t-buildease-blue-600 rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading more phases...</span>
            </m.div>
          ) : (
            <button
              onClick={loadMorePhases}
              className="px-6 py-3 bg-buildease-blue-50/80 dark:bg-buildease-blue-950/40 hover:bg-buildease-blue-100/80 dark:hover:bg-buildease-blue-900/40 text-buildease-blue-700 dark:text-buildease-blue-300 rounded-lg border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 transition-all duration-200 hover:shadow-md backdrop-blur-sm font-medium text-sm"
            >
              Load {Math.min(batchSize, phases.length - visibleCount)} more phases
            </button>
          )}
        </div>
      )}

      {/* Performance hint for development */}
      {process.env.NODE_ENV === 'development' && phases.length > 10 && (
        <div className="mt-4 p-3 bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Performance:</strong> Lazy loading {visibleCount}/{phases.length} phases 
            (batch size: {batchSize})
          </p>
        </div>
      )}
    </div>
  );
});

export default LazyPhaseList;