import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { ListTodo, Calendar, User, Clock, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { BaseModal } from '@/components/ui/BaseModal';
import { FormField, SelectField } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';
import { ModalTask } from '@/types/plan/index';

// Re-export for backward compatibility
export type Task = ModalTask;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Partial<Task>;
  isNew?: boolean;
  statuses?: string[];
  teamMembers?: string[];
  phaseId?: string;
}

// Export as default for better module compatibility
export default function TaskFormModal({
  isOpen,
  onClose,
  onSave,
  task,
  isNew = false,
  statuses = [],
  teamMembers = [],
  phaseId
}: TaskFormModalProps) {
  // Track renders for debugging
  const renderCounter = React.useRef<number>(0);
  const renderCount = ++renderCounter.current;
  // Use a more controlled debugging approach
  if (renderCount % 10 === 0) {
    console.log(`TaskFormModal: Render #${renderCount}`);
  }

  // State for saving status
  const [saving, setSaving] = useState(false);

  // Memoizing arrays to prevent unnecessary re-renders
  const memoizedStatuses = useMemo(() => statuses, [statuses]);
  const memoizedTeamMembers = useMemo(() => teamMembers, [teamMembers]);

  // Generate default values function 
  const getDefaultValues = useCallback(() => {
    const defaultDate = new Date().toISOString().split('T')[0];
    const defaultStatus = (statuses && statuses.length > 0) ? statuses[0] : 'not-started';
    
    // If editing existing task, use its data
    if (task) {
      return {
        id: task.id || uuidv4(),
        name: task.name || '',
        description: task.description || '',
        duration: task.duration || 1,
        startDate: task.startDate || defaultDate,
        endDate: task.endDate || defaultDate,
        status: task.status || defaultStatus,
        assignedTo: task.assignedTo || '',
        progress: task.progress ?? 0,
        phaseId: task.phaseId || phaseId || '',
      };
    }

    // Default values for new task
    return {
      id: uuidv4(),
      name: '',
      description: '',
      duration: 1,
      startDate: defaultDate,
      endDate: defaultDate,
      status: defaultStatus,
      assignedTo: '',
      progress: 0,
      phaseId: phaseId || '',
    };
  }, []);

  // Initialize React Hook Form
  const { 
    control,
    handleSubmit,
    reset
  } = useForm<Task>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Reset form when modal visibility changes
  useEffect(() => {
    if (isOpen) {
      // Clean reset when opening the modal, calculating fresh defaults inline
      const defaultDate = new Date().toISOString().split('T')[0];
      const defaultStatus = (statuses && statuses.length > 0) ? statuses[0] : 'not-started';
      
      const defaultValues = task ? {
        id: task.id || uuidv4(),
        name: task.name || '',
        description: task.description || '',
        duration: task.duration || 1,
        startDate: task.startDate || defaultDate,
        endDate: task.endDate || defaultDate,
        status: task.status || defaultStatus,
        assignedTo: task.assignedTo || '',
        progress: task.progress ?? 0,
        phaseId: task.phaseId || phaseId || '',
      } : {
        id: uuidv4(),
        name: '',
        description: '',
        duration: 1,
        startDate: defaultDate,
        endDate: defaultDate,
        status: defaultStatus,
        assignedTo: '',
        progress: 0,
        phaseId: phaseId || '',
      };
      
      reset(defaultValues);
    }
  }, [isOpen, task, statuses, phaseId, reset]);

  // Prepare options for select fields
  const statusOptions = useMemo(() => 
    memoizedStatuses.map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
    })), [memoizedStatuses]
  );

  const teamMemberOptions = useMemo(() => 
    memoizedTeamMembers.map(member => ({
      value: member,
      label: member
    })), [memoizedTeamMembers]
  );

  // We no longer need these separate handlers, as we'll use the field.onChange directly

  // Form submission handler
  const onSubmit: SubmitHandler<Task> = useCallback((data) => {
    setSaving(true);
    
    // Simulate API call with slight delay
    setTimeout(() => {
      onSave(data);
      setSaving(false);
      onClose();
    }, 500);
  }, [onSave, onClose, setSaving]);

  // Handle form submission
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  }, [handleSubmit, onSubmit]);


  // Define the heading based on whether this is a new task
  const modalHeading = isNew ? 'Add New Task' : 'Edit Task';

  return (
    <BaseModal 
      isOpen={isOpen}
      title={modalHeading}
      onClose={onClose}
    >
      <form id="task-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Task name is required' }}
          render={({ field, fieldState: { error } }) => (
            <FormField
              name="name"
              label="Task Name"
              type="text"
              value={field.value}
              onChange={field.onChange}
              error={error?.message}
              placeholder="Enter task name"
              icon={ListTodo}
              required
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState: { error } }) => (
            <FormField
              name="description" 
              label="Description"
              type="textarea"
              value={field.value || ''}
              onChange={field.onChange}
              error={error?.message}
              placeholder="Enter task description"
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          rules={{ required: 'Status is required' }}
          render={({ field, fieldState: { error } }) => (
            <SelectField
              name="status"
              label="Status"
              value={field.value}
              onValueChange={field.onChange}
              options={statusOptions}
              error={error?.message}
              required
            />
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="startDate"
            rules={{ required: 'Start date is required' }}
            render={({ field, fieldState: { error } }) => (
              <FormField
                name="startDate"
                label="Start Date"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                icon={Calendar}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="endDate"
            rules={{ 
              required: 'End date is required',
              validate: (value, formValues) => {
                const start = new Date(formValues.startDate);
                const end = new Date(value);
                return end >= start || 'End date cannot be before start date';
              }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormField
                name="endDate"
                label="End Date"
                type="date"
                value={field.value}
                onChange={field.onChange}
                error={error?.message}
                icon={Calendar}
                required
              />
            )}
          />

          <Controller
            control={control}
            name="duration"
            rules={{ 
              required: 'Duration is required',
              min: { value: 1, message: 'Duration must be greater than 0' }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormField
                name="duration"
                label="Duration (days)"
                type="number"
                value={field.value?.toString() || '1'}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                error={error?.message}
                icon={Clock}
                min="1"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="assignedTo"
            render={({ field, fieldState: { error } }) => (
              <SelectField
                name="assignedTo"
                label="Assigned To"
                value={field.value || ''}
                onValueChange={field.onChange}
                options={teamMemberOptions}
                error={error?.message}
                placeholder="Select team member"
                icon={User}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="progress"
          render={({ field }) => (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="progress" className="block text-sm font-medium">Progress ({field.value}%)</label>
                <span className="text-sm text-gray-500">{field.value}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <Slider
                  defaultValue={[field.value]}
                  value={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                  max={100}
                  step={5}
                  className="flex-grow"
                />
              </div>
            </div>
          )}
        />
      </form>
      
      {/* Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="task-form"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-buildease-blue-600 border border-transparent rounded-md hover:bg-buildease-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : (isNew ? 'Create Task' : 'Save Changes')}
        </button>
      </div>
    </BaseModal>
  );
}
