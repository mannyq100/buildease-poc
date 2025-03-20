import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PhaseCard } from '@/components/shared';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { fadeInUpVariants } from '@/lib/animations';
import { Badge } from '@/components/ui/badge';

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
  onAddTask: (phaseId: number, e: React.MouseEvent) => void;
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
    <Card className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden ${className || ''}`}>
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Project Phases</h2>
        <div className="flex space-x-2">
          <Button 
            size="sm"
            variant="outline"
            className="text-[#2B6CB0] border-[#2B6CB0] hover:bg-[#2B6CB0]/10 dark:text-blue-400 dark:border-blue-400/40 dark:hover:bg-blue-400/10"
            onClick={onAddPhase}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Phase
          </Button>
        </div>
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
              phases.map((phase) => (
              <m.div 
                key={phase.id}
                className={`cursor-pointer ${expandedPhase === phase.id ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                onClick={() => onToggleExpand(phase.id)}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12
                  }
                }}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{phase.name}</h3>
                      <Badge 
                        variant={phase.status === 'completed' ? 'success' : phase.status === 'in-progress' ? 'default' : phase.status === 'warning' ? 'destructive' : 'secondary'}
                        className="ml-2"
                      >
                        {phase.status === 'in-progress' ? 'In Progress' : phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[#2B6CB0] hover:bg-[#2B6CB0]/10 dark:text-blue-400 dark:hover:bg-blue-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTask(phase.id, e);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Task
                      </Button>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedPhase === phase.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span>{phase.startDate}</span>
                      <span className="mx-2">→</span>
                      <span>{phase.endDate}</span>
                    </div>
                    <div>
                      <span className="font-medium">{phase.progress}%</span> complete
                    </div>
                  </div>
                  
                  {expandedPhase === phase.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Budget</h4>
                        <div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">{phase.spent}</span>
                          <span className="text-gray-500 dark:text-gray-400 mx-1">of</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">{phase.budget}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[#2B6CB0] border-[#2B6CB0] hover:bg-[#2B6CB0]/10 dark:text-blue-400 dark:border-blue-400/40 dark:hover:bg-blue-400/10 mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPhaseClick(phase.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </m.div>
              )))
            }
          </m.div>
        </LazyMotion>
      </CardContent>
    </Card>
  );
}