import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, MoreHorizontal, CheckSquare } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { TimelineViewProps } from '@/types/plan/views';
import { SortableTimelinePhase } from './SortableTimelinePhase';
import { VirtualizedTimelineView } from './VirtualizedTimelineView';
import { MobileStickyActionBar } from './MobileStickyActionBar';
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

export const TimelineView = React.memo(function TimelineView({ 
  plan, 
  onEditPhase, 
  onAddTask, 
  onEditTask, 
  onEditDates,
  onReorderPhase 
}: TimelineViewProps) {
  // Always declare hooks at the top level
  const [activePhaseId, setActivePhaseId] = React.useState<string | null>(null);

  // Memoized sorted phases to prevent unnecessary re-computation
  const sortedPhases = useMemo(() => {
    return [...plan.phases].sort((a, b) => a.order - b.order);
  }, [plan.phases]);

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

  // Use virtualized timeline for large phase lists (threshold: 15+ phases)
  const shouldUseVirtualization = plan.phases.length > 15;

  if (shouldUseVirtualization) {
    return (
      <VirtualizedTimelineView
        phases={plan.phases}
        onEditPhase={onEditPhase}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onEditDates={onEditDates}
        onReorderPhase={onReorderPhase}
        height={600}
        rowHeight={160}
        virtualizationThreshold={15}
      />
    );
  }

  return (
    <div className="space-y-4">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full"
      >
        <Card className="border shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-xl bg-white dark:bg-gray-900 flex flex-col h-full">
          {/* Sticky Header */}
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-4 sticky top-0 z-20">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              Construction Timeline
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Project phases and milestones</p>
          </CardHeader>
          
          {/* Scrollable Content */}
          <CardContent className="p-6 flex-1 overflow-y-auto max-h-[60vh]">
            <div className="relative">
              {/* Enhanced Timeline line with responsive positioning */}
              <div className="absolute top-0 bottom-0 left-6 sm:left-8 w-1 bg-slate-300 dark:bg-slate-600 rounded-full z-0"></div>

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
                </SortableContext>
                
                {/* Enhanced Drag Overlay for mobile-friendly visual feedback */}
                <DragOverlay>
                  {activePhase && (
                    <div className="opacity-95 transform rotate-1 sm:rotate-2 shadow-2xl ring-2 ring-slate-400 ring-opacity-50 scale-105 sm:scale-100">
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


      {/* Modals are now handled by centralized PlanModalManager */}
    </div>
  );
});