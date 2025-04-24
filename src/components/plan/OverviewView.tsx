import React from 'react';
import { ConstructionPlan, Phase } from '@/data/mock/generatedPlan/planData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Package, Tag, CheckSquare, Users, Layers, FileText, Plus, Edit, Calendar, BarChart } from 'lucide-react';
import { PhaseCard } from './PhaseCard';
import { motion } from 'framer-motion';

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
  
  // Calculate overall project progress
  const overallProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Project Overview Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-none shadow-md">
          <div className="bg-gradient-to-r from-[#2B6CB0]/80 to-[#2B6CB0] px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
                <p className="text-blue-100 text-sm mt-1 max-w-2xl line-clamp-1">{plan.description}</p>
              </div>
              <Button 
                onClick={onEditProjectDates} 
                variant="outline" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Edit Dates
              </Button>
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Project Stats */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {/* Progress */}
              <div className="p-4 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-2 relative">
                  <span className="text-lg font-bold text-[#2B6CB0] dark:text-blue-300">{overallProgress}%</span>
                  <svg className="absolute inset-0" width="64" height="64" viewBox="0 0 64 64">
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      fill="none" 
                      stroke="#E2E8F0" 
                      strokeWidth="4" 
                    />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      fill="none" 
                      stroke="#2B6CB0" 
                      strokeWidth="4" 
                      strokeDasharray="175.9" 
                      strokeDashoffset={175.9 - (175.9 * overallProgress / 100)} 
                      strokeLinecap="round" 
                      transform="rotate(-90 32 32)" 
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Overall Progress</span>
              </div>

              {/* Key stats with icons */}
              <div className="p-4 flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5">
                    <Layers className="h-4 w-4 text-[#2B6CB0]" />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Phases</span>
                    <span className="font-semibold text-sm">{plan.phases.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-1.5">
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Tasks</span>
                    <span className="font-semibold text-sm">{completedTasks}/{totalTasks}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-1.5">
                    <Package className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Materials</span>
                    <span className="font-semibold text-sm">{totalMaterials}</span>
                  </div>
                </div>
              </div>

              {/* Date Information */}
              <div className="p-4 flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5">
                    <Calendar className="h-4 w-4 text-[#2B6CB0]" />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Start</span>
                    <span className="font-medium text-sm">{formatDate(plan.startDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5">
                    <CalendarDays className="h-4 w-4 text-[#2B6CB0]" />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">End</span>
                    <span className="font-medium text-sm">{formatDate(plan.endDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-1.5">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Updated</span>
                    <span className="font-medium text-sm">{formatDate(plan.lastUpdated)}</span>
                  </div>
                </div>
              </div>
              
              {/* Project Description */}
              <div className="p-4">
                <div className="flex items-start gap-2 mb-1">
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-1.5 mt-0.5">
                    <FileText className="h-4 w-4 text-[#2B6CB0]" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Description</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-8 line-clamp-3">
                  {plan.description || 'No description available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Phases Header with Add Phase Button */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
            <BarChart className="h-5 w-5 text-[#2B6CB0]" />
            <span>Construction Phases</span>
          </h2>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {plan.phases.length} {plan.phases.length === 1 ? 'phase' : 'phases'}
          </div>
        </div>
        
        {/* Add Phase button with accent color */}
        <Button
          onClick={onAddPhase ? () => onAddPhase(plan.id) : undefined}
          size="sm"
          className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white h-8 px-3 shadow-sm"
          disabled={!onAddPhase}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Phase
        </Button>
      </motion.div>

      {/* Phases List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {plan.phases.map((phase, index) => (
          <motion.div 
            key={phase.id}
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
              onReorderPhase={onReorderPhase}
              onEditPhaseDates={onEditPhaseDates}
            />
          </motion.div>
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
              className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white shadow-sm"
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
}
