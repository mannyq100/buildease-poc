/**
 * TaskFormModal - Modal component for creating and editing tasks
 * Follows BuildEase component architecture standards:
 * - Under 400 lines
 * - Mobile-first responsive design
 * - Strong TypeScript typing
 * - BuildEase color scheme
 */

import { useState, useEffect } from 'react';

import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssigneeSelect } from '@/components/ui/AssigneeSelect';
import { RefreshCw } from 'lucide-react';
import { TaskFormModalProps, TaskFormData, SelectOption } from '@/types/projectDetails';

// Default form values
const defaultFormData: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: '',
  assigned_to: ''
};

// Priority options
const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

// Status options
const statusOptions: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Main component
export function TaskFormModal({ 
  isOpen, 
  onClose, 
  phaseId, 
  projectId, 
  task, 
  teamMembers,
  onSuccess,
  onCreateTask,
  onUpdateTask,
  isLoading = false
}: TaskFormModalProps) {
  
  const [formData, setFormData] = useState<TaskFormData>(defaultFormData);

  // Update form data when task prop changes (for editing) or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task - populate with task data
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'pending',
          due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
          assigned_to: task.assigned_to || ''
        });
      } else {
        // Creating new task - use defaults
        setFormData(defaultFormData);
      }
    }
  }, [task, isOpen]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onCreateTask && !onUpdateTask) {
      console.error('No CRUD handlers provided to TaskFormModal');
      return;
    }

    try {
      if (task && onUpdateTask) {
        // Update existing task
        await onUpdateTask(task.id, formData);
      } else if (onCreateTask) {
        // Create new task
        await onCreateTask(formData, phaseId, projectId);
      }
      
      onSuccess?.();
      onClose();
      setFormData(defaultFormData);
    } catch (error) {
      // Error handling is now done in the hook
      console.error('Error in form submission:', error);
    }
  };

  // Form field change handler
  const handleChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add New Task'}
      description={task ? 'Update task details and save changes' : 'Create a new task for this phase'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter task title"
            required
            className="mt-1"
          />
        </div>

        {/* Task Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter task description"
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Assignee */}
        <div>
          <Label htmlFor="assigned_to">Assign To</Label>
          <div className="mt-1">
            <AssigneeSelect
              value={formData.assigned_to || null}
              onValueChange={(value) => handleChange('assigned_to', value || '')}
              teamMembers={teamMembers
                .filter(member => member.user_id) // Only include members with valid user_id
                .map(member => ({
                  id: member.user_id || member.id || '', // Use user_id for database operations
                  name: member.name,
                  role: member.role,
                  email: member.email,
                  avatar: member.avatar,
                  status: member.status,
                  workload: 0
                }))}
              placeholder="Select team member..."
              showWorkload={true}
              showClearButton={true}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="order-1 sm:order-2 bg-buildease-blue-600 hover:bg-buildease-blue-700"
          >
            {isLoading && (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            )}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}