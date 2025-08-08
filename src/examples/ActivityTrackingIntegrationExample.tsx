/**
 * Activity Tracking Integration Example
 * 
 * This example demonstrates how to integrate comprehensive activity tracking
 * across all BuildEase project management operations. This shows the end-to-end
 * implementation of activity logging for tasks, projects, comments, and more.
 * 
 * USAGE INSTRUCTIONS:
 * 
 * 1. Replace your existing mutation hooks with the enhanced versions:
 *    - useTaskCRUD → useTaskCRUDWithActivityTracking
 *    - useCreateComment → useCreateCommentWithTracking
 *    - useUpdateProject → useUpdateProjectWithTracking
 * 
 * 2. Use the new UI components for automatic activity tracking:
 *    - TaskCompletionButton for task completion
 *    - TaskCompletionCard for complete task interfaces
 * 
 * 3. Activity data will automatically appear in:
 *    - RecentUpdatesCard component
 *    - ActivityTimeline component
 *    - Real-time notifications
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Enhanced hooks with activity tracking
import { useTaskCRUDWithActivityTracking } from '@/pages/ProjectDetails/hooks/useTaskCRUDWithActivityTracking';
import { useCreateCommentWithTracking } from '@/hooks/mutations/useCommentWithActivityTracking';
import { useUpdateProjectStatusWithTracking } from '@/hooks/mutations/useProjectWithActivityTracking';

// UI components with activity tracking
import { 
  TaskCompletionButton, 
  TaskCompletionCard 
} from '@/components/shared/TaskCompletionButton';

// Real-time activity display
import { RecentUpdatesCard } from '@/pages/ProjectDetails/components/Updates/RecentUpdatesCard';

// Example project ID - replace with real project ID
const EXAMPLE_PROJECT_ID = 'example-project-123';

/**
 * Example Component: Task Management with Activity Tracking
 */
export function TaskManagementExample() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Enhanced task operations with automatic activity tracking
  const {
    handleCreateTask,
    handleUpdateTask,
    handleCompleteTask,
    handleDeleteTask,
    openCreateTaskModal,
    closeTaskModal,
    taskModal,
    isCreating,
    isUpdating
  } = useTaskCRUDWithActivityTracking({ projectId: EXAMPLE_PROJECT_ID });

  const handleQuickTaskCreate = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await handleCreateTask({
        title: newTaskTitle,
        description: 'Quick task created from example',
        priority: 'medium',
        status: 'pending'
      }, 'example-phase-id', 'Example Phase');
      
      setNewTaskTitle('');
      toast.success('Task created with activity tracking!');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleQuickTaskComplete = async (taskId: string, taskTitle: string) => {
    try {
      await handleCompleteTask(taskId, taskTitle, 'in-progress');
      toast.success('Task completed with activity tracking!');
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management with Activity Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Task Creation */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickTaskCreate()}
          />
          <Button 
            onClick={handleQuickTaskCreate} 
            disabled={isCreating || !newTaskTitle.trim()}
          >
            {isCreating ? 'Creating...' : 'Add Task'}
          </Button>
        </div>

        {/* Example Tasks with Completion Buttons */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Example Tasks:</h4>
          
          {/* Using TaskCompletionCard component */}
          <TaskCompletionCard
            task={{
              id: 'task-1',
              title: 'Install electrical wiring',
              description: 'Run electrical wiring for kitchen area',
              status: 'in-progress',
              priority: 'high',
              due_date: '2025-01-15'
            }}
            projectId={EXAMPLE_PROJECT_ID}
            onStatusChange={(newStatus) => {
              console.log('Task status changed to:', newStatus);
            }}
          />

          {/* Using individual TaskCompletionButton */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <TaskCompletionButton
              taskId="task-2"
              taskTitle="Paint living room walls"
              currentStatus="pending"
              projectId={EXAMPLE_PROJECT_ID}
              variant="icon"
              size="md"
            />
            <div>
              <h5 className="font-medium">Paint living room walls</h5>
              <p className="text-sm text-slate-600">Apply primer and two coats</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
          💡 All task operations above automatically create activity log entries
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example Component: Comment System with Activity Tracking
 */
export function CommentSystemExample() {
  const [commentText, setCommentText] = useState('');
  
  // Enhanced comment mutations with activity tracking
  const createCommentWithTracking = useCreateCommentWithTracking(EXAMPLE_PROJECT_ID);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await createCommentWithTracking.mutateAsync({
        entityType: 'project',
        entityId: EXAMPLE_PROJECT_ID,
        content: commentText,
        projectId: EXAMPLE_PROJECT_ID,
        entityTitle: 'Main Project'
      });

      setCommentText('');
      toast.success('Comment added with activity tracking!');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments with Activity Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleAddComment} 
            disabled={createCommentWithTracking.isPending || !commentText.trim()}
            size="sm"
          >
            {createCommentWithTracking.isPending ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>

        <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
          💡 Comment creation automatically logs activity with content preview
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example Component: Project Status Updates with Activity Tracking
 */
export function ProjectStatusExample() {
  const [currentStatus, setCurrentStatus] = useState<'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'>('PLANNING');
  
  // Enhanced project mutations with activity tracking
  const updateProjectStatus = useUpdateProjectStatusWithTracking(EXAMPLE_PROJECT_ID);

  const handleStatusChange = async (newStatus: typeof currentStatus) => {
    try {
      await updateProjectStatus.mutateAsync({
        status: newStatus,
        previousStatus: currentStatus,
        projectName: 'Example Construction Project'
      });

      setCurrentStatus(newStatus);
      toast.success(`Project status updated to ${newStatus.toLowerCase().replace('_', ' ')}!`);
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const statusOptions: { value: typeof currentStatus; label: string; color: string }[] = [
    { value: 'PLANNING', label: 'Planning', color: 'bg-slate-100 text-slate-800' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'PAUSED', label: 'Paused', color: 'bg-yellow-100 text-yellow-800' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status with Activity Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-3">Current Status:</p>
          <Badge className={statusOptions.find(opt => opt.value === currentStatus)?.color}>
            {statusOptions.find(opt => opt.value === currentStatus)?.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={status.value === currentStatus ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(status.value)}
              disabled={updateProjectStatus.isPending || status.value === currentStatus}
            >
              {status.label}
            </Button>
          ))}
        </div>

        <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
          💡 Status changes create detailed activity logs with context
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example Component: Real-time Activity Display
 */
export function ActivityDisplayExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Live Activity Feed</h3>
      
      {/* Real-time activity updates */}
      <RecentUpdatesCard
        project={{
          id: EXAMPLE_PROJECT_ID,
          name: 'Example Construction Project',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }}
        isExpanded={true}
      />

      <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded">
        💡 This component automatically displays all tracked activities in real-time
      </div>
    </div>
  );
}

/**
 * Main Integration Example Component
 */
export function ActivityTrackingIntegrationExample() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">BuildEase Activity Tracking Integration</h1>
        <p className="text-slate-600 mb-6">
          This example demonstrates the comprehensive activity tracking system integrated 
          across all BuildEase operations. Every action automatically creates detailed 
          activity logs that appear in real-time throughout the application.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Interactive Examples */}
        <div className="space-y-6">
          <TaskManagementExample />
          <CommentSystemExample />
          <ProjectStatusExample />
        </div>

        {/* Right Column: Activity Display */}
        <div className="space-y-6">
          <ActivityDisplayExample />
          
          <Card>
            <CardHeader>
              <CardTitle>Integration Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Automatic activity logging for all operations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Real-time activity feed updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Contextual activity descriptions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Error-resilient tracking (doesn't break operations)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Mobile-optimized components
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Comprehensive coverage across all features
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-3">🚀 Ready to Integrate?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1. Replace existing hooks:</strong> Use the enhanced versions with activity tracking</p>
            <p><strong>2. Add UI components:</strong> Use TaskCompletionButton and other tracking components</p>
            <p><strong>3. Test the flow:</strong> Perform operations and check the Recent Updates card</p>
            <p><strong>4. Monitor activities:</strong> Use the Activity Timeline for comprehensive viewing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityTrackingIntegrationExample;