/**
 * ProjectUpdateForm Component
 * 
 * Comprehensive form for updating project properties including:
 * - Basic info (name, description, status)
 * - Timeline (start date, end date)
 * - Budget (allocated budget, currency)
 * - Location and project type
 * 
 * Features:
 * - Mobile-first responsive design
 * - BuildEase color scheme and styling
 * - Form validation with error handling
 * - Integration with Supabase mutations
 */

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TouchOptimizedButton } from '@/components/ui/TouchOptimizedButton';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  MapPin, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { Project } from '@/types/project';

// Validation schema
const projectUpdateSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(100, 'Project name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  status: z.enum(['active', 'planning', 'completed', 'on-hold'] as const),
  client: z.string().min(2, 'Client name is required'),
  street_address: z.string().min(5, 'Street address is required').max(200, 'Street address too long'),
  project_type: z.string().min(2, 'Project type is required'),
  budget: z.number().min(1000, 'Budget must be at least $1,000').max(100000000, 'Budget too high'),
  currency: z.string().min(3, 'Currency is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: "End date must be after start date",
  path: ["end_date"],
});

type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>;

interface FormErrors {
  [key: string]: string;
}

// Helper function to parse location string into components
function parseLocation(location: string): { street_address: string; city: string; region: string; country: string } {
  // Split location by commas and trim each part
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 4) {
    return {
      street_address: parts[0] || '',
      city: parts[1] || '',
      region: parts[2] || '',
      country: parts[3] || ''
    };
  } else if (parts.length === 3) {
    return {
      street_address: parts[0] || '',
      city: parts[1] || '',
      region: parts[2] || '',
      country: ''
    };
  } else if (parts.length === 2) {
    return {
      street_address: parts[0] || '',
      city: parts[1] || '',
      region: '',
      country: ''
    };
  } else {
    return {
      street_address: location || '',
      city: '',
      region: '',
      country: ''
    };
  }
}

// Helper function to combine location components back into a string
function combineLocation(street_address: string, city: string, region: string, country: string): string {
  const parts = [street_address, city, region, country].filter(part => part && part.trim());
  return parts.join(', ');
}

interface ProjectUpdateFormProps {
  project: Project;
  onSubmit: (data: ProjectUpdateFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PROJECT_TYPES = [
  'Residential Construction',
  'Commercial Construction', 
  'Industrial Construction',
  'Infrastructure',
  'Renovation',
  'Remodeling',
  'Landscaping',
  'Custom Build'
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

const STATUS_OPTIONS = [
  { value: 'planning' as const, label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  { value: 'active' as const, label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'on-hold' as const, label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed' as const, label: 'Completed', color: 'bg-gray-100 text-gray-800' },
];

export function ProjectUpdateForm({ 
  project, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ProjectUpdateFormProps) {
  // Parse the project location into components
  const locationParts = parseLocation(project.location || '');
  
  const [formData, setFormData] = useState<ProjectUpdateFormData>({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'planning',
    client: project.client || '',
    street_address: locationParts.street_address,
    project_type: project.project_type || '',
    budget: project.budget || 0,
    currency: project.currency || 'USD',
    start_date: project.start_date ? project.start_date.split('T')[0] : '',
    end_date: project.end_date ? project.end_date.split('T')[0] : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      const locationParts = parseLocation(project.location || '');
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        client: project.client || '',
        street_address: locationParts.street_address,
        project_type: project.project_type || '',
        budget: project.budget || 0,
        currency: project.currency || 'USD',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
      });
    }
  }, [project]);

  const validateField = (name: string, value: any) => {
    try {
      const fieldSchema = projectUpdateSchema.pick({ [name]: true } as any);
      fieldSchema.parse({ [name]: value });
      
      // Remove error if validation passes
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0]?.message || 'Invalid value'
        }));
      }
    }
  };

  const handleInputChange = (field: keyof ProjectUpdateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field));
    
    // Validate field on change
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate entire form
      const validatedData = projectUpdateSchema.parse(formData);
      
      // Use only street address for location
      const { street_address, ...otherData } = validatedData;
      const originalLocationParts = parseLocation(project.location || '');
      const combinedLocation = combineLocation(
        street_address, 
        originalLocationParts.city, 
        originalLocationParts.region, 
        originalLocationParts.country
      );
      
      // Create submit data with combined location
      const submitData = {
        ...otherData,
        location: combinedLocation
      };
      
      // Mark all fields as touched to show any remaining errors
      setTouchedFields(new Set(Object.keys(formData)));
      
      await onSubmit(submitData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        
        // Mark all fields as touched to show errors
        setTouchedFields(new Set(Object.keys(formData)));
      }
    }
  };

  const shouldShowError = (fieldName: string) => {
    return touchedFields.has(fieldName) && errors[fieldName];
  };

  const selectedStatus = STATUS_OPTIONS.find(option => option.value === formData.status);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Basic Information */}
      <Card className="border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Project Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={cn(
                  "h-12",
                  shouldShowError('name') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                )}
                placeholder="Enter project name"
                disabled={isLoading}
              />
              {shouldShowError('name') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Client *
              </label>
              <Input
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                className={cn(
                  "h-12",
                  shouldShowError('client') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                )}
                placeholder="Client name"
                disabled={isLoading}
              />
              {shouldShowError('client') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.client}
                </div>
              )}
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Type *
              </label>
              <Select 
                value={formData.project_type} 
                onValueChange={(value) => handleInputChange('project_type', value)}
                disabled={isLoading}
              >
                <SelectTrigger className={cn(
                  "h-12",
                  shouldShowError('project_type') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                )}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shouldShowError('project_type') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.project_type}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Status *
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <TouchOptimizedButton
                    key={option.value}
                    type="button"
                    touchSize="sm"
                    variant={formData.status === option.value ? "default" : "outline"}
                    onClick={() => handleInputChange('status', option.value)}
                    className={cn(
                      "transition-all duration-200",
                      formData.status === option.value 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : "hover:bg-blue-50"
                    )}
                    disabled={isLoading}
                  >
                    <Badge variant="secondary" className={cn("mr-2", option.color)}>
                      {option.label}
                    </Badge>
                  </TouchOptimizedButton>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Description */}
      <Card className="border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Description</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={cn(
                "min-h-[100px] resize-none",
                shouldShowError('description') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
              )}
              placeholder="Describe the project scope, objectives, and key details..."
              disabled={isLoading}
            />
            {shouldShowError('description') && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location - Street Address Editable */}
      <Card className="border-orange-200/60 bg-gradient-to-br from-white to-orange-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Project Location</h3>
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-md">Street Address Only</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Street Address - Editable */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Street Address *
              </label>
              <Input
                value={formData.street_address}
                onChange={(e) => handleInputChange('street_address', e.target.value)}
                className={cn(
                  "h-12",
                  shouldShowError('street_address') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-orange-500"
                )}
                placeholder="Enter street address"
                disabled={isLoading}
              />
              {shouldShowError('street_address') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.street_address}
                </div>
              )}
            </div>

            
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Street address can be updated. City, state/region, and country remain unchanged.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Timeline */}
      <Card className="border-green-200/60 bg-gradient-to-br from-white to-green-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Budget & Timeline</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Total Budget *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className={cn(
                    "h-12 pl-10",
                    shouldShowError('budget') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  )}
                  placeholder="0"
                  min="1000"
                  step="100"
                  disabled={isLoading}
                />
              </div>
              {shouldShowError('budget') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.budget}
                </div>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Currency *
              </label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleInputChange('currency', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className={cn(
                    "h-12 pl-10",
                    shouldShowError('start_date') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  )}
                  disabled={isLoading}
                />
              </div>
              {shouldShowError('start_date') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.start_date}
                </div>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className={cn(
                    "h-12 pl-10",
                    shouldShowError('end_date') ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  )}
                  disabled={isLoading}
                />
              </div>
              {shouldShowError('end_date') && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.end_date}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <TouchOptimizedButton
          type="button"
          touchSize="lg"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 sm:flex-none sm:min-w-[120px]"
        >
          Cancel
        </TouchOptimizedButton>
        
        <TouchOptimizedButton
          type="submit"
          touchSize="lg"
          disabled={isLoading || Object.keys(errors).length > 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                     text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Update Project
            </div>
          )}
        </TouchOptimizedButton>
      </div>
    </form>
  );
}