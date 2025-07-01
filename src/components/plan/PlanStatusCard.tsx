/**
 * Plan Status Card - Compact plan status display for project dashboard
 * 
 * Features:
 * - Compact status overview
 * - Quick actions for plan management
 * - Real-time status updates
 * - Mobile-responsive design
 * - Integration with project dashboard
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Eye, 
  RefreshCw,
  Zap,
  Star,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { AIGeneratedPlan, AIPlanJob, PlanGenerationStatus } from '@/types/database';
import PlanStatusService from '@/services/planStatusService';
import { AIPlanService } from '@/services/aiPlanService';

interface PlanStatusCardProps {
  projectId: string;
  projectName: string;
  planGenerationStatus: PlanGenerationStatus;
  onViewProgress?: () => void;
  onViewPlans?: () => void;
  onGenerateNew?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Plan Status Card Component
 * Compact display of AI plan generation status for project dashboard
 */
export function PlanStatusCard({
  projectId,
  projectName,
  planGenerationStatus,
  onViewProgress,
  onViewPlans,
  onGenerateNew,
  className,
  compact = false
}: PlanStatusCardProps) {
  const [activePlan, setActivePlan] = useState<AIGeneratedPlan | null>(null);
  const [currentJob, setCurrentJob] = useState<AIPlanJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch plan status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get active plan
      const plan = await PlanStatusService.getActivePlan(projectId);
      setActivePlan(plan);

      // If generation is in progress, get current job
      if (planGenerationStatus === 'processing' || planGenerationStatus === 'requested') {
        try {
          // Get the latest job for this project (simplified - in real implementation would track job ID)
          const jobs = await AIPlanService.getJobsByProject?.(projectId);
          const latestJob = jobs?.[0];
          if (latestJob) {
            setCurrentJob(latestJob);
          }
        } catch (jobError) {
          console.warn('Could not fetch current job:', jobError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plan status');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates
  useEffect(() => {
    const unsubscribe = PlanStatusService.subscribeToStatusUpdates(
      projectId,
      (plan) => {
        if (plan.is_active) {
          setActivePlan(plan);
        }
      },
      (job) => {
        setCurrentJob(job);
      }
    );

    return unsubscribe;
  }, [projectId]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [projectId, planGenerationStatus]);

  const getStatusInfo = () => {
    switch (planGenerationStatus) {
      case 'not_started':
        return {
          icon: <Zap className="h-4 w-4 text-blue-500" />,
          title: 'Ready for AI Generation',
          description: 'Generate AI-powered construction plans',
          variant: 'default' as const,
          actionLabel: 'Generate Plans',
          showProgress: false
        };
      
      case 'requested':
      case 'processing':
        return {
          icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
          title: 'Generating Plans',
          description: currentJob ? 
            `${currentJob.progress_percentage || 0}% complete` : 
            'AI is creating your construction plans',
          variant: 'secondary' as const,
          actionLabel: 'View Progress',
          showProgress: true,
          progress: currentJob?.progress_percentage || 0
        };
      
      case 'completed':
        if (activePlan) {
          return {
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            title: `Plan v${activePlan.version_number} Active`,
            description: activePlan.is_approved ? 'Approved and ready' : 'Awaiting approval',
            variant: activePlan.is_approved ? 'default' : 'secondary' as const,
            actionLabel: 'View Plans',
            showProgress: false
          };
        } else {
          return {
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            title: 'Plans Generated',
            description: 'AI plans completed successfully',
            variant: 'default' as const,
            actionLabel: 'View Plans',
            showProgress: false
          };
        }
      
      case 'failed':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          title: 'Generation Failed',
          description: 'Plan generation encountered an error',
          variant: 'destructive' as const,
          actionLabel: 'Retry',
          showProgress: false
        };
      
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          title: 'Unknown Status',
          description: 'Plan status unavailable',
          variant: 'outline' as const,
          actionLabel: 'Refresh',
          showProgress: false
        };
    }
  };

  const handleAction = () => {
    switch (planGenerationStatus) {
      case 'not_started':
      case 'failed':
        onGenerateNew?.();
        break;
      case 'requested':
      case 'processing':
        onViewProgress?.();
        break;
      case 'completed':
        onViewPlans?.();
        break;
      default:
        fetchStatus();
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full hover:shadow-md transition-shadow', className)}>
      {!compact && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>AI Plan Status</span>
            {error && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchStatus}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={cn('space-y-3', compact ? 'p-3' : 'pt-0')}>
        {error ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Error loading status</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStatus}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {statusInfo.icon}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {statusInfo.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {statusInfo.description}
                  </p>
                </div>
              </div>

              {activePlan && (
                <div className="flex items-center space-x-1">
                  {activePlan.is_active && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-2 w-2 mr-1" />
                      Active
                    </Badge>
                  )}
                  {activePlan.is_approved && (
                    <Badge variant="default" className="text-xs">
                      Approved
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {statusInfo.showProgress && statusInfo.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium">{statusInfo.progress}%</span>
                </div>
                <Progress value={statusInfo.progress} className="h-1.5" />
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-between items-center pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAction}
                className="text-xs flex items-center space-x-1"
              >
                <span>{statusInfo.actionLabel}</span>
                <ChevronRight className="h-3 w-3" />
              </Button>

              {planGenerationStatus === 'completed' && onViewProgress && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewProgress}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Button>
              )}
            </div>

            {/* Additional Info */}
            {activePlan && !compact && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Version {activePlan.version_number}</span>
                  <span>
                    Generated {new Date(activePlan.generated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PlanStatusCard;