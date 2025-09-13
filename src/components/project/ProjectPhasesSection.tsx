import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { PhaseCard } from '../phases/PhaseCard';
import { Phase } from '@/types/phase';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { fadeInUpVariants } from '@/utils/core/animations';
import { cn } from '@/utils/core/ui';

interface ProjectPhasesSectionProps {
  phases: Phase[];
  onPhaseClick: (phaseId: number) => void;
  onAddTask: (phaseId: number, e: React.MouseEvent) => void;
  onAddPhase: () => void;
  className?: string;
}

/**
 * ProjectPhasesSection - Displays the list of project phases with actions
 */
export function ProjectPhasesSection({
  phases,
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
                  <PhaseCard 
                    key={phase.id}
                    phase={phase}
                    isExpanded={false}
                    onExpandToggle={() => {}}
                    onViewDetails={onPhaseClick}
                    onAddTask={(e) => onAddTask(phase.id, e)}
                  />
                ))}
              </div>
            )}
          </m.div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}