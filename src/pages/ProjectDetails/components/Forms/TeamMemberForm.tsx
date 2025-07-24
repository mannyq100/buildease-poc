/**
 * TeamMemberForm - Standardized form component for team member creation/editing
 * Follows BuildEase component architecture standards:
 * - Under 400 lines
 * - Mobile-first responsive design
 * - Strong TypeScript typing
 * - BuildEase color scheme with proper form validation
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Users, Phone, Mail, Save, Plus } from 'lucide-react';
import { TeamMemberFormProps, TeamMemberFormData, FormErrors } from '@/types/projectDetails';

// Team role options
const TEAM_ROLES = [
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Site Supervisor', label: 'Site Supervisor' },
  { value: 'Foreman', label: 'Foreman' },
  { value: 'Architect', label: 'Architect' },
  { value: 'Engineer', label: 'Engineer' },
  { value: 'Electrician', label: 'Electrician' },
  { value: 'Plumber', label: 'Plumber' },
  { value: 'Carpenter', label: 'Carpenter' },
  { value: 'Mason', label: 'Mason' },
  { value: 'Roofer', label: 'Roofer' },
  { value: 'Painter', label: 'Painter' },
  { value: 'HVAC Technician', label: 'HVAC Technician' },
  { value: 'Heavy Equipment Operator', label: 'Heavy Equipment Operator' },
  { value: 'Safety Inspector', label: 'Safety Inspector' },
  { value: 'Quality Controller', label: 'Quality Controller' },
  { value: 'Subcontractor', label: 'Subcontractor' },
  { value: 'Laborer', label: 'Laborer' },
  { value: 'Other', label: 'Other' }
];

// Status options
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on-break', label: 'On Break' },
  { value: 'off-site', label: 'Off Site' }
];

// Default form data
const defaultFormData: TeamMemberFormData = {
  name: '',
  role: 'Laborer',
  status: 'active',
  phone: '',
  email: ''
};

// Form validation
const validateForm = (data: TeamMemberFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.role) {
    errors.role = 'Role is required';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.phone && !/^[\+]?[1-9]?[\d\s\-\(\)]{10,}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }

  return errors;
};

export function TeamMemberForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false
}: TeamMemberFormProps) {
  const [formData, setFormData] = useState<TeamMemberFormData>(defaultFormData);
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
  const handleChange = (field: keyof TeamMemberFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Member Details Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <div className="p-2 bg-buildease-blue-500 rounded-lg text-white">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">
            {mode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
          </h3>
          <p className="text-sm text-slate-600">
            {mode === 'create' 
              ? 'Add a new member to your project team' 
              : 'Update team member information'
            }
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-slate-700">
          Full Name *
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter full name"
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

      {/* Role and Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Role */}
        <div>
          <Label htmlFor="role" className="text-sm font-medium text-slate-700">
            Role *
          </Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleChange('role', value)}
          >
            <SelectTrigger className={`mt-2 ${errors.role ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_ROLES.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
              <AlertTriangle className="h-3 w-3" />
              {errors.role}
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status *
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status.value === 'active' ? 'bg-green-500' :
                      status.value === 'on-break' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center mb-4">
          <Phone className="h-4 w-4 text-buildease-blue-600 mr-2" />
          <h4 className="font-medium text-slate-900">Contact Information</h4>
        </div>
        
        <div className="space-y-4">
          {/* Phone Number */}
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone Number
            </Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="h-3 w-3" />
                {errors.phone}
              </div>
            )}
          </div>

          {/* Email Address */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertTriangle className="h-3 w-3" />
                {errors.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Integration Info */}
      <div className="bg-buildease-blue-50 border border-buildease-blue-200 rounded-lg p-4">
        <div className="text-sm text-slate-700">
          <div className="font-medium mb-1">Team Integration</div>
          <div className="text-slate-600 text-xs">
            This team member will have access to project updates, task assignments, and communication channels based on their role.
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 mr-2" />
          ) : mode === 'create' ? (
            <Plus className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {mode === 'create' ? 'Add Member' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}