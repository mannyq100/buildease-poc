/**
 * Upload Progress Tracker Component
 * Provides detailed upload progress tracking, cancellation, and real-time status updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Upload,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { useUploadQueue, type QueueStatus } from '@/services/uploadQueueService';
import { cn } from '@/lib/utils';

export interface UploadTask {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled' | 'paused';
  error?: string;
  estimatedTimeRemaining?: number;
  uploadSpeed?: number;
  bucket: string;
}

interface UploadProgressTrackerProps {
  tasks: UploadTask[];
  onCancel?: (taskId: string) => void;
  onRetry?: (taskId: string) => void;
  onPause?: (taskId: string) => void;
  onResume?: (taskId: string) => void;
  className?: string;
  compact?: boolean;
}

export function UploadProgressTracker({
  tasks,
  onCancel,
  onRetry,
  onPause,
  onResume,
  className,
  compact = false
}: UploadProgressTrackerProps) {
  const { status, cancelTask, retryFailed } = useUploadQueue();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpanded = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const getStatusIcon = (status: UploadTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UploadTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'uploading':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const calculateOverallProgress = (): number => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  };

  const getActiveTasks = () => tasks.filter(task => 
    ['pending', 'uploading', 'paused'].includes(task.status)
  );

  const getCompletedTasks = () => tasks.filter(task => task.status === 'completed');
  const getFailedTasks = () => tasks.filter(task => task.status === 'failed');

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
          >
            {getStatusIcon(task.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {task.fileName}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Progress 
                  value={task.progress} 
                  className="flex-1 h-1"
                />
                <span className="text-xs text-gray-500">
                  {task.progress}%
                </span>
              </div>
            </div>
            {task.status === 'uploading' && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(task.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upload Progress</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {getActiveTasks().length} active
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {getCompletedTasks().length} completed
            </Badge>
            {getFailedTasks().length > 0 && (
              <Badge variant="outline" className="text-red-600">
                {getFailedTasks().length} failed
              </Badge>
            )}
          </div>
        </div>
        
        {tasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No uploads in progress</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
            >
              {/* Task Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {task.fileName}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatFileSize(task.fileSize)}</span>
                      <span>•</span>
                      <span className="capitalize">{task.bucket}</span>
                      {task.uploadSpeed && task.status === 'uploading' && (
                        <>
                          <span>•</span>
                          <span>{formatSpeed(task.uploadSpeed)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                  {task.status === 'uploading' && (
                    <>
                      {onPause && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPause(task.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancel(task.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}

                  {task.status === 'paused' && onResume && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResume(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  {task.status === 'failed' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(task.id)}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTaskExpanded(task.id)}
                    className="h-8 w-8 p-0"
                  >
                    <span className="text-xs">
                      {expandedTasks.has(task.id) ? '−' : '+'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {task.status === 'completed' ? 'Completed' : 
                     task.status === 'failed' ? 'Failed' :
                     task.status === 'cancelled' ? 'Cancelled' :
                     task.status === 'paused' ? 'Paused' :
                     'Uploading...'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span>{task.progress}%</span>
                    {task.estimatedTimeRemaining && task.status === 'uploading' && (
                      <span className="text-gray-500">
                        {formatTime(task.estimatedTimeRemaining)} remaining
                      </span>
                    )}
                  </div>
                </div>
                <Progress 
                  value={task.progress} 
                  className={cn(
                    "h-2 transition-all duration-300",
                    task.status === 'failed' && "bg-red-100"
                  )}
                />
              </div>

              {/* Error Message */}
              {task.status === 'failed' && task.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Upload failed</p>
                      <p className="mt-1">{task.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {expandedTasks.has(task.id) && (
                <div className="bg-gray-50 rounded-md p-3 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">File Size:</span>
                      <span className="ml-2 text-gray-600">{formatFileSize(task.fileSize)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bucket:</span>
                      <span className="ml-2 text-gray-600 capitalize">{task.bucket}</span>
                    </div>
                    {task.uploadSpeed && (
                      <div>
                        <span className="font-medium text-gray-700">Speed:</span>
                        <span className="ml-2 text-gray-600">{formatSpeed(task.uploadSpeed)}</span>
                      </div>
                    )}
                    {task.estimatedTimeRemaining && (
                      <div>
                        <span className="font-medium text-gray-700">ETA:</span>
                        <span className="ml-2 text-gray-600">{formatTime(task.estimatedTimeRemaining)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Global Actions */}
        {tasks.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-gray-600">
              {tasks.length} total uploads
            </div>
            <div className="flex items-center space-x-2">
              {getFailedTasks().length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailed}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retry Failed
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  tasks.forEach(task => {
                    if (['pending', 'uploading'].includes(task.status)) {
                      cancelTask(task.id);
                    }
                  });
                }}
                disabled={getActiveTasks().length === 0}
              >
                Cancel All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UploadProgressTracker;
