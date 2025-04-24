import React from 'react';
import { ConstructionPlan, Phase } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Package, Tag, CheckSquare, Users, Layers, FileText, Plus, Edit, Calendar } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { motion as m } from 'framer-motion';

interface OverviewViewProps {
  plan: ConstructionPlan;
  onEditPhase?: (id: string) => void;
  onDeletePhase?: (id: string) => void;
  onAddTask?: (phaseId: string) => void;
  onEditTask?: (phaseId: string, taskId: string) => void;
  onDeleteTask?: (phaseId: string, taskId: string) => void;
  onAddMaterial?: (phaseId: string) => void;
  onEditMaterial?: (phaseId: string, materialId: string) => void;
  onDeleteMaterial?: (phaseId: string, materialId: string) => void;
  onReorderPhase?: (phaseId: string, direction: 'up' | 'down') => void;
  onAddPhase?: (planId: string) => void;
  onEditProjectDates?: () => void;
  onEditPhaseDates?: (phaseId: string) => void;
  viewMode?: 'detailed' | 'summary';
}

export function OverviewView({ 
  plan, 
  onEditPhase, 
  onDeletePhase, 
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onReorderPhase,
  onAddPhase,
  onEditProjectDates,
  onEditPhaseDates,
  viewMode
}: OverviewViewProps) {
  // Format dates for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Count total tasks and materials across all phases
  const totalTasks = plan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const totalMaterials = plan.phases.reduce((sum, phase) => sum + phase.materials.length, 0);
  
  // Calculate completed tasks
  const completedTasks = plan.phases.reduce((sum, phase) => sum + phase.tasks.filter(task => task.status === 'completed').length, 0);

  return (
    <div className="space-y-3">
      {/* Project Stats - Enhanced compact layout */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800/30 p-2.5 rounded-md border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow transition-all duration-200 group cursor-pointer col-span-1 sm:col-span-2"
        >
          <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md group-hover:bg-[#2B6CB0]/20 transition-all duration-200">
            <Layers className="h-4 w-4 text-[#2B6CB0] dark:text-blue-200" />
          </div>
          <div>
            <p className="text-xs text-blue-500 dark:text-blue-300 font-medium">Phases</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{plan.phases.length}</p>
          </div>
        </m.div>

        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-800/30 p-2.5 rounded-md border border-emerald-100 dark:border-emerald-900/50 shadow-sm hover:shadow transition-all duration-200 group cursor-pointer col-span-2 sm:col-span-2"
        >
          <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-md group-hover:bg-emerald-600/20 transition-all duration-200">
            <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-200" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 dark:text-emerald-300 font-medium">Tasks</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {completedTasks}/{totalTasks}
            </p>
          </div>
        </m.div>

        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-800/30 p-2.5 rounded-md border border-amber-100 dark:border-amber-900/50 shadow-sm hover:shadow transition-all duration-200 group cursor-pointer col-span-3 sm:col-span-2"
        >
          <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-md group-hover:bg-amber-600/20 transition-all duration-200">
            <Package className="h-4 w-4 text-amber-600 dark:text-amber-200" />
          </div>
          <div>
            <p className="text-xs text-amber-600 dark:text-amber-300 font-medium">Materials</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">{totalMaterials}</p>
          </div>
        </m.div>
      </div>

      {/* Timeline and Project Description - Combined in a more compact card */}
      <Card className="border-0 shadow-sm hover:shadow transition-all duration-200 overflow-hidden mb-3">
        <CardContent className="p-0">
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800/30 p-2.5 rounded-t-md border-b border-blue-100 dark:border-blue-900/50">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#2B6CB0]" />
              Project Timeline
            </h4>
            {onEditProjectDates && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-gray-500 hover:text-[#2B6CB0] hover:bg-blue-50"
                onClick={onEditProjectDates}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit Dates
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200 dark:border-gray-700">
            <div className="p-2.5 md:border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5">
                  <CalendarDays className="h-4 w-4 text-[#2B6CB0]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Start</div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{formatDate(plan.startDate)}</div>
                </div>
              </div>
            </div>
            
            <div className="p-2.5 md:border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5">
                  <CalendarDays className="h-4 w-4 text-[#2B6CB0]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">End</div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{formatDate(plan.endDate)}</div>
                </div>
              </div>
            </div>
            
            <div className="p-2.5">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5">
                  <Clock className="h-4 w-4 text-[#2B6CB0]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Updated</div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{formatDate(plan.lastUpdated)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Project Description - More compact */}
          <div className="p-2.5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30">
            <div className="flex gap-2">
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5 self-start shrink-0">
                <FileText className="h-4 w-4 text-[#2B6CB0]" />
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{plan.description || 'No description available'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases list - More compact header */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-[#2B6CB0]" />
              Construction Phases
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {plan.phases.length} {plan.phases.length === 1 ? 'phase' : 'phases'}
            </div>
          </div>
          
          {/* Add Phase button in the phases section */}
          <Button
            onClick={onAddPhase ? () => onAddPhase(plan.id) : undefined}
            size="sm"
            className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white h-7 text-xs px-2"
            disabled={!onAddPhase}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Phase
          </Button>
        </div>

        <div className="space-y-3">
          {plan.phases.map(phase => (
            <PhaseCard 
              key={phase.id} 
              phase={phase} 
              onDelete={onDeletePhase}
              onEdit={onEditPhase}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onAddMaterial={onAddMaterial}
              onEditMaterial={onEditMaterial}
              onDeleteMaterial={onDeleteMaterial}
              onReorderPhase={onReorderPhase}
              onEditPhaseDates={onEditPhaseDates}
            />
          ))}
          
          {plan.phases.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="font-medium text-sm">No phases have been defined for this project.</p>
              <p className="text-xs mt-1">Click the "Add Phase" button to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
