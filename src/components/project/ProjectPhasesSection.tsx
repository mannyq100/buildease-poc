import React from 'react';
import { Plus } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhaseCard } from '@/components/shared';
import { ContentSection } from '@/components/shared/ContentSection';
import { fadeInUpVariants, cardHoverVariants } from '@/lib/animations';

interface Phase {
  id: number
  name: string
  progress: number
  startDate: string
  endDate: string
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning'
  budget: string
  spent: string
}

interface ProjectPhasesSectionProps {
  phases: Phase[];
  expandedPhase: number | null;
  onToggleExpand: (phaseId: number) => void;
  onPhaseClick: (phaseId: number) => void;
  onAddTask: () => void;
  onAddPhase: () => void;
  className?: string;
}

/**
 * ProjectPhasesSection - Displays the list of project phases with actions
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
    <ContentSection
      title="Project Phases"
      variant="default"
      elevation="sm"
      borderRadius="lg"
      className={`shadow-md border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 ${className || ''}`}
      action={
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            className="text-[#1E3A8A] border-[#1E3A8A] hover:bg-[#1E3A8A]/10 dark:text-blue-400 dark:border-blue-400/40 dark:hover:bg-blue-400/10"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
          <Button 
            size="sm"
            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={onAddPhase}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Phase
          </Button>
        </div>
      }
    >
      <LazyMotion features={domAnimation}>
        <div className="space-y-5">
          {phases.map((phase, index) => (
            <m.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={cardHoverVariants}
              className="transition-all"
            >
              <PhaseCard
                name={phase.name}
                progress={phase.progress}
                startDate={phase.startDate}
                endDate={phase.endDate}
                status={phase.status}
                budget={phase.budget}
                spent={phase.spent}
                expanded={expandedPhase === phase.id}
                onToggleExpand={() => onToggleExpand(phase.id)}
                onClick={() => onPhaseClick(phase.id)}
                className="transition-all hover:shadow-md border border-gray-100 dark:border-slate-700"
              />
            </m.div>
          ))}
        </div>
      </LazyMotion>
    </ContentSection>
  );
} 