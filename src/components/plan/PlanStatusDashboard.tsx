/**
 * Plan Status Dashboard - Comprehensive dashboard for AI plan management
 * 
 * Features:
 * - Complete plan status overview
 * - Real-time progress tracking
 * - Version management
 * - Approval workflow
 * - Mobile-responsive design
 * - Integration with project views
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Settings,
  RefreshCw,
  Download,
  Share
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { Project } from '@/types/database';
import { PlanProgressTracker } from './PlanProgressTracker';
import { PlanVersionManager } from './PlanVersionManager';
import { PlanStatusCard } from './PlanStatusCard';

interface PlanStatusDashboardProps {
  project: Project;
  onGenerateNew?: () => void;
  onPlanSelect?: (planId: string) => void;
  className?: string;
}

/**
 * Plan Status Dashboard Component
 * Central hub for managing AI-generated construction plans
 */
export function PlanStatusDashboard({
  project,
  onGenerateNew,
  onPlanSelect,
  className
}: PlanStatusDashboardProps) {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get current job ID for progress tracking
  useEffect(() => {
    const fetchActiveJob = async () => {
      if (project.plan_generation_status === 'processing' || project.plan_generation_status === 'requested') {
        try {
          // In a real implementation, this would fetch the active job ID for the project
          // For now, we'll simulate it
          setActiveJobId(`job_${project.id}_${Date.now()}`);
        } catch (error) {
          console.error('Failed to fetch active job:', error);
        }
      } else {
        setActiveJobId(null);
      }
    };

    fetchActiveJob();
  }, [project.id, project.plan_generation_status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh project data - in real implementation would call parent refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateNew = () => {
    onGenerateNew?.();
  };

  const handlePlanComplete = (planId: string) => {
    onPlanSelect?.(planId);
  };

  const getStatusSummary = () => {
    const status = project.plan_generation_status;
    
    switch (status) {
      case 'not_started':
        return {
          icon: <Zap className="h-5 w-5 text-blue-500" />,
          title: 'Ready to Generate',
          description: 'Your project is ready for AI plan generation',
          color: 'blue'
        };
      
      case 'requested':
      case 'processing':
        return {
          icon: <Clock className="h-5 w-5 text-orange-500" />,
          title: 'Generation in Progress',
          description: 'AI is creating your construction plans',
          color: 'orange'
        };
      
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Plans Available',
          description: 'AI plans have been generated successfully',
          color: 'green'
        };
      
      case 'failed':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: 'Generation Failed',
          description: 'Plan generation encountered an error',
          color: 'red'
        };
      
      default:
        return {
          icon: <BarChart3 className="h-5 w-5 text-gray-500" />,
          title: 'Status Unknown',
          description: 'Plan generation status unavailable',
          color: 'gray'
        };
    }
  };

  const statusSummary = getStatusSummary();
  const showProgress = project.plan_generation_status === 'processing' || project.plan_generation_status === 'requested';
  const _showVersions = project.plan_generation_status === 'completed';

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {statusSummary.icon}
              <div>
                <CardTitle className="text-xl font-semibold">
                  AI Plan Management
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {statusSummary.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-sm',
                  statusSummary.color === 'blue' && 'border-blue-200 text-blue-700',
                  statusSummary.color === 'orange' && 'border-orange-200 text-orange-700',
                  statusSummary.color === 'green' && 'border-green-200 text-green-700',
                  statusSummary.color === 'red' && 'border-red-200 text-red-700'
                )}
              >
                {statusSummary.title}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn('h-4 w-4 mr-1', refreshing && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="lg:col-span-1">
          <PlanStatusCard
            projectId={project.id}
            projectName={project.name}
            planGenerationStatus={project.plan_generation_status}
            onViewProgress={() => {
              // Focus on progress tab if available
              const progressTab = document.querySelector('[data-tab="progress"]');
              if (progressTab) {
                (progressTab as HTMLElement).click();
              }
            }}
            onViewPlans={() => {
              // Focus on versions tab if available
              const versionsTab = document.querySelector('[data-tab="versions"]');
              if (versionsTab) {
                (versionsTab as HTMLElement).click();
              }
            }}
            onGenerateNew={handleGenerateNew}
          />
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={showProgress ? "progress" : "versions"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="progress" 
                disabled={!showProgress}
                data-tab="progress"
              >
                <Clock className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger 
                value="versions"
                data-tab="versions"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Versions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="mt-4">
              {showProgress && activeJobId ? (
                <PlanProgressTracker
                  projectId={project.id}
                  jobId={activeJobId}
                  onComplete={handlePlanComplete}
                  onError={(error) => {
                    console.error('Plan generation error:', error);
                  }}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="space-y-3">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          No Active Generation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Start a new plan generation to see progress here
                        </p>
                      </div>
                      {project.plan_generation_status === 'not_started' && (
                        <Button onClick={handleGenerateNew}>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate AI Plans
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="versions" className="mt-4">
              <PlanVersionManager
                projectId={project.id}
                onPlanSelect={(plan) => onPlanSelect?.(plan.id)}
                onPlanActivate={(plan) => {
                  console.log('Plan activated:', plan);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Action Bar */}
      {project.plan_generation_status === 'completed' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Plan Actions
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
                <Button onClick={handleGenerateNew}>
                  <Zap className="h-4 w-4 mr-1" />
                  Generate New
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PlanStatusDashboard;