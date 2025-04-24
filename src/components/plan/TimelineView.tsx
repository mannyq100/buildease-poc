import React, { useState } from 'react';
import { Phase as PlanPhase, ConstructionPlan, Task as PlanTask } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit, Plus, CalendarDays } from 'lucide-react';
import { motion as m } from 'framer-motion';

// Import our shared modal components and their types
import { 
  PhaseFormModal, 
  TaskFormModal, 
  DateEditModal, 
  Phase as ModalPhase, 
  Task as ModalTask
} from '@/components/shared/modals';
import { DateRange } from '@/components/shared/modals/DateEditModal';

interface TimelineViewProps {
  plan: ConstructionPlan;
  onUpdatePhase?: (phase: PlanPhase) => void;
  onUpdateTask?: (task: PlanTask) => void;
  onUpdateDate?: (phaseId: string | number, startDate: string, endDate: string) => void;
}

export function TimelineView({ plan, onUpdatePhase, onUpdateTask, onUpdateDate }: TimelineViewProps) {
  // Sort phases by order
  const sortedPhases = [...plan.phases].sort((a, b) => a.order - b.order);

  // State for modals
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<ModalPhase | null>(null);
  const [currentTask, setCurrentTask] = useState<ModalTask | null>(null);
  const [currentDates, setCurrentDates] = useState<{ phaseId: string | number, startDate: string, endDate: string } | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending':
        return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10';
      case 'in-progress':
        return 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/10';
      case 'completed':
        return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/10';
      case 'delayed':
        return 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30';
    }
  };

  const getTextColor = (status: string) => {
    switch(status) {
      case 'pending':
        return 'text-blue-600 dark:text-blue-400';
      case 'in-progress':
        return 'text-amber-600 dark:text-amber-400';
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'delayed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Convert from PlanPhase to ModalPhase
  const convertToModalPhase = (phase: PlanPhase): ModalPhase => {
    return {
      id: phase.id.toString(),
      name: phase.name,
      description: phase.description,
      status: phase.status as 'pending' | 'in-progress' | 'completed' | 'delayed',
      startDate: phase.startDate || '',
      endDate: phase.endDate || '',
      order: phase.order.toString(),
      tasks: phase.tasks ? phase.tasks.map(t => t.id.toString()) : []
    };
  };

  // Convert from PlanTask to ModalTask
  const convertToModalTask = (task: PlanTask, phaseId: string | number): ModalTask => {
    return {
      id: task.id.toString(),
      name: task.name,
      description: task.description || '',
      status: task.status as 'pending' | 'in-progress' | 'completed' | 'delayed',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      assignedTo: task.assignedTo || [],
      phaseId: phaseId.toString(),
      progress: task.progress || 0,
      dependencies: task.dependencies ? task.dependencies.map(d => d.toString()) : []
    };
  };

  // Convert from ModalPhase back to PlanPhase
  const convertToPlanPhase = (modalPhase: ModalPhase, originalPhase: PlanPhase): PlanPhase => {
    return {
      ...originalPhase,
      id: typeof modalPhase.id === 'string' ? parseInt(modalPhase.id) : modalPhase.id,
      name: modalPhase.name,
      description: modalPhase.description,
      status: modalPhase.status as 'pending' | 'in-progress' | 'completed' | 'delayed',
      startDate: modalPhase.startDate,
      endDate: modalPhase.endDate,
      order: typeof modalPhase.order === 'string' ? parseInt(modalPhase.order) : modalPhase.order
    };
  };

  // Convert from ModalTask back to PlanTask
  const convertToPlanTask = (modalTask: ModalTask, originalTask?: PlanTask): PlanTask => {
    const baseTask: PlanTask = {
      id: modalTask.id ? (typeof modalTask.id === 'string' ? parseInt(modalTask.id) : modalTask.id) : Date.now(),
      name: modalTask.name,
      description: modalTask.description || '',
      status: modalTask.status as 'pending' | 'in-progress' | 'completed' | 'delayed',
      startDate: modalTask.startDate,
      endDate: modalTask.endDate,
      assignedTo: modalTask.assignedTo || [],
      phaseId: typeof modalTask.phaseId === 'string' ? parseInt(modalTask.phaseId) : modalTask.phaseId,
      progress: modalTask.progress,
      dependencies: modalTask.dependencies?.map(d => (typeof d === 'string' ? parseInt(d) : d)) || []
    };
    
    if (originalTask) {
      return { ...originalTask, ...baseTask };
    }
    
    return baseTask;
  };

  // Handler for opening the phase modal
  const handleEditPhase = (phase: PlanPhase) => {
    setCurrentPhase(convertToModalPhase(phase));
    setShowPhaseModal(true);
  };

  // Handler for opening the task modal
  const handleEditTask = (phase: PlanPhase, task: PlanTask) => {
    setCurrentTask(convertToModalTask(task, phase.id));
    setShowTaskModal(true);
  };

  // Handler for opening the date edit modal
  const handleEditDates = (phase: PlanPhase) => {
    setCurrentDates({
      phaseId: phase.id,
      startDate: phase.startDate || '',
      endDate: phase.endDate || ''
    });
    setShowDateModal(true);
  };

  // Handler for adding a new task to a phase
  const handleAddTask = (phase: PlanPhase) => {
    const newTask: ModalTask = {
      id: '',
      name: '',
      description: '',
      status: 'pending',
      startDate: '',
      endDate: '',
      assignedTo: [],
      phaseId: phase.id.toString(),
      progress: 0,
      dependencies: []
    };
    setCurrentTask(newTask);
    setShowTaskModal(true);
  };

  // Handler for saving updated phase
  const handleSavePhase = (updatedModalPhase: ModalPhase) => {
    if (onUpdatePhase && currentPhase) {
      // Find the original phase to merge with updated values
      const originalPhase = sortedPhases.find(p => p.id.toString() === updatedModalPhase.id.toString());
      if (originalPhase) {
        const updatedPhase = convertToPlanPhase(updatedModalPhase, originalPhase);
        onUpdatePhase(updatedPhase);
      }
    }
    setShowPhaseModal(false);
    setCurrentPhase(null);
  };

  // Handler for saving updated task
  const handleSaveTask = (updatedModalTask: ModalTask) => {
    if (onUpdateTask) {
      // Find the original task if it exists
      const phaseId = typeof updatedModalTask.phaseId === 'string' ? 
        parseInt(updatedModalTask.phaseId) : updatedModalTask.phaseId;
      const phase = sortedPhases.find(p => p.id === phaseId);
      const originalTask = phase?.tasks.find(t => t.id.toString() === updatedModalTask.id.toString());
      
      const updatedTask = convertToPlanTask(updatedModalTask, originalTask);
      onUpdateTask(updatedTask);
    }
    setShowTaskModal(false);
    setCurrentTask(null);
  };

  // Handler for saving updated dates
  const handleSaveDates = (dateRange: DateRange) => {
    if (onUpdateDate && currentDates) {
      onUpdateDate(currentDates.phaseId, dateRange.startDate, dateRange.endDate);
    }
    setShowDateModal(false);
    setCurrentDates(null);
  };

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700 pb-3">
            <CardTitle className="text-lg font-semibold text-[#2B6CB0] dark:text-[#93C5FD] flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>

              <div className="space-y-8 relative z-10">
                {sortedPhases.map((phase, index) => (
                  <m.div 
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex relative"
                  >
                    <div className={`flex-shrink-0 h-14 w-14 rounded-full ${getStatusColor(phase.status)} border-2 flex items-center justify-center`}>
                      <span className={`font-bold ${getTextColor(phase.status)}`}>{phase.order}</span>
                    </div>
                    <div className="ml-4 mt-1 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                          {phase.name}
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(phase.status)} ${getTextColor(phase.status)}`}>
                            {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                          </span>
                        </h3>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditPhase(phase)}
                            className="h-8 px-2 text-[#ED8936] hover:text-[#DD6B20] hover:bg-[#ED8936]/10"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{phase.description}</p>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 space-x-4 mt-1 text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{phase.duration}</span>
                        </div>
                        {phase.startDate && phase.endDate && (
                          <div className="flex items-center group cursor-pointer" onClick={() => handleEditDates(phase)}>
                            <CalendarDays className="h-3.5 w-3.5 mr-1 group-hover:text-[#ED8936]" />
                            <span className="group-hover:text-[#ED8936]">
                              {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tasks preview */}
                      {phase.tasks.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Tasks: {phase.tasks.length}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddTask(phase)}
                              className="h-6 px-2 text-[#ED8936] hover:text-[#DD6B20] hover:bg-[#ED8936]/10 rounded-full"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Task
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {phase.tasks.slice(0, 3).map(task => (
                              <span 
                                key={task.id} 
                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleEditTask(phase, task)}
                              >
                                {task.name}
                                <Edit className="h-3 w-3 ml-1 opacity-50" />
                              </span>
                            ))}
                            {phase.tasks.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                                +{phase.tasks.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>

      {/* Render the modals */}
      {currentPhase && (
        <PhaseFormModal
          show={showPhaseModal}
          onClose={() => {
            setShowPhaseModal(false);
            setCurrentPhase(null);
          }}
          onSave={handleSavePhase}
          phase={currentPhase}
          isNew={false}
        />
      )}

      {currentTask && (
        <TaskFormModal
          show={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setCurrentTask(null);
          }}
          onSave={handleSaveTask}
          task={currentTask}
          isNew={!currentTask.id}
        />
      )}

      {currentDates && (
        <DateEditModal
          show={showDateModal}
          onClose={() => {
            setShowDateModal(false);
            setCurrentDates(null);
          }}
          onSave={(dates) => {
            if (currentDates) {
              handleSaveDates(dates);
            }
          }}
          dateRange={{
            startDate: currentDates.startDate,
            endDate: currentDates.endDate,
            type: 'phase'
          }}
          title="Edit Phase Dates"
          description="Update the start and end dates for this phase"
        />
      )}
    </div>
  );
}
