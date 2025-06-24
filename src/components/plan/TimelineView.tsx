import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit, Plus, CalendarDays, CheckCircle, Circle, AlertCircle, Pause } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { getTimelineStatusColor, getTimelineTextColor, getStatusText } from '@/utils/plan-helpers';
import { TimelineViewProps } from '@/types/plan/views';

export const TimelineView = React.memo(function TimelineView({ plan, onEditPhase, onAddTask, onEditTask, onEditDates }: TimelineViewProps) {
  // Memoized sorted phases to prevent unnecessary re-computation
  const sortedPhases = useMemo(() => {
    return [...plan.phases].sort((a, b) => a.order - b.order);
  }, [plan.phases]);

  // No local modal management - using centralized PlanModalManager

  // Using shared utility functions from @/utils/plan-helpers

  // Status icon selector
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in-progress':
        return Circle;
      case 'delayed':
        return AlertCircle;
      case 'on-hold':
        return Pause;
      default:
        return Circle;
    }
  };


  // Simplified handlers that delegate to centralized modal management
  const handleEditPhase = (phaseId: string) => {
    onEditPhase?.(phaseId);
  };

  const handleEditTask = (phaseId: string, taskId: string) => {
    onEditTask?.(phaseId, taskId);
  };

  const handleEditDates = (phaseId: string) => {
    onEditDates?.(phaseId);
  };

  const handleAddTask = (phaseId: string) => {
    onAddTask?.(phaseId);
  };

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
            </CardTitle>
            <p className="text-buildease-blue-600/70 dark:text-buildease-blue-400/70 text-sm mt-1">Project phases and milestones</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative">
              {/* Enhanced Timeline line */}
              <div className="absolute top-0 bottom-0 left-8 w-1 bg-gradient-to-b from-buildease-blue-300/60 via-buildease-orange-400/60 to-buildease-blue-300/60 dark:from-buildease-blue-600/60 dark:via-buildease-orange-600/60 dark:to-buildease-blue-600/60 rounded-full z-0"></div>

              <div className="space-y-6 relative z-10">
                {sortedPhases.map((phase, index) => (
                  <m.div 
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex relative"
                  >
                    <div className="flex-shrink-0 relative">
                      <div className={`h-16 w-16 rounded-full ${getTimelineStatusColor(phase.status)} border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center relative z-10`}>
                        <div className="flex flex-col items-center">
                          <span className={`font-bold text-xs ${getTimelineTextColor(phase.status)}`}>{phase.order}</span>
                          {React.createElement(getStatusIcon(phase.status), {
                            className: `h-4 w-4 ${getTimelineTextColor(phase.status)} mt-0.5`
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 mt-1 w-full">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-buildease-blue-100/50 dark:border-buildease-blue-800/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center mb-1">
                              {phase.name}
                              <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${getTimelineStatusColor(phase.status)} ${getTimelineTextColor(phase.status)} shadow-sm`}>
                                {getStatusText(phase.status)}
                              </span>
                            </h3>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditPhase(phase.id.toString())}
                              className="h-8 px-3 text-buildease-orange-600 dark:text-buildease-orange-400 hover:text-buildease-orange-700 dark:hover:text-buildease-orange-300 hover:bg-buildease-orange-50 dark:hover:bg-buildease-orange-900/20 rounded-md transition-all duration-200"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden sm:inline text-xs">Edit</span>
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-buildease-earth-700 dark:text-buildease-earth-300 mb-4 leading-relaxed">{phase.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <div className="flex items-center bg-buildease-blue-50 dark:bg-buildease-blue-900/30 px-3 py-2 rounded-lg">
                            <Clock className="h-4 w-4 mr-2 text-buildease-blue-600 dark:text-buildease-blue-400" />
                            <span className="text-xs font-semibold text-buildease-blue-800 dark:text-buildease-blue-200">{phase.duration}</span>
                          </div>
                          {phase.startDate && phase.endDate && (
                            <div className="flex items-center bg-buildease-earth-50 dark:bg-buildease-earth-900/30 px-3 py-2 rounded-lg group cursor-pointer hover:bg-buildease-earth-100 dark:hover:bg-buildease-earth-800/50 transition-colors duration-200" onClick={() => handleEditDates(phase.id.toString())}>
                              <CalendarDays className="h-4 w-4 mr-2 text-buildease-earth-600 dark:text-buildease-earth-400 group-hover:text-buildease-orange-600 dark:group-hover:text-buildease-orange-400" />
                              <span className="text-xs font-semibold text-buildease-earth-800 dark:text-buildease-earth-200 group-hover:text-buildease-orange-700 dark:group-hover:text-buildease-orange-300">
                                {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center bg-status-completed/10 dark:bg-status-completed/20 px-3 py-2 rounded-lg">
                            <CheckCircle className="h-4 w-4 mr-2 text-status-completed" />
                            <span className="text-xs font-semibold text-status-completed">{phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length} tasks</span>
                          </div>
                        </div>

                        {/* Enhanced Tasks preview */}
                        {phase.tasks.length > 0 && (
                          <div className="border-t border-buildease-blue-100/50 dark:border-buildease-blue-800/50 pt-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-buildease-blue-600 dark:text-buildease-blue-400" />
                                Phase Tasks ({phase.tasks.length})
                              </h4>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAddTask(phase.id.toString())}
                                className="h-7 px-3 text-xs border-buildease-orange-200 dark:border-buildease-orange-700 text-buildease-orange-600 dark:text-buildease-orange-400 hover:bg-buildease-orange-50 dark:hover:bg-buildease-orange-900/20 rounded-md shadow-sm transition-all duration-200"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Add Task</span>
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {phase.tasks.slice(0, 6).map(task => (
                                <div
                                  key={task.id} 
                                  className="text-xs px-3 py-2 bg-buildease-earth-50/60 dark:bg-buildease-earth-900/30 text-buildease-earth-800 dark:text-buildease-earth-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-buildease-earth-100/80 dark:hover:bg-buildease-earth-800/50 transition-all duration-200 border border-buildease-earth-200/60 dark:border-buildease-earth-800/60 group"
                                  onClick={() => handleEditTask(phase.id.toString(), task.id.toString())}
                                >
                                  <span className="font-medium truncate flex-1">{task.name}</span>
                                  <div className="flex items-center gap-1 ml-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      task.status === 'completed' ? 'bg-status-completed' :
                                      task.status === 'in-progress' ? 'bg-status-in-progress' :
                                      'bg-status-pending'
                                    }`}></span>
                                    <Edit className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
                                  </div>
                                </div>
                              ))}
                              {phase.tasks.length > 6 && (
                                <div className="text-xs px-3 py-2 bg-buildease-earth-100/60 dark:bg-buildease-earth-900/30 text-buildease-earth-600 dark:text-buildease-earth-400 rounded-lg flex items-center justify-center border border-dashed border-buildease-earth-300/60 dark:border-buildease-earth-700/60">
                                  +{phase.tasks.length - 6} more tasks
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>

      {/* Modals are now handled by centralized PlanModalManager */}
    </div>
  );
});
