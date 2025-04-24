import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, AlertCircle } from 'lucide-react';
import { motion as m } from 'framer-motion';

interface DateEditModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (startDate: string, endDate: string) => void;
  title: string;
  startDate?: string;
  endDate?: string;
  saving?: boolean;
}

export function DateEditModal({ 
  show, 
  onClose, 
  onSave, 
  title,
  startDate: initialStartDate, 
  endDate: initialEndDate,
  saving = false
}: DateEditModalProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Initialize form with provided dates
  useEffect(() => {
    if (initialStartDate) {
      setStartDate(initialStartDate.substring(0, 10));
    } else {
      setStartDate('');
    }
    
    if (initialEndDate) {
      setEndDate(initialEndDate.substring(0, 10));
    } else {
      setEndDate('');
    }
    
    setError('');
  }, [initialStartDate, initialEndDate, show]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    
    if (!endDate) {
      setError('End date is required');
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setError('End date must be after start date');
      return;
    }
    
    // Clear error and save
    setError('');
    onSave(startDate, endDate);
  };
  
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0 shadow-lg rounded-xl">
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
                  <Calendar className="h-5 w-5" />
                </div>
                {title}
              </DialogTitle>
              <p className="text-sm text-white/80 mt-2">
                Adjust the start and end dates for better project planning
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
                <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">Start Date</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-1.5">
                  <span className="text-[#2B6CB0] dark:text-[#93C5FD]">End Date</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-700 focus:border-[#2B6CB0] focus:ring-[#2B6CB0]/20 transition-all duration-200"
                  required
                />
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
                    'Save Changes'
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
