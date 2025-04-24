import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phase } from '@/data/mock/generatedPlan/planData';
import { Loader2, Layers, CalendarDays, Clock, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion as m } from 'framer-motion';

interface PhaseFormModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (phase: Partial<Phase>) => void;
  phase?: Phase;
  isNew?: boolean;
  maxOrder?: number;
}

export function PhaseFormModal({ 
  show, 
  onClose, 
  onSave, 
  phase, 
  isNew = true,
  maxOrder = 0
}: PhaseFormModalProps) {
  const [formData, setFormData] = useState<Partial<Phase>>({
    id: '',
    name: '',
    description: '',
    order: 1,
    duration: '',
    startDate: '',
    endDate: '',
    status: 'pending',
    progress: 0,
    tasks: [],
    materials: []
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Initialize form with phase data if editing
  useEffect(() => {
    if (phase) {
      setFormData({
        ...phase
      });
    } else if (isNew) {
      setFormData({
        id: uuidv4(),
        name: '',
        description: '',
        order: maxOrder + 1,
        duration: '',
        startDate: '',
        endDate: '',
        status: 'pending',
        progress: 0,
        tasks: [],
        materials: []
      });
    }
    setError('');
  }, [phase, isNew, maxOrder]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name?.trim()) {
      setError('Phase name is required');
      return;
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        setError('End date must be after start date');
        return;
      }
    }
    
    setSaving(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
      onClose();
    }, 500);
  };
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-lg rounded-xl">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div className="bg-gradient-to-r from-[#2B6CB0] to-[#2B6CB0]/90 p-5 text-white">
            <DialogHeader className="pb-0">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                <div className="bg-white/20 p-1.5 rounded-md">
                  <Layers className="h-5 w-5" />
                </div>
                {isNew ? 'Add New Phase' : 'Edit Phase'}
              </DialogTitle>
              <p className="text-sm text-white/80 mt-2">
                {isNew ? 'Create a new construction phase for your project' : 'Update the details of this construction phase'}
              </p>
            </DialogHeader>
          </div>
          
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <m.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-start gap-2 border border-red-100 dark:border-red-800/30"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </m.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Phase Name</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter phase name"
                  className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Description</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter phase description"
                  className="w-full min-h-[100px] border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Order</span>
                  </Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Duration</span>
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 2 weeks"
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Start Date</span>
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate ? formData.startDate.substring(0, 10) : ''}
                    onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-1.5">
                    <span className="text-[#2B6CB0] dark:text-[#93C5FD]">End Date</span>
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate ? formData.endDate.substring(0, 10) : ''}
                    onChange={handleChange}
                    className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Status</span>
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6CB0] dark:focus:ring-[#2B6CB0]/70 transition-all duration-200"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              
              <DialogFooter className="mt-6 gap-2 pb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90 text-white transition-all duration-200 shadow-sm hover:shadow"
                  disabled={saving}
                >
                  {saving ? (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </m.div>
                  ) : (
                    isNew ? 'Create Phase' : 'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </m.div>
      </DialogContent>
    </Dialog>
  );
}
