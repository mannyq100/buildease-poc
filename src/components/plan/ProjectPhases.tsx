import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit2, PlusCircle, AlertCircle } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { PhaseFormModal, TaskFormModal, Phase as ModalPhase, Task as ModalTask } from '@/components/shared/modals';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePhaseModal, useTaskModal } from '@/stores/modalStore';

// Sample data for phases
const projectPhases = [
  {
    id: 'phase-1',
    name: 'Site Preparation & Foundation',
    duration: '6 weeks',
    budget: '₵30,000',
    team: 5,
    tasks: 12,
    status: 'optimized' as const,
    taskItems: [
      {
        id: 'task-1-1',
        name: 'Site clearing and leveling',
        duration: '1 week',
        status: 'completed' as const
      },
      {
        id: 'task-1-2',
        name: 'Soil testing and analysis',
        duration: '3 days',
        status: 'completed' as const
      },
      {
        id: 'task-1-3',
        name: 'Foundation excavation',
        duration: '1 week',
        status: 'in-progress' as const
      },
      {
        id: 'task-1-4',
        name: 'Foundation reinforcement',
        duration: '1 week',
        status: 'pending' as const
      },
      {
        id: 'task-1-5',
        name: 'Concrete pouring and curing',
        duration: '2 weeks',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-1-1',
        name: 'Portland cement',
        quantity: '120',
        unit: 'bags',
        status: 'delivered' as const
      },
      {
        id: 'mat-1-2',
        name: 'Sand',
        quantity: '15',
        unit: 'cubic meters',
        status: 'delivered' as const
      },
      {
        id: 'mat-1-3',
        name: 'Gravel',
        quantity: '20',
        unit: 'cubic meters',
        status: 'ordered' as const
      },
      {
        id: 'mat-1-4',
        name: 'Steel reinforcement bars',
        quantity: '2.5',
        unit: 'tons',
        status: 'not-ordered' as const
      }
    ]
  },
  {
    id: 'phase-2',
    name: 'Structural Work',
    duration: '12 weeks',
    budget: '₵45,000',
    team: 8,
    tasks: 15,
    status: 'warning' as const,
    warning: 'Consider additional skilled labor',
    taskItems: [
      {
        id: 'task-2-1',
        name: 'Column and beam framing',
        duration: '3 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-2',
        name: 'Wall construction - Ground floor',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-3',
        name: 'First floor slab construction',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-4',
        name: 'Wall construction - First floor',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-2-5',
        name: 'Staircase construction',
        duration: '1 week',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-2-1',
        name: 'Concrete blocks (6-inch)',
        quantity: '3,200',
        unit: 'pieces',
        status: 'ordered' as const
      },
      {
        id: 'mat-2-2',
        name: 'Portland cement',
        quantity: '280',
        unit: 'bags',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-2-3',
        name: 'Steel reinforcement bars',
        quantity: '4',
        unit: 'tons',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-2-4',
        name: 'Sand',
        quantity: '28',
        unit: 'cubic meters',
        status: 'not-ordered' as const
      }
    ]
  },
  {
    id: 'phase-3',
    name: 'Roofing & Exterior',
    duration: '8 weeks',
    budget: '₵35,000',
    team: 6,
    tasks: 10,
    status: 'optimized' as const,
    taskItems: [
      {
        id: 'task-3-1',
        name: 'Roof truss installation',
        duration: '1 week',
        status: 'pending' as const
      },
      {
        id: 'task-3-2',
        name: 'Roof sheeting and flashing',
        duration: '1 week',
        status: 'pending' as const
      },
      {
        id: 'task-3-3',
        name: 'External rendering and plastering',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-3-4',
        name: 'External painting and finishing',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-3-5',
        name: 'External door and window installation',
        duration: '1 week',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-3-1',
        name: 'Roof timbers (treated)',
        quantity: '250',
        unit: 'meters',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-3-2',
        name: 'Metal roofing sheets',
        quantity: '85',
        unit: 'sheets',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-3-3',
        name: 'Aluminum windows',
        quantity: '18',
        unit: 'pieces',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-3-4',
        name: 'External doors',
        quantity: '6',
        unit: 'pieces',
        status: 'not-ordered' as const
      }
    ]
  },
  {
    id: 'phase-4',
    name: 'Interior & Finishing',
    duration: '10 weeks',
    budget: '₵38,000',
    team: 7,
    tasks: 14,
    status: 'optimized' as const,
    taskItems: [
      {
        id: 'task-4-1',
        name: 'Internal wall plastering',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-2',
        name: 'Electrical wiring and fixtures',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-3',
        name: 'Plumbing installations',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-4',
        name: 'Flooring installation',
        duration: '2 weeks',
        status: 'pending' as const
      },
      {
        id: 'task-4-5',
        name: 'Interior painting and decoration',
        duration: '2 weeks',
        status: 'pending' as const
      }
    ],
    materialItems: [
      {
        id: 'mat-4-1',
        name: 'Ceramic floor tiles',
        quantity: '180',
        unit: 'square meters',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-2',
        name: 'Electrical cables and fixtures',
        quantity: '1',
        unit: 'lot',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-3',
        name: 'Plumbing pipes and fixtures',
        quantity: '1',
        unit: 'lot',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-4',
        name: 'Interior doors',
        quantity: '12',
        unit: 'pieces',
        status: 'not-ordered' as const
      },
      {
        id: 'mat-4-5',
        name: 'Interior paint',
        quantity: '80',
        unit: 'liters',
        status: 'not-ordered' as const
      }
    ]
  }
];

const ProjectPhases = () => {
  const [phases, setPhases] = useState(projectPhases);
  
  // Use Zustand modal hooks
  const phaseModal = usePhaseModal();
  const taskModal = useTaskModal();
  
  
  const handleOpenAddPhaseModal = () => {
    phaseModal.actions.open(undefined, true);
  };

  const handleSavePhase = (savedPhase: ModalPhase) => {
    if (phaseModal.isNew) {
      // Add new phase
      const phaseId = `phase-${Date.now()}`;
      const newPhaseData = {
        id: phaseId,
        name: savedPhase.name,
        duration: savedPhase.startDate && savedPhase.endDate 
          ? `${Math.ceil((new Date(savedPhase.endDate).getTime() - new Date(savedPhase.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
          : 'TBD',
        budget: '₵0', // Default budget
        team: 1, // Default team size
        tasks: 0,
        status: savedPhase.status === 'pending' ? 'optimized' : 'warning',
        taskItems: [],
        materialItems: []
      };
      
      setPhases(prev => [...prev, newPhaseData]);
      toast({
        title: "Phase Added",
        description: `${savedPhase.name} has been added to your project.`,
      });
    } else {
      // Update existing phase
      setPhases(prev => prev.map(phase => {
        if (phase.id === savedPhase.id) {
          return {
            ...phase,
            name: savedPhase.name,
            duration: savedPhase.startDate && savedPhase.endDate 
              ? `${Math.ceil((new Date(savedPhase.endDate).getTime() - new Date(savedPhase.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
              : phase.duration,
          };
        }
        return phase;
      }));
      toast({
        title: "Phase Updated",
        description: `${savedPhase.name} has been updated.`,
      });
    }
    phaseModal.actions.close();
  };
  
  const handleSaveTask = (savedTask: ModalTask) => {
    const phaseId = savedTask.phaseId;
    if (!phaseId) return;
    
    if (taskModal.isNew) {
      // Add new task
      const taskId = `task-${Date.now()}`;
      const newTaskData = {
        id: taskId,
        name: savedTask.name,
        duration: savedTask.startDate && savedTask.endDate 
          ? `${Math.ceil((new Date(savedTask.endDate).getTime() - new Date(savedTask.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
          : 'TBD',
        status: savedTask.status
      };
      
      setPhases(prev => prev.map(phase => {
        if (phase.id === phaseId) {
          const updatedTaskItems = [...phase.taskItems, newTaskData];
          return {
            ...phase,
            tasks: updatedTaskItems.length,
            taskItems: updatedTaskItems
          };
        }
        return phase;
      }));
      
      toast({
        title: "Task Added",
        description: `${savedTask.name} has been added to the phase.`,
      });
    } else {
      // Update existing task
      setPhases(prev => prev.map(phase => {
        if (phase.id === phaseId) {
          const updatedTaskItems = phase.taskItems.map(task => 
            task.id === savedTask.id 
              ? {
                  ...task,
                  name: savedTask.name,
                  duration: savedTask.startDate && savedTask.endDate 
                    ? `${Math.ceil((new Date(savedTask.endDate).getTime() - new Date(savedTask.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                    : task.duration,
                  status: savedTask.status
                }
              : task
          );
          return {
            ...phase,
            taskItems: updatedTaskItems
          };
        }
        return phase;
      }));
      
      toast({
        title: "Task Updated",
        description: `${savedTask.name} has been updated.`,
      });
    }
    taskModal.actions.close();
  };
  
  const openAddTaskDialog = (phaseId: string) => {
    taskModal.actions.open(undefined, phaseId, true);
  };
  
  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 shadow-sm">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#2B6CB0] dark:text-[#93C5FD]" />
            <span className="text-xl text-gray-900 dark:text-white">Generated Project Phases</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-[#2B6CB0] text-[#2B6CB0] hover:bg-[#2B6CB0]/10 dark:border-[#93C5FD] dark:text-[#93C5FD] dark:hover:bg-[#93C5FD]/10"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Adjust Phases
            </Button>
            <Button 
              size="sm" 
              onClick={handleOpenAddPhaseModal}
              className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {phases.map((phase) => (
          <div key={phase.id} className="relative group">
            <PhaseCard 
              name={phase.name}
              duration={phase.duration}
              budget={phase.budget}
              team={phase.team}
              tasks={phase.tasks}
              status={phase.status}
              warning={phase.warning}
              taskItems={phase.taskItems}
              materialItems={phase.materialItems}
            />
            <div className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => openAddTaskDialog(phase.id)}
                      className="w-8 h-8 rounded-full bg-[#ED8936]/10 text-[#ED8936] hover:bg-[#ED8936]/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add task to this phase</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
        
        {phases.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No phases have been created yet</p>
            <Button 
              className="mt-4 bg-[#ED8936] hover:bg-[#ED8936]/90 text-white"
              onClick={handleOpenAddPhaseModal}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Your First Phase
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Shared Modals */}
      <PhaseFormModal
        show={phaseModal.isOpen}
        onClose={phaseModal.actions.close}
        onSave={handleSavePhase}
        phase={phaseModal.data}
        isNew={phaseModal.isNew}
        currentOrder={phases.length}
        statuses={['planning', 'in-progress', 'on-hold', 'completed']}
      />
      
      <TaskFormModal
        show={taskModal.isOpen}
        onClose={taskModal.actions.close}
        onSave={handleSaveTask}
        task={taskModal.data}
        isNew={taskModal.isNew}
        teamMembers={[]}
        phaseId={taskModal.data?.phaseId || ''}
      />
    </Card>
  );
};

export default ProjectPhases;
