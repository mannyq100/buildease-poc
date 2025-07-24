/**
 * TeamModal - Construction team member management modal
 * Mobile-first design optimized for construction site usage
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseModal } from '@/components/ui/BaseModal';
import { Users, Phone } from 'lucide-react';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TeamMemberFormData) => void;
  mode: 'create' | 'edit';
  initialData?: TeamMemberFormData;
  isLoading?: boolean;
}

interface TeamMemberFormData {
  name: string;
  role: string;
  status: 'active' | 'on-break' | 'off-site';
  phone?: string;
  email?: string;
  specialization?: string;
  hourlyRate?: number;
}

export function TeamModal({ 
  isOpen, 
  onClose, 
  onSave, 
  mode, 
  initialData,
  isLoading = false 
}: TeamModalProps) {
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: initialData?.name || '',
    role: initialData?.role || '',
    status: initialData?.status || 'active',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    specialization: initialData?.specialization || '',
    hourlyRate: initialData?.hourlyRate || 0
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.role) {
      return;
    }
    
    onSave(formData);
  };

  const handleInputChange = (field: keyof TeamMemberFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Team Member' : 'Edit Team Member'}
      description="Manage project team members and their roles"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 h-12 bg-buildease-orange-500 hover:bg-buildease-orange-600 text-white font-medium rounded-lg touch-manipulation"
          >
            <Users className="h-4 w-4 mr-2" />
            {mode === 'create' ? 'Add Member' : 'Save Changes'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12 border-2 border-slate-300 text-slate-700 font-medium rounded-lg touch-manipulation"
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name *
          </Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter full name"
            className="h-12 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg"
          />
        </div>

        {/* Role Selection - Construction-specific roles */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Role *
          </Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => handleInputChange('role', value)}
          >
            <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Project Manager">Project Manager</SelectItem>
              <SelectItem value="Site Supervisor">Site Supervisor</SelectItem>
              <SelectItem value="Foreman">Foreman</SelectItem>
              <SelectItem value="Safety Officer">Safety Officer</SelectItem>
              <SelectItem value="Electrician">Electrician</SelectItem>
              <SelectItem value="Plumber">Plumber</SelectItem>
              <SelectItem value="Carpenter">Carpenter</SelectItem>
              <SelectItem value="Mason">Mason</SelectItem>
              <SelectItem value="Roofer">Roofer</SelectItem>
              <SelectItem value="HVAC Technician">HVAC Technician</SelectItem>
              <SelectItem value="Heavy Equipment Operator">Heavy Equipment Operator</SelectItem>
              <SelectItem value="Laborer">General Laborer</SelectItem>
              <SelectItem value="Quality Inspector">Quality Inspector</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Current Status
          </Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: 'active' | 'on-break' | 'off-site') => handleInputChange('status', value)}
          >
            <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Active on Site
                </div>
              </SelectItem>
              <SelectItem value="on-break">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                  On Break
                </div>
              </SelectItem>
              <SelectItem value="off-site">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-slate-500 rounded-full"></div>
                  Off Site
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="h-12 pl-10 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
              className="h-12 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg"
            />
          </div>
        </div>

        {/* Specialization */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Specialization <span className="text-xs text-slate-500">(optional)</span>
          </Label>
          <Input
            type="text"
            value={formData.specialization || ''}
            onChange={(e) => handleInputChange('specialization', e.target.value)}
            placeholder="e.g., Residential framing, Commercial electrical, etc."
            className="h-12 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg"
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Hourly Rate <span className="text-xs text-slate-500">(optional)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
            <Input
              type="number"
              value={formData.hourlyRate || ''}
              onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="h-12 pl-8 border-2 border-slate-300 focus:border-buildease-orange-500 rounded-lg"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Construction Team Tips */}
        <div className="p-3 bg-buildease-orange-50 rounded-lg border border-buildease-orange-200">
          <h4 className="text-sm font-semibold text-buildease-orange-900 mb-2">
            👷 Team Management Tips
          </h4>
          <ul className="text-xs text-buildease-orange-800 space-y-1">
            <li>• Keep emergency contact info up to date</li>
            <li>• Track certifications and safety training</li>
            <li>• Update status regularly for accurate scheduling</li>
            <li>• Maintain clear communication channels</li>
          </ul>
        </div>
      </div>
    </BaseModal>
  );
}
