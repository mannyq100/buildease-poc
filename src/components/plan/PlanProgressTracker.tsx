/**
 * Plan Progress Tracker - Real-time progress visualization for AI plan generation
 * 
 * Features:
 * - Real-time progress updates
 * - Step-by-step progress visualization
 * - Mobile-responsive design
 * - Error handling and retry options
 * - Time estimation and completion tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { PlanProgress, ProgressStep } from '@/types/database';
import PlanStatusService from '@/services/planStatusService';

interface PlanProgressTrackerProps {
  projectId: string;
  jobId?: string;
  onComplete?: (planId: string) => void;
  onError?: (error: string) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Plan Progress Tracker Component
 * Provides real-time visualization of AI plan generation progress
 */
export function PlanProgressTracker({
  projectId,
  jobId,
  onComplete,
  onError,
  className,
  compact = false
}: PlanProgressTrackerProps) {
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!compact);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch initial progress
  const fetchProgress = useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await PlanStatusService.getPlanProgress(jobId);
      setProgress(response.progress);
      setLastUpdate(new Date());

      // Handle completion
      if (response.job.status === 'completed' && onComplete) {
        onComplete(response.job.id);
      }

      // Handle errors
      if (response.job.status === 'failed' && onError) {
        onError(response.job.error_message || 'Plan generation failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobId, onComplete, onError]);

  // Set up real-time updates
  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = PlanStatusService.subscribeToStatusUpdates(
      projectId,
      (plan) => {
        // Handle plan updates
        console.log('Plan updated:', plan);
      },
      (job) => {
        // Handle job updates - refresh progress
        if (job.job_id === jobId || job.id === jobId) {
          fetchProgress();
        }
      }
    );

    return unsubscribe;
  }, [projectId, jobId, fetchProgress]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Periodic refresh for active jobs
  useEffect(() => {
    if (!progress || progress.completedAt) return;

    const interval = setInterval(() => {
      fetchProgress();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [progress, fetchProgress]);

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStepStatusColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEstimatedCompletion = () => {
    if (!progress || progress.completedAt) return null;
    
    const remainingSteps = progress.steps.filter(s => s.status === 'pending');
    const remainingTime = remainingSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);
    
    if (remainingTime === 0) return null;
    
    const completionTime = new Date(Date.now() + remainingTime * 60 * 1000);
    return completionTime.toLocaleTimeString();
  };

  if (loading && !progress) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !progress) {
    return (
      <Card className={cn('w-full border-red-200', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600">Failed to load progress</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchProgress}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) return null;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-semibold">Plan Generation Progress</CardTitle>
            <Badge variant={progress.completedAt ? 'default' : 'secondary'}>
              {progress.completedAt ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
          
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="p-1"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-medium">{progress.overallProgress}%</span>
          </div>
          <Progress value={progress.overallProgress} className="h-2" />
          
          {/* Time Information */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Started: {formatTime(progress.startedAt)}</span>
            {progress.completedAt ? (
              <span>Completed: {formatTime(progress.completedAt)}</span>
            ) : (
              <span>ETA: {getEstimatedCompletion() || 'Calculating...'}</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {expanded && (
          <div className="space-y-4">
            {/* Current Stage Highlight */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Current Stage: {progress.currentStage.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {progress.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="flex items-start space-x-3">
                    {/* Step Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step)}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {step.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {step.status === 'in_progress' && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              {step.progress}%
                            </span>
                          )}
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              step.status === 'completed' && 'border-green-200 text-green-700',
                              step.status === 'in_progress' && 'border-blue-200 text-blue-700',
                              step.status === 'error' && 'border-red-200 text-red-700'
                            )}
                          >
                            {step.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {step.description}
                      </p>
                      
                      {/* Step Progress Bar */}
                      {step.status === 'in_progress' && (
                        <div className="mb-2">
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                      
                      {/* Step Timing */}
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Duration: {formatDuration(step.actualDuration || step.estimatedDuration)}
                        </span>
                        {step.startedAt && (
                          <span>
                            {step.completedAt 
                              ? `Completed: ${formatTime(step.completedAt)}`
                              : `Started: ${formatTime(step.startedAt)}`
                            }
                          </span>
                        )}
                      </div>
                      
                      {/* Error Message */}
                      {step.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-600 dark:text-red-400">{step.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < progress.steps.length - 1 && (
                    <div className="absolute left-2 top-6 w-px h-8 bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
              ))}
            </div>

            {/* Last Update */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PlanProgressTracker;