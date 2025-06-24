import React, { useCallback, useEffect } from 'react';
import { Layers, Calendar, ListOrdered, ClipboardList } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { BaseModal } from './BaseModal';
import { FormField, SelectField, ModalFooter } from '@/components/ui/form-fields';
import { v4 as uuidv4 } from 'uuid';
import { ModalPhase } from '@/types/plan/index';

// Re-export for backward compatibility
export type Phase = ModalPhase;

interface PhaseFormModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (phase: Phase) => void;
  phase?: Partial<Phase>;
  isNew?: boolean;
  statuses?: string[];
  currentOrder?: number;
}

export function PhaseFormModal({
  show,
  onClose,
  onSave,
  phase,
  isNew = true,
  statuses = ['planning', 'in-progress', 'on-hold', 'completed'],
  currentOrder = 1
}: PhaseFormModalProps) {
  // Default phase values
  const getDefaultValues = useCallback((): ModalPhase => ({
    id: phase?.id || uuidv4(),
    name: phase?.name || '',
    description: phase?.description || '',
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
    reset,
    formState: { errors, isSubmitting },
    watch
  } = useForm<Phase>({
    defaultValues: getDefaultValues(),
    mode: 'onBlur'
  });

  // Watch startDate and endDate for validation
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      reset(getDefaultValues());
    }
  }, [show, reset, getDefaultValues]);

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
      show={show}
      onClose={onClose}
      title={isNew ? 'Add New Phase' : 'Edit Phase'}
      description={modalDescription}
      footer={modalFooter}
      saving={isSubmitting}
    >
      <form id="phase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic information */}
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
              required
              icon={Layers}
              error={error?.message}
            />
          )}
        />

        {/* Description field */}
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Description
              </label>
              <div className="relative group">
                <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-hover:text-[#2B6CB0] transition-colors duration-200" />
                <textarea
                  id="description"
                  name="description"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter phase description"
                  rows={3}
                  className={`w-full pl-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2B6CB0]/10 focus:border-[#2B6CB0] shadow-sm hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 ${error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
            </div>
          )}
        />

        {/* Order and Status */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="order"
            rules={{ 
              required: 'Order is required',
              min: { value: 1, message: 'Order must be at least 1' }
            }}
            render={({ field, fieldState: { error } }) => (
              <FormField
                label="Order"
                name="order"
                type="number"
                value={field.value?.toString() || ''}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="e.g., 1"
                icon={ListOrdered}
                error={error?.message}
                min="1"
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            rules={{ required: 'Status is required' }}
            render={({ field, fieldState: { error } }) => (
              <SelectField
                label="Status"
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

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
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
      </form>
    </BaseModal>
  );
}
