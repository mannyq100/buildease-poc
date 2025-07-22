import React, { useCallback, useEffect, useState } from 'react';
import { Layers, Calendar, ListOrdered, ClipboardList } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { BaseModal } from '@/components/ui/BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { PhaseSelector } from '@/components/shared/forms/PhaseSelector';
import { v4 as uuidv4 } from 'uuid';
import { ModalPhase } from '@/types/plan/index';
import { type ProjectType } from '@/utils/phaseUtils';

// Re-export for backward compatibility
export type Phase = ModalPhase;

interface PhaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: Phase) => void;
  phase?: Partial<Phase>;
  isNew?: boolean;
  statuses?: string[];
  currentOrder?: number;
  projectType?: ProjectType;
}

export function PhaseFormModal({
  isOpen,
  onClose,
  onSave,
  phase,
  isNew = true,
  statuses = ['planning', 'in-progress', 'on-hold', 'completed'],
  currentOrder = 1,
  projectType = 'residential-single'
}: PhaseFormModalProps) {
  // Default phase values
  const getDefaultValues = useCallback((): ModalPhase => ({
    id: phase?.id || uuidv4(),
    name: phase?.name || '',
    description: phase?.description || '',
    category: phase?.category || 'PRE_CONSTRUCTION',
    order: phase?.order || currentOrder,
    startDate: phase?.startDate || new Date().toISOString().substring(0, 10),
    endDate: phase?.endDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().substring(0, 10),
    status: phase?.status || 'planning',
    progress: phase?.progress || 0,
    tasks: phase?.tasks || [],
    materials: phase?.materials || []
  }), [phase, currentOrder]);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors: _errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<Phase>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Watch startDate for validation
  const [selectedCategory, setSelectedCategory] = useState<string>(phase?.category || 'PRE_CONSTRUCTION');
  const [_defaultTasks, setDefaultTasks] = useState<string[]>([]);
  const startDate = watch('startDate');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues());
    }
  }, [isOpen, reset, getDefaultValues]);

  // Handle form submission
  const onSubmit = useCallback((data: Phase) => {
    // Simulate API call delay
    setTimeout(() => {
      onSave(data);
      onClose();
    }, 500);
  }, [onSave, onClose]);

  // Handle form submit wrapper
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  }, [handleSubmit, onSubmit]);

  // Create the modal footer
  const modalFooter = (
    <ModalFooter
      onClose={onClose}
      onSubmit={handleFormSubmit}
      isNew={isNew}
      saving={isSubmitting}
      submitText={isNew ? 'Create Phase' : 'Save Changes'}
    />
  );

  // Modal description based on whether we're creating or editing
  const modalDescription = isNew 
    ? 'Create a new construction phase for your project' 
    : 'Update the details of this construction phase';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Add New Phase' : 'Edit Phase'}
      description={modalDescription}
      footer={modalFooter}
      size="3xl"
      className="max-h-[95vh]"
    >
      <form id="phase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Phase Category Selection Section */}
        <div className="bg-gradient-to-r from-blue-50/50 to-orange-50/50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Phase Selection</h3>
              <p className="text-sm text-gray-600">Choose the construction phase category</p>
            </div>
          </div>
          
          <PhaseSelector
            projectType={projectType}
            selectedCategory={selectedCategory}
            onCategorySelect={(category, phaseName) => {
              setSelectedCategory(category);
              // Auto-fill phase name if empty
              if (!watch('name')) {
                setValue('name', phaseName);
              }
              setValue('category', category);
            }}
            onTasksPreview={(tasks) => {
              setDefaultTasks(tasks.map(task => task.name));
            }}
            showTaskPreview={true}
            className="mt-0"
          />
        </div>

        {/* Basic Information Section */}
        <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-600 to-blue-600 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              <p className="text-sm text-gray-600">Define the phase name and description</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Phase name is required' }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Phase Name"
                  name="name"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g., Foundation Work"
                  icon={Layers}
                  required
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <div className="relative group">
                    <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200" />
                    <textarea
                      id="description"
                      name="description"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Enter detailed phase description..."
                      rows={4}
                      className={`w-full pl-10 rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/20 focus:border-[#2B6CB0] shadow-sm hover:border-gray-400 transition-all duration-200 resize-none ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
                    />
                  </div>
                  {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
                </div>
              )}
            />
          </div>
        </div>

        {/* Project Settings Section */}
        <div className="bg-gradient-to-r from-orange-50/50 to-yellow-50/30 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
              <ListOrdered className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Project Settings</h3>
              <p className="text-sm text-gray-600">Configure phase order and status</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Controller
              control={control}
              name="order"
              rules={{ 
                required: 'Order is required',
                min: { value: 1, message: 'Order must be at least 1' }
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Phase Order"
                  name="order"
                  type="number"
                  value={field.value?.toString() || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="e.g., 1"
                  icon={ListOrdered}
                  error={error?.message}
                  min={1}
                />
              )}
            />

            <Controller
              control={control}
              name="status"
              rules={{ required: 'Status is required' }}
              render={({ field, fieldState: { error } }) => (
                <SelectField
                  label="Phase Status"
                  name="status"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={statuses.map(status => ({
                    value: status,
                    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
                  }))}
                  placeholder="Select status"
                  error={error?.message}
                />
              )}
            />
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-gradient-to-r from-green-50/50 to-blue-50/30 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
              <p className="text-sm text-gray-600">Set the phase start and end dates</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Controller
              control={control}
              name="startDate"
              rules={{ required: 'Start date is required' }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  icon={Calendar}
                  required
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="endDate"
              rules={{ 
                required: 'End date is required',
                validate: (value) => {
                  if (startDate && value && new Date(value) < new Date(startDate)) {
                    return 'End date cannot be before start date';
                  }
                  return true;
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                  icon={Calendar}
                  required
                  error={error?.message}
                />
              )}
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
