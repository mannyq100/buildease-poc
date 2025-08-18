/**
 * PhaseForm - Standardized form component for project phase creation/editing
 * Follows BuildEase component architecture standards:
 * - Under 400 lines
 * - Mobile-first responsive design
 * - Strong TypeScript typing
 * - BuildEase color scheme with integrated phase templates
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PhaseSelector } from '@/components/shared/forms/PhaseSelector';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Save, 
  Plus,
  X 
} from 'lucide-react';
import { PhaseFormProps, PhaseFormData, FormErrors, PhaseStatus } from '@/types/projectDetails';
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from '@/components/ui/select';
import { ProjectType } from '@/utils/phaseUtils';

// Default task template structure for compatibility
interface TaskTemplate {
  id: string;
  name: string;
  alternativeNames: string[];
  enabled: boolean;
}

// Default form data
const defaultFormData: PhaseFormData = {
  name: '',
  category: '',
  description: '',
  startDate: '',
  endDate: ''
};

// Form validation
const validateForm = (data: PhaseFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Phase name is required';
  }

  if (!data.category.trim()) {
    errors.category = 'Phase category is required';
  }

  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    errors.endDate = 'End date must be after start date';
  }

  return errors;
};

interface PhaseFormWithFooterProps extends PhaseFormProps {
  onCancel?: () => void;
  submitButtonText?: string;
}

// Internal form component
function PhaseFormContent({
  mode,
  initialData,
  projectType,
  onSubmit,
  isLoading = false
}: PhaseFormProps) {
  const [formData, setFormData] = useState<PhaseFormData>(defaultFormData);
  const [selectedTasks, setSelectedTasks] = useState<TaskTemplate[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  // Handle form field changes
  const handleChange = (field: keyof PhaseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle phase category selection
  const handleCategorySelect = (category: string, phaseName: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      name: phaseName
    }));
    
    // Clear related errors
    setErrors(prev => ({ ...prev, category: '', name: '' }));
  };

  // Handle task template preview
  const handleTasksPreview = (
    tasks: Array<{ id?: string; name?: string; alternativeNames?: string[] } | string>
  ) => {
    const editableTasks: TaskTemplate[] = tasks.map((task, index) => {
      if (typeof task === 'string') {
        return {
          id: `task-${index}`,
          name: task,
          alternativeNames: [],
          enabled: true,
        };
      }
      return {
        id: task.id || `task-${index}`,
        name: task.name || `Task ${index + 1}`,
        alternativeNames: task.alternativeNames || [],
        enabled: true,
      };
    });
    setSelectedTasks(editableTasks);
  };

  // Toggle task selection
  const toggleTask = (taskIndex: number) => {
    setSelectedTasks(prev => 
      prev.map((task, index) => 
        index === taskIndex ? { ...task, enabled: !task.enabled } : task
      )
    );
  };

  // Remove task from list
  const removeTask = (taskIndex: number) => {
    setSelectedTasks(prev => prev.filter((_, index) => index !== taskIndex));
  };

  // Select/deselect all tasks
  const toggleAllTasks = (enable: boolean) => {
    setSelectedTasks(prev => prev.map(task => ({ ...task, enabled: enable })));
  };

  // Calculate phase duration
  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const enabledTaskIds = selectedTasks
        .filter(task => task.enabled)
        .map(task => task.id);
      
      await onSubmit(formData, enabledTaskIds);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Remove the invalid useImperativeHandle call
  // The form is submitted via the form's onSubmit handler and form="phase-form" on the submit button

  const duration = calculateDuration();

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="phase-form">
      {/* Phase Template Selection */}
      {mode === 'create' && (
        <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/60 to-buildease-blue-50/20 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-buildease-blue-500/10 text-buildease-blue-700 mr-2 ring-1 ring-buildease-blue-200/40">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">Choose Phase Template</h3>
          </div>
          
          <div className="bg-buildease-blue-50/70 rounded-lg p-3 mb-4 border border-buildease-blue-200/70">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {projectType?.replace('_', ' ').replace('-', ' ') || 'Standard Project'}
              </span>
              <span className="text-xs text-buildease-blue-700 font-medium">
                Smart Recommendations
              </span>
            </div>
          </div>
          
          <PhaseSelector
            projectType={projectType as ProjectType || 'new_construction'}
            selectedCategory={formData.category}
            onCategorySelect={handleCategorySelect}
            onTasksPreview={handleTasksPreview}
            showTaskPreview={true}
          />
          
          {errors.category && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertTriangle className="h-3 w-3" />
              {errors.category}
            </div>
          )}
        </div>
      )}

      {/* Default Tasks Selection */}
      {selectedTasks.length > 0 && (
        <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">
                Default Tasks ({selectedTasks.filter(t => t.enabled).length}/{selectedTasks.length})
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleAllTasks(true)}
                className="text-white hover:bg-white/20 text-xs px-2 py-1 h-auto"
              >
                All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleAllTasks(false)}
                className="text-white hover:bg-white/20 text-xs px-2 py-1 h-auto"
              >
                None
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-2">
              {selectedTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:ring-1 hover:ring-emerald-300/60 ${
                    task.enabled 
                      ? 'bg-emerald-50/80 border border-emerald-200' 
                      : 'bg-slate-50/80 border border-slate-200 opacity-70'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={task.enabled}
                    onChange={() => toggleTask(index)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <label 
                      htmlFor={`task-${task.id}`}
                      className={`block text-sm cursor-pointer ${
                        task.enabled 
                          ? 'text-slate-900 font-medium' 
                          : 'text-slate-500 line-through'
                      }`}
                    >
                      {task.name}
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            {selectedTasks.filter(t => t.enabled).length === 0 && selectedTasks.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                  <p className="text-amber-800 text-sm">
                    No tasks selected - phase will be created without default tasks
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase Details */}
      <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm p-4">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-buildease-blue-500 rounded-lg text-white mr-3 shadow-sm">
            <Calendar className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-slate-900">Phase Details</h3>
        </div>
        
        <div className="space-y-4">
          {/* Phase Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Phase Name *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Foundation & Structural Work"
              className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="h-3 w-3" />
                {errors.name}
              </div>
            )}
          </div>
          
          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the phase objectives and key deliverables..."
              className="mt-2 resize-none"
              rows={3}
            />
          </div>

          {/* Status (Edit only) */}
          {mode === 'edit' && (
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                Status
              </Label>
              <Select
                value={(formData.status || 'PLANNING') as PhaseStatus}
                onValueChange={(val) => handleChange('status', val as PhaseStatus)}
              >
                <SelectTrigger id="status" className="mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg p-4 border border-buildease-blue-200 bg-gradient-to-br from-buildease-blue-50/80 via-white to-buildease-orange-50/40">
            <div className="flex items-center mb-3">
              <Calendar className="h-4 w-4 text-buildease-blue-600 mr-2" />
              <h4 className="font-medium text-slate-900">Timeline</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`mt-1 ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.endDate}
                  </div>
                )}
              </div>
            </div>

            
            {/* Duration Display */}
            {duration > 0 && (
              <div className="mt-3 p-2 bg-white rounded border border-buildease-blue-200 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-slate-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Duration
                  </div>
                  <span className="font-semibold text-buildease-orange-600">
                    {duration} days
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </form>
  );
}

// Footer component for BaseModal
export function PhaseFormFooter({
  mode,
  isLoading = false,
  onCancel,
  submitButtonText
}: {
  mode: 'create' | 'edit';
  isLoading?: boolean;
  onCancel?: () => void;
  submitButtonText?: string;
}) {
  return (
    <div className="flex justify-end gap-3">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="min-h-[44px] px-6"
        >
          Cancel
        </Button>
      )}
      <Button
        type="submit"
        form="phase-form"
        disabled={isLoading}
        className="bg-gradient-to-r from-buildease-orange-500 to-buildease-orange-600 hover:from-buildease-orange-600 hover:to-buildease-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 min-h-[44px]"
      >
        {isLoading ? (
          <div className="animate-spin h-4 w-4 mr-2" />
        ) : mode === 'create' ? (
          <Plus className="h-5 w-5 mr-2" />
        ) : (
          <Save className="h-5 w-5 mr-2" />
        )}
        {submitButtonText || (mode === 'create' ? 'Create Phase' : 'Save Changes')}
      </Button>
    </div>
  );
}

// Main export component - just the form content for BaseModal
export function PhaseForm({
  mode,
  initialData,
  projectType,
  onSubmit,
  isLoading = false
}: PhaseFormProps) {
  return (
    <PhaseFormContent 
      mode={mode}
      initialData={initialData}
      projectType={projectType}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}