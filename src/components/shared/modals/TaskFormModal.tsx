import React, { useCallback } from 'react';
import { ListTodo, Calendar, User, Clock, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useFormState } from '@/hooks/useFormState';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  startDate: string;
  endDate: string;
  status: string;
  assignedTo?: string;
  progress: number;
  phaseId?: string;
}

interface TaskFormModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Partial<Task>;
  isNew?: boolean;
  statuses?: string[];
  teamMembers?: string[];
  phaseId?: string;
}

export function TaskFormModal({
  show,
  onClose,
  onSave,
  task,
  isNew = true,
  statuses = ['not-started', 'in-progress', 'on-hold', 'completed'],
  teamMembers = [],
  phaseId
}: TaskFormModalProps) {
  // Default task values
  const defaultValues: Task = {
    id: uuidv4(),
    name: '',
    description: '',
    duration: 1,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().substring(0, 10),
    status: 'not-started',
    assignedTo: teamMembers.length > 0 ? teamMembers[0] : '',
    progress: 0,
    phaseId: phaseId || ''
  };

  // Task validation function
  const validateTask = useCallback((data: Task) => {
    const errors: Partial<Record<keyof Task, string>> = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Task name is required';
    }
    
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!data.endDate) {
      errors.endDate = 'End date is required';
    } else {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      
      if (end < start) {
        errors.endDate = 'End date cannot be before start date';
      }
    }
    
    if (data.duration && data.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }
    
    return errors;
  }, []);

  // Use our custom form state hook
  const {
    formData,
    setFormData,
    errors,
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    validate
  } = useFormState<Task>(
    task ? { ...defaultValues, ...task, id: task.id || uuidv4() } : null, 
    defaultValues, 
    show, 
    validateTask
  );

  // Specialized handler for the progress slider
  const handleProgressChange = useCallback((value: number[]) => {
    setFormData(prev => ({
      ...prev,
      progress: value[0]
    }));
  }, [setFormData]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    
    // Simulate API call with slight delay
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      onClose();
    }, 500);
  }, [formData, validate, onSave, onClose, setSaving]);

  // Create the modal footer
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleSubmit}
      isNew={isNew}
      saving={saving}
      submitText={isNew ? 'Create Task' : 'Save Changes'}
    />
  );

  // Modal description based on whether we're creating or editing
  const modalDescription = isNew 
    ? 'Create a new task for this construction phase' 
    : 'Update the details of this task';

  // Get progress color based on value
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title={isNew ? 'Add New Task' : 'Edit Task'}
      description={modalDescription}
      footer={modalFooter}
      saving={saving}
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Basic information */}
        <FormField
          label="Task Name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="e.g., Install Drywall"
          required
          icon={ListTodo}
          error={errors.name}
        />

        {/* Description field */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            Description
          </label>
          <div className="relative group">
            <ListTodo className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200" />
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={3}
              className={`w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/10 focus:border-[#2B6CB0] shadow-sm hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 ${errors.description ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            />
          </div>
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Duration and Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Duration (days)"
            name="duration"
            type="number"
            value={formData.duration || ''}
            onChange={handleChange}
            placeholder="e.g., 5"
            icon={Clock}
            error={errors.duration}
          />

          <SelectField
            label="Status"
            name="status"
            value={formData.status || ''}
            onValueChange={(value) => handleSelectChange('status', value)}
            options={statuses.map(status => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
            }))}
            icon={Activity}
            placeholder="Select status"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={handleChange}
            icon={Calendar}
            required
            error={errors.startDate}
          />

          <FormField
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={handleChange}
            icon={Calendar}
            required
            error={errors.endDate}
          />
        </div>

        {/* Team Member Assignment */}
        {teamMembers.length > 0 && (
          <SelectField
            label="Assigned To"
            name="assignedTo"
            value={formData.assignedTo || ''}
            onValueChange={(value) => handleSelectChange('assignedTo', value)}
            options={teamMembers.map(member => ({
              value: member,
              label: member
            }))}
            icon={User}
            placeholder="Select team member"
          />
        )}

        {/* Progress Slider */}
        <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <label htmlFor="progress" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#2B6CB0]" /> Progress
            </label>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${getProgressColor(formData.progress)} text-white transition-colors duration-300`}>
              {formData.progress}%
            </span>
          </div>
          <div className="px-1 py-3">
            <Slider
              defaultValue={[formData.progress]}
              value={[formData.progress]}
              max={100}
              step={5}
              onValueChange={handleProgressChange}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span className="text-red-500 font-medium">0%</span>
            <span className="text-amber-500 font-medium">50%</span>
            <span className="text-green-500 font-medium">100%</span>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
