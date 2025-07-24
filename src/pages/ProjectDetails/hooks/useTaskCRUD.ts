/**
 * useTaskCRUD Hook - Custom hook for task CRUD operations
 * Centralizes task management logic following BuildEase standards
 * Separates business logic from UI components
 */

import { useState } from 'react';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/mutations/useTask';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

// Types
interface TaskModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  task?: any;
  phaseId?: string;
}

interface UseTaskCRUDReturn {
  // Modal state
  taskModal: TaskModalState;
  openCreateTaskModal: (phaseId: string) => void;
  openEditTaskModal: (task: any, phaseId: string) => void;
  closeTaskModal: () => void;
  
  // CRUD operations
  handleCreateTask: (taskData: any, phaseId: string, projectId: string) => Promise<void>;
  handleUpdateTask: (taskId: string, taskData: any) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  
  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Custom hook for managing task CRUD operations
 * Provides centralized state management and business logic for tasks
 */
export function useTaskCRUD(): UseTaskCRUDReturn {
  const { user } = useSupabaseAuth();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Modal state management
  const [taskModal, setTaskModal] = useState<TaskModalState>({
    isOpen: false,
    mode: 'create'
  });

  // Modal control functions
  const openCreateTaskModal = (phaseId: string) => {
    setTaskModal({
      isOpen: true,
      mode: 'create',
      phaseId,
      task: undefined
    });
  };

  const openEditTaskModal = (task: any, phaseId: string) => {
    setTaskModal({
      isOpen: true,
      mode: 'edit',
      phaseId,
      task
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

  // CRUD operation handlers
  const handleCreateTask = async (taskData: any, phaseId: string, projectId: string) => {
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
        created_by: user.id
      };

      await createTask.mutateAsync(processedData);
      toast.success('Task created successfully!');
      closeTaskModal();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    if (!user?.id) {
      toast.error('You must be logged in to update tasks');
      throw new Error('User not authenticated');
    }

    try {
      // Process form data to handle UUID fields (convert empty strings to null)
      const processedData = {
        ...taskData,
        assigned_to: taskData.assigned_to || null,
        due_date: taskData.due_date || null
      };

      await updateTask.mutateAsync({
        id: taskId,
        ...processedData
      });
      toast.success('Task updated successfully!');
      closeTaskModal();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to delete tasks');
      throw new Error('User not authenticated');
    }

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
      throw error;
    }
  };

  return {
    // Modal state
    taskModal,
    openCreateTaskModal,
    openEditTaskModal,
    closeTaskModal,
    
    // CRUD operations
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    
    // Loading states
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending
  };
}