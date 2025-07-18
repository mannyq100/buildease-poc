import React, { useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimelineView } from '@/components/plan';
import { ProjectAnalytics } from '@/components/project/ProjectAnalytics';
import { 
  Clock, 
  BarChart3, 
  TrendingUp, 
  Target,
  Zap,
  Activity
} from 'lucide-react';
import type { Plan } from '@/types/plan';
import type { PlanModalManagerHandlers } from '@/components/plan';

interface ProgressAndExecutionProps {
  plan: Plan | null;
  projectId: string;
  modalHandlersRef: React.RefObject<PlanModalManagerHandlers>;
  className?: string;
}

export function ProgressAndExecution({ 
  plan, 
  projectId, 
  modalHandlersRef, 
  className 
}: ProgressAndExecutionProps) {
  const [activeTab, setActiveTab] = useState('timeline');

  if (!plan) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Loading project timeline...</p>
        </div>
      </div>
    );
  }

  const phaseCount = plan.phases?.length || 0;
  const completedPhases = plan.phases?.filter(phase => phase.status === 'completed').length || 0;
  const progressPercentage = phaseCount > 0 ? Math.round((completedPhases / phaseCount) * 100) : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Progress Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-buildease-blue-50 to-buildease-blue-100/50 dark:from-buildease-blue-950/20 dark:to-buildease-blue-900/20 rounded-xl border border-buildease-blue-200/30 dark:border-buildease-blue-800/30">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-buildease-blue-900 dark:text-buildease-blue-100 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress & Execution
          </h3>
          <p className="text-sm text-buildease-blue-700 dark:text-buildease-blue-300">
            Track timeline progress and analyze project performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-buildease-blue-700 dark:text-buildease-blue-300">
              {progressPercentage}%
            </div>
            <div className="text-xs text-buildease-blue-600 dark:text-buildease-blue-400">
              Complete
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-buildease-blue-700 dark:text-buildease-blue-300">
              {completedPhases}/{phaseCount}
            </div>
            <div className="text-xs text-buildease-blue-600 dark:text-buildease-blue-400">
              Phases
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Card className="border-buildease-blue-200/30 dark:border-buildease-blue-800/30">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-buildease-blue-200/30 dark:border-buildease-blue-800/30">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 rounded-none">
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-buildease-blue-50 dark:data-[state=active]:bg-buildease-blue-950/20 data-[state=active]:text-buildease-blue-700 dark:data-[state=active]:text-buildease-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-buildease-blue-500 rounded-none py-4"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Timeline & Phases
                  <Badge variant="outline" className="ml-2 bg-buildease-blue-100 text-buildease-blue-700 border-buildease-blue-300">
                    {phaseCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-buildease-blue-50 dark:data-[state=active]:bg-buildease-blue-950/20 data-[state=active]:text-buildease-blue-700 dark:data-[state=active]:text-buildease-blue-300 data-[state=active]:border-b-2 data-[state=active]:border-buildease-blue-500 rounded-none py-4"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics & Reports
                  <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-700 border-emerald-300">
                    Live
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="timeline" className="p-6 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Project Timeline</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage phases, tasks, and project schedule
                    </p>
                  </div>
                  <Button
                    onClick={() => modalHandlersRef.current?.openPhaseModal('', true)}
                    size="sm"
                    className="bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Add Phase
                  </Button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <TimelineView
                    plan={plan}
                    onEditPhase={(phaseId) => modalHandlersRef.current?.openPhaseModal(phaseId)}
                    onAddTask={(phaseId) => modalHandlersRef.current?.openTaskModal(phaseId, '', true)}
                    onEditTask={(phaseId, taskId) => modalHandlersRef.current?.openTaskModal(phaseId, taskId)}
                    onEditDates={(type, phaseId) => modalHandlersRef.current?.openDateModal(type, phaseId)}
                    onReorderPhase={(activeId, overId) => console.log('Reorder:', activeId, overId)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Performance Analytics</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Insights, metrics, and progress analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      On Track
                    </Badge>
                  </div>
                </div>

                <ProjectAnalytics projectId={projectId} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}