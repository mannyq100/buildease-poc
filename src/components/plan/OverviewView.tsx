import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Package, CheckSquare, Layers, FileText, Plus, Calendar, BarChart } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { motion } from 'framer-motion';
import { formatDate, containerVariants, itemVariants } from '@/utils/plan-helpers';
import { OverviewViewProps } from '@/types/plan/views';

export const OverviewView = React.memo(function OverviewView({ 
  plan, 
  onEditPhase, 
  onDeletePhase, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onReorderPhase: _onReorderPhase,
  onAddPhase,
  onEditProjectDates,
  onEditPhaseDates,
  viewMode: _viewMode, // Prefix with underscore to indicate intentionally unused parameter
  loadingState
}: OverviewViewProps) {
  // Memoized computed values for performance with specific dependencies
  const { totalTasks, totalMaterials, completedTasks, overallProgress } = useMemo(() => {
    const totalTasks = plan.phases.reduce((sum: number, phase) => sum + phase.tasks.length, 0);
    const totalMaterials = plan.phases.reduce((sum: number, phase) => sum + phase.materials.length, 0);
    const completedTasks = plan.phases.reduce((sum: number, phase) => sum + phase.tasks.filter((task) => task.status === 'completed').length, 0);
    const overallProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalTasks, totalMaterials, completedTasks, overallProgress };
  }, [plan.phases]); // This dependency is correct as we're looking at the entire phases array
  
  // Memoized formatted dates
  const formattedStartDate = useMemo(() => formatDate(plan.startDate), [plan.startDate]);
  const formattedEndDate = useMemo(() => formatDate(plan.endDate), [plan.endDate]);
  const formattedLastUpdated = useMemo(() => formatDate(plan.lastUpdated), [plan.lastUpdated]);
  
  // Memoized callbacks
  // Ensure all callbacks are properly memoized
  const handleAddPhase = useCallback(() => {
    onAddPhase?.(plan.id);
  }, [onAddPhase, plan.id]);
  
  const handleEditProjectDates = useCallback(() => {
    onEditProjectDates?.();
  }, [onEditProjectDates]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Project Overview Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl bg-gradient-to-br from-white via-buildease-blue-50/20 to-buildease-earth-50/20 dark:from-gray-900 dark:via-buildease-blue-950/10 dark:to-buildease-earth-950/10 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-buildease-blue-50/50 via-white/80 to-buildease-earth-50/40 dark:from-buildease-blue-950/30 dark:via-gray-800/40 dark:to-buildease-earth-950/20 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40 px-6 py-5 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200 tracking-tight">{plan.name}</h2>
                <p className="text-buildease-blue-600/80 dark:text-buildease-blue-400/80 text-sm mt-2 max-w-2xl line-clamp-2 leading-relaxed">{plan.description}</p>
              </div>
              <Button 
                onClick={handleEditProjectDates} 
                variant="outline" 
                size="sm" 
                className="bg-white/90 dark:bg-gray-800/90 text-buildease-blue-700 dark:text-buildease-blue-300 border-buildease-blue-300/60 dark:border-buildease-blue-700/60 hover:bg-gradient-to-r hover:from-buildease-blue-50 hover:to-white dark:hover:from-buildease-blue-900/30 dark:hover:to-gray-800/60 hover:border-buildease-blue-400/80 dark:hover:border-buildease-blue-600/80 shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm ring-1 ring-buildease-blue-200/20 dark:ring-buildease-blue-800/20"
              >
                <Calendar className="h-4 w-4 mr-1 text-buildease-blue-600 dark:text-buildease-blue-400" />
                Edit Dates
              </Button>
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Enhanced Project Stats */}
            <div className="bg-gradient-to-br from-white/95 via-buildease-blue-50/30 to-buildease-earth-50/25 dark:from-gray-900/95 dark:via-buildease-blue-950/15 dark:to-buildease-earth-950/15 backdrop-blur-sm">
              {/* Main Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-buildease-blue-200/40 dark:border-buildease-blue-800/40">
                {/* Enhanced Progress Circle */}
                <div className="p-6 flex flex-col items-center justify-center border-r border-buildease-blue-200/40 dark:border-buildease-blue-800/40 last:border-r-0">
                  <div className="relative mb-4">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-buildease-blue-100/80 to-buildease-blue-50/60 dark:from-buildease-blue-900/40 dark:to-buildease-blue-950/30 shadow-lg ring-2 ring-buildease-blue-200/50 dark:ring-buildease-blue-800/50">
                      <span className="text-2xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200">{overallProgress}%</span>
                      <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="35" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          className="text-buildease-blue-200/60 dark:text-buildease-blue-800/60"
                        />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="35" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          strokeDasharray="219.9" 
                          strokeDashoffset={219.9 - (219.9 * overallProgress / 100)} 
                          strokeLinecap="round" 
                          transform="rotate(-90 40 40)" 
                          className="text-buildease-blue-600 dark:text-buildease-blue-400 transition-all duration-700 ease-out drop-shadow-sm"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-construction-subtitle font-bold text-buildease-blue-800 dark:text-buildease-blue-200">Overall Progress</h3>
                    <p className="text-xs text-buildease-blue-600/80 dark:text-buildease-blue-400/80 mt-1 font-medium">{completedTasks} of {totalTasks} tasks completed</p>
                  </div>
                </div>

                {/* Enhanced Key Metrics */}
                <div className="p-6 border-r border-buildease-blue-200/40 dark:border-buildease-blue-800/40 last:border-r-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-buildease-blue-50/60 to-white/80 dark:from-buildease-blue-950/30 dark:to-gray-800/60 shadow-md border border-buildease-blue-200/40 dark:border-buildease-blue-800/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-buildease-blue-100 to-buildease-blue-50 dark:from-buildease-blue-900/50 dark:to-buildease-blue-950/40 flex items-center justify-center shadow-sm ring-1 ring-buildease-blue-200/30 dark:ring-buildease-blue-800/30">
                          <Layers className="h-5 w-5 text-buildease-blue-600 dark:text-buildease-blue-400" />
                        </div>
                        <span className="text-construction-body font-semibold text-buildease-blue-800 dark:text-buildease-blue-200">Phases</span>
                      </div>
                      <span className="text-xl font-bold text-buildease-blue-800 dark:text-buildease-blue-200">{plan.phases.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-buildease-blue-50/60 to-white/80 dark:from-buildease-blue-950/30 dark:to-gray-800/60 shadow-md border border-buildease-blue-200/40 dark:border-buildease-blue-800/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-status-completed/10 dark:bg-status-completed/20 flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-status-completed" />
                        </div>
                        <span className="text-construction-body font-medium text-gray-700 dark:text-gray-300">Tasks</span>
                      </div>
                      <span className="text-lg font-bold text-status-completed">{completedTasks}/{totalTasks}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-buildease-blue-50/60 to-white/80 dark:from-buildease-blue-950/30 dark:to-gray-800/60 shadow-md border border-buildease-blue-200/40 dark:border-buildease-blue-800/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="text-construction-body font-medium text-gray-700 dark:text-gray-300">Materials</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalMaterials}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Timeline Information */}
                <div className="p-6 border-r border-buildease-blue-100/50 dark:border-buildease-blue-900/30 last:border-r-0">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-construction-subtitle font-semibold text-gray-900 dark:text-gray-100">Project Timeline</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Start Date</p>
                          <p className="text-construction-body font-semibold text-gray-900 dark:text-gray-100">{formattedStartDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                          <CalendarDays className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">End Date</p>
                          <p className="text-construction-body font-semibold text-gray-900 dark:text-gray-100">{formattedEndDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Last Updated</p>
                          <p className="text-construction-body font-semibold text-gray-900 dark:text-gray-100">{formattedLastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Project Description */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Project Description</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="text-construction-body text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                      {plan.description || 'No description available for this construction project.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phases Header with Add Phase Button */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
            <BarChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>Construction Phases</span>
          </h2>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {plan.phases.length} {plan.phases.length === 1 ? 'phase' : 'phases'}
          </div>
        </div>
        
        {/* Add Phase button with accent color */}
        <Button
          onClick={handleAddPhase}
          size="sm"
          className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 h-8 px-3 shadow-sm"
          disabled={!onAddPhase}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Phase
        </Button>
      </motion.div>

      {/* Phases List - Fixed animation hierarchy to prevent nested animation issues */}
      <motion.div variants={itemVariants} className="space-y-4">
        {plan.phases.map((phase, index: number) => (
          <div key={phase.id}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PhaseCard 
                phase={phase} 
                onDelete={onDeletePhase}
                onEdit={onEditPhase}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onAddMaterial={onAddMaterial}
                onEditMaterial={onEditMaterial}
                onDeleteMaterial={onDeleteMaterial}
                onEditPhaseDates={onEditPhaseDates}
                loadingState={loadingState}
              />
            </motion.div>
          </div>
        ))}
        
        {plan.phases.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
              <Layers className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-medium text-base mb-1">No phases have been defined</p>
            <p className="text-sm mb-3">Start by adding your first construction phase</p>
            <Button
              onClick={onAddPhase ? () => onAddPhase(plan.id) : undefined}
              size="sm"
              className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 shadow-sm"
              disabled={!onAddPhase}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Phase
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});
