/**
 * VirtualizedTimelineView Component
 * High-performance timeline for large phase lists using react-window
 * Optimized for smooth scrolling with hundreds of phases
 */

import React, { useMemo, useCallback, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, MoreHorizontal, CheckSquare } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { SortableTimelinePhase } from './SortableTimelinePhase';
import { MobileStickyActionBar } from './MobileStickyActionBar';
import { MobileFloatingActionButton } from './MobileFloatingActionButton';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';

interface VirtualizedTimelineViewProps {
  phases: Phase[];
  onEditPhase?: (id: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onEditDates?: (phaseId: string) => void;
  onReorderPhase?: (oldIndex: number, newIndex: number) => void;
  height?: number;
  rowHeight?: number;
  virtualizationThreshold?: number;
}

interface RowData {
  phases: Phase[];
  onEditPhase?: (id: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onEditDates?: (phaseId: string) => void;
  isDragDisabled: boolean;
}

// Optimized timeline phase row component for virtualization
const TimelinePhaseRow = React.memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: RowData;
}) => {
  const { phases, onEditPhase, onAddTask, onEditTask, onEditDates, isDragDisabled } = data;
  const phase = phases[index];

  if (!phase) {
    return <div style={style} />;
  }

  return (
    <div style={style} className="px-6 py-2">
      <SortableTimelinePhase
        phase={phase}
        index={index}
        onEditPhase={onEditPhase}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onEditDates={onEditDates}
        isDragDisabled={isDragDisabled}
      />
    </div>
  );
});

TimelinePhaseRow.displayName = 'TimelinePhaseRow';

export const VirtualizedTimelineView = React.memo(function VirtualizedTimelineView({
  phases,
  onEditPhase,
  onAddTask,
  onEditTask,
  onEditDates,
  onReorderPhase,
  height = 600,
  rowHeight = 160,
  virtualizationThreshold = 20
}: VirtualizedTimelineViewProps) {
  const listRef = useRef<List>(null);
  const [activePhaseId, setActivePhaseId] = React.useState<string | null>(null);

  // Memoized sorted phases to prevent unnecessary re-computation
  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => a.order - b.order);
  }, [phases]);

  // Determine if we should use virtualization
  const shouldUseVirtualization = sortedPhases.length > virtualizationThreshold;

  // Configure sensors for drag and drop with mobile optimization
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start drag after 8px movement
        delay: 100, // Small delay for better mobile UX
        tolerance: 5, // Tolerance for slight finger movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag and drop handlers with mobile haptic feedback
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActivePhaseId(event.active.id as string);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for drag start
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActivePhaseId(null);
    
    if (over && active.id !== over.id) {
      // Find the indices of the phases being reordered
      const oldIndex = sortedPhases.findIndex((phase) => phase.id === active.id);
      const newIndex = sortedPhases.findIndex((phase) => phase.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Haptic feedback for successful reorder on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 10, 30]); // Double pulse for success
        }
        
        // Call the reorder callback with the indices
        onReorderPhase?.(oldIndex, newIndex);
      }
    } else {
      // Light haptic feedback for canceled drag
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  }, [sortedPhases, onReorderPhase]);

  // Get the active phase for drag overlay
  const activePhase = useMemo(() => {
    return activePhaseId ? sortedPhases.find((phase) => phase.id === activePhaseId) : null;
  }, [activePhaseId, sortedPhases]);

  // Memoize the data for the virtual list
  const itemData = useMemo((): RowData => ({
    phases: sortedPhases,
    onEditPhase,
    onAddTask,
    onEditTask,
    onEditDates,
    isDragDisabled: !onReorderPhase
  }), [sortedPhases, onEditPhase, onAddTask, onEditTask, onEditDates, onReorderPhase]);

  // Regular timeline content (non-virtualized)
  const regularTimelineContent = (
    <div className="space-y-4 sm:space-y-6 relative z-10">
      {sortedPhases.map((phase, index) => (
        <SortableTimelinePhase
          key={phase.id}
          phase={phase}
          index={index}
          onEditPhase={onEditPhase}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onEditDates={onEditDates}
          isDragDisabled={!onReorderPhase}
        />
      ))}
    </div>
  );

  // Virtualized timeline content
  const virtualizedTimelineContent = (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30 rounded-lg overflow-hidden shadow-sm bg-white/95 dark:bg-gray-900/95"
    >
      <div className="px-6 py-4 bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 border-b border-buildease-blue-100/50 dark:border-buildease-blue-900/30">
        <h3 className="text-sm font-semibold text-buildease-blue-700 dark:text-buildease-blue-300">
          Timeline View ({sortedPhases.length} phases)
        </h3>
        <p className="text-xs text-buildease-blue-600/70 dark:text-buildease-blue-400/70 mt-1">
          Using virtual scrolling for optimal performance
        </p>
      </div>
      
      <div className="relative">
        {/* Timeline line for virtualized view */}
        <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-1 bg-gradient-to-b from-buildease-blue-300/60 via-buildease-orange-400/60 to-buildease-blue-300/60 dark:from-buildease-blue-600/60 dark:via-buildease-orange-600/60 dark:to-buildease-blue-600/60 rounded-full z-0"></div>
        
        <List
          ref={listRef}
          height={Math.min(height, sortedPhases.length * rowHeight)}
          itemCount={sortedPhases.length}
          itemSize={rowHeight}
          itemData={itemData}
          width="100%"
          className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
        >
          {TimelinePhaseRow}
        </List>
      </div>
    </m.div>
  );

  return (
    <div className="space-y-4">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30 shadow-sm overflow-hidden rounded-lg bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 border-b border-buildease-blue-100/50 dark:border-buildease-blue-900/30 pb-4">
            <CardTitle className="text-lg font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Construction Timeline
              {shouldUseVirtualization && (
                <span className="ml-2 px-2 py-1 bg-buildease-orange-100/80 dark:bg-buildease-orange-900/40 text-buildease-orange-700 dark:text-buildease-orange-300 rounded-md text-xs font-medium">
                  Virtual Scrolling
                </span>
              )}
            </CardTitle>
            <p className="text-buildease-blue-600/70 dark:text-buildease-blue-400/70 text-sm mt-1">Project phases and milestones</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {!shouldUseVirtualization && (
                <>
                  {/* Enhanced Timeline line with responsive positioning */}
                  <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-1 bg-gradient-to-b from-buildease-blue-300/60 via-buildease-orange-400/60 to-buildease-blue-300/60 dark:from-buildease-blue-600/60 dark:via-buildease-orange-600/60 dark:to-buildease-blue-600/60 rounded-full z-0"></div>
                </>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={sortedPhases.map((phase) => phase.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {shouldUseVirtualization ? virtualizedTimelineContent : regularTimelineContent}
                </SortableContext>
                
                {/* Enhanced Drag Overlay for mobile-friendly visual feedback */}
                <DragOverlay>
                  {activePhase && (
                    <div className="opacity-95 transform rotate-1 sm:rotate-2 shadow-2xl ring-2 ring-buildease-orange-400 ring-opacity-50 scale-105 sm:scale-100">
                      <SortableTimelinePhase
                        phase={activePhase}
                        index={0}
                        onEditPhase={onEditPhase}
                        onAddTask={onAddTask}
                        onEditTask={onEditTask}
                        onEditDates={onEditDates}
                        isDragDisabled={true}
                      />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </CardContent>
        </Card>
      </m.div>

      {/* Mobile Navigation Enhancements */}
      <MobileStickyActionBar
        primaryAction={{
          label: 'Add Task',
          icon: Plus,
          onClick: () => {
            // Add task to first phase if available
            if (sortedPhases.length > 0) {
              onAddTask?.(sortedPhases[0].id.toString());
            }
          },
          disabled: !onAddTask || sortedPhases.length === 0
        }}
        secondaryActions={[
          {
            label: 'Quick Actions',
            icon: MoreHorizontal,
            onClick: () => {}, // Handled by FAB
            variant: 'outline'
          }
        ]}
        viewContext="timeline"
        visible={true}
      />

      <MobileFloatingActionButton
        primaryAction={{
          label: 'Timeline Actions',
          icon: Plus,
          onClick: () => {}, // Handled by speed dial
          color: 'blue'
        }}
        secondaryActions={[
          {
            label: 'Add Task',
            icon: CheckSquare,
            onClick: () => {
              if (sortedPhases.length > 0) {
                onAddTask?.(sortedPhases[0].id.toString());
              }
            },
            disabled: !onAddTask || sortedPhases.length === 0,
            color: 'green'
          },
          {
            label: 'Edit Dates',
            icon: Calendar,
            onClick: () => {
              if (sortedPhases.length > 0) {
                onEditDates?.(sortedPhases[0].id.toString());
              }
            },
            disabled: !onEditDates || sortedPhases.length === 0,
            color: 'orange'
          }
        ]}
        visible={true}
        offset={{ bottom: 100, right: 16 }}
      />

      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && shouldUseVirtualization && (
        <div className="mt-4 p-3 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/50 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-300">
            <strong>Performance:</strong> Virtual scrolling enabled for {sortedPhases.length} phases 
            (threshold: {virtualizationThreshold})
          </p>
        </div>
      )}

      {/* Modals are now handled by centralized PlanModalManager */}
    </div>
  );
});

export default VirtualizedTimelineView;