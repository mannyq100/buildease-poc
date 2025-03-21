import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { PhaseCard } from '../phases/PhaseCard';
import { PhaseDetailsPanel } from '@/components/project/PhaseDetailsPanel';
import { Phase } from '@/types/phase';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { fadeInUpVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ProjectPhasesSectionProps {
  phases: Phase[];
  expandedPhase: number | null;
  onToggleExpand: (phaseId: number) => void;
  onPhaseClick: (phaseId: number) => void;
  onAddTask: (phaseId: number, e: React.MouseEvent) => void;
  onAddPhase: () => void;
  className?: string;
}

/**
 * ProjectPhasesSection - Displays the list of project phases with actions
 * Enhanced to show detailed phase information with tabs when expanded
 */
export function ProjectPhasesSection({
  phases,
  expandedPhase,
  onToggleExpand,
  onPhaseClick,
  onAddTask,
  onAddPhase,
  className
}: ProjectPhasesSectionProps) {
  return (
    <Card className={cn(
      "bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-6">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Phases</CardTitle>
        <Button
          size="sm"
          className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-white hover:bg-blue-50 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 shadow-sm"
          onClick={onAddPhase}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Phase
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <LazyMotion features={domAnimation}>
          <m.div
            className="divide-y divide-slate-200 dark:divide-slate-700"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            {phases.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No phases have been added to this project yet.</p>
                <Button 
                  onClick={onAddPhase}
                  className="bg-[#2B6CB0] hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add First Phase
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 p-4">
                {phases.map((phase) => (
                  <div key={phase.id} className="space-y-4">
                    <PhaseCard 
                      phase={phase}
                      isExpanded={expandedPhase === phase.id}
                      onExpandToggle={onToggleExpand}
                      onViewDetails={onPhaseClick}
                      onAddTask={(e) => onAddTask(phase.id, e)}
                      className={expandedPhase === phase.id ? 
                        "ring-2 ring-blue-500/30 dark:ring-blue-500/20 shadow-md" : 
                        ""}
                    />
                    
                    {/* Render phase details panel if this phase is expanded */}
                    {expandedPhase === phase.id && (
                      <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PhaseDetailsPanel 
                          phaseId={phase.id}
                          onClose={() => onToggleExpand(phase.id)}
                        />
                      </m.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </m.div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}