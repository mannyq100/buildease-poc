/**
 * Enhanced Task CRUD Operations Hook with Integrated Activity Tracking
 * This hook extends the basic task CRUD operations with comprehensive activity logging
 * Designed for seamless integration into BuildEase project management workflows
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  useCreateTaskWithTracking, 
  useUpdateTaskWithTracking, 
  useDeleteTaskWithTracking,
  useUpdateTaskStatusWithTracking,
  useAssignTaskWithTracking
} from '@/hooks/mutations/useTaskWithActivityTracking';

// Modal state interface
interface TaskModal {
  isOpen: boolean;
  mode: 'create' | 'edit';
  task?: any;
  phaseId?: string;
}

interface UseTaskCRUDWithTrackingProps {
  projectId: string;
}

/**
 * Enhanced Task CRUD hook with activity tracking
 * Provides comprehensive task management with automatic activity logging
 */
export function useTaskCRUDWithActivityTracking({ projectId }: UseTaskCRUDWithTrackingProps) {
  const { user } = useSupabaseAuth();
  
  // Task mutations with activity tracking
  const createTaskWithTracking = useCreateTaskWithTracking(projectId);
  const updateTaskWithTracking = useUpdateTaskWithTracking(projectId);
  const deleteTaskWithTracking = useDeleteTaskWithTracking(projectId);
  const updateTaskStatusWithTracking = useUpdateTaskStatusWithTracking(projectId);
  const assignTaskWithTracking = useAssignTaskWithTracking(projectId);

  // Modal state
  const [taskModal, setTaskModal] = useState<TaskModal>({
    isOpen: false,
    mode: 'create'
  });

  // Modal control functions
  const openCreateTaskModal = (phaseId: string, phaseTitle?: string) => {
    setTaskModal({
      isOpen: true,
      mode: 'create',
      phaseId,
      task: { phaseTitle } // Store phase title for activity descriptions
    });
  };

  const openEditTaskModal = (task: any, phaseId: string, phaseTitle?: string) => {
    setTaskModal({
      isOpen: true,
      mode: 'edit',
      phaseId,
      task: { ...task, phaseTitle }
    });
  };

  const closeTaskModal = () => {
    setTaskModal({
      isOpen: false,
      mode: 'create',
      task: undefined,
      phaseId: undefined
    });
  };

  // Enhanced CRUD operation handlers with activity tracking
  const handleCreateTask = async (taskData: any, phaseId: string, phaseTitle?: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to create tasks');
      throw new Error('User not authenticated');
    }

    try {
      // Process form data to handle UUID fields (convert empty strings to null)
      const processedData = {
        ...taskData,
        assigned_to: taskData.assigned_to || null,
        due_date: taskData.due_date || null,
        phase_id: phaseId,
        project_id: projectId,
        created_by: user.id,
        phaseTitle // For activity tracking
      };

      await createTaskWithTracking.mutateAsync(processedData);
      closeTaskModal();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any, phaseTitle?: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to update tasks');
      throw new Error('User not authenticated');
    }

    try {
      // Get current task data for comparison
      const currentTask = taskModal.task;
      const previousStatus = currentTask?.status;

      const processedData = {
        id: taskId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        assigned_to: taskData.assigned_to || null,
        due_date: taskData.due_date || null,
        estimated_hours: taskData.estimated_hours,
        actual_hours: taskData.actual_hours,
        progress_percentage: taskData.progress_percentage,
        previousStatus, // For activity tracking
        projectId, // Required for activity tracking
        phaseTitle // For activity descriptions
      };

      await updateTaskWithTracking.mutateAsync(processedData);
      closeTaskModal();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete tasks');
      throw new Error('User not authenticated');
    }

    try {
      await deleteTaskWithTracking.mutateAsync({ taskId, taskTitle });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  /**
   * Handle task status updates with enhanced activity tracking
   * This is particularly important for task completion tracking
   */
  const handleTaskStatusUpdate = async (
    taskId: string,
    newStatus: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled',
    taskTitle: string,
    currentStatus?: string,
    progress?: number
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to update task status');
      throw new Error('User not authenticated');
    }

    try {
      await updateTaskStatusWithTracking.mutateAsync({
        taskId,
        taskTitle,
        status: newStatus,
        progress,
        previousStatus: currentStatus
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  };

  /**
   * Quick task completion handler for UI components
   */
  const handleCompleteTask = async (taskId: string, taskTitle: string, currentStatus?: string) => {
    return handleTaskStatusUpdate(taskId, 'completed', taskTitle, currentStatus, 100);
  };

  /**
   * Task assignment handler with activity tracking
   */
  const handleAssignTask = async (
    taskId: string,
    taskTitle: string,
    userId: string | null,
    userName?: string,
    previousAssignee?: string
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to assign tasks');
      throw new Error('User not authenticated');
    }

    try {
      await assignTaskWithTracking.mutateAsync({
        taskId,
        taskTitle,
        userId,
        userName,
        previousAssignee
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  };

  /**
   * Batch task operations with activity tracking
   */
  const handleBatchTaskStatusUpdate = async (
    tasks: Array<{ id: string; title: string; currentStatus?: string }>,
    newStatus: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled'
  ) => {
    if (!user?.id) {
      toast.error('You must be logged in to update tasks');
      throw new Error('User not authenticated');
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const task of tasks) {
      try {
        await handleTaskStatusUpdate(task.id, newStatus, task.title, task.currentStatus);
        successCount++;
      } catch (error) {
        console.error(`Failed to update task ${task.title}:`, error);
        failureCount++;
      }
    }

    // Show batch operation results
    if (successCount > 0 && failureCount === 0) {
      toast.success(`${successCount} task${successCount > 1 ? 's' : ''} updated successfully`);
    } else if (successCount > 0 && failureCount > 0) {
      toast.warning(`${successCount} task${successCount > 1 ? 's' : ''} updated, ${failureCount} failed`);
    } else {
      toast.error('Failed to update tasks');
    }

    return { successCount, failureCount };
  };

  return {
    // Modal state
    taskModal,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal,
    
    // Enhanced CRUD operations with activity tracking
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    
    // Status-specific operations
    handleTaskStatusUpdate,
    handleCompleteTask,
    handleAssignTask,
    handleBatchTaskStatusUpdate,
    
    // Loading states
    isCreating: createTaskWithTracking.isPending,
    isUpdating: updateTaskWithTracking.isPending,
    isDeleting: deleteTaskWithTracking.isPending,
    isUpdatingStatus: updateTaskStatusWithTracking.isPending,
    isAssigning: assignTaskWithTracking.isPending,

    // Mutation objects for advanced usage
    mutations: {
      createTask: createTaskWithTracking,
      updateTask: updateTaskWithTracking,
      deleteTask: deleteTaskWithTracking,
      updateTaskStatus: updateTaskStatusWithTracking,
      assignTask: assignTaskWithTracking
    }
  };
}

/**
 * Convenience hook for task completion specifically
 * Provides simplified interface for marking tasks as complete
 */
export function useTaskCompletion(projectId: string) {
  const { handleCompleteTask, isUpdatingStatus } = useTaskCRUDWithActivityTracking({ projectId });

  const markAsComplete = async (taskId: string, taskTitle: string, currentStatus?: string) => {
    return handleCompleteTask(taskId, taskTitle, currentStatus);
  };

  const markAsIncomplete = async (taskId: string, taskTitle: string) => {
    const { handleTaskStatusUpdate } = useTaskCRUDWithActivityTracking({ projectId });
    return handleTaskStatusUpdate(taskId, 'pending', taskTitle, 'completed');
  };

  return {
    markAsComplete,
    markAsIncomplete,
    isUpdating: isUpdatingStatus
  };
}