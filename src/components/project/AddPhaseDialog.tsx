import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface NewPhase {
  name: string;
  startDate: Date;
  endDate: Date;
  budget: string;
  description: string;
}

interface AddPhaseDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  phase: NewPhase;
  setPhase: (phase: NewPhase) => void;
  onSave: () => void;
  // For backward compatibility
  setIsOpen?: (open: boolean) => void;
  newPhase?: NewPhase;
  setNewPhase?: (phase: NewPhase) => void;
  handleAddPhase?: () => void;
}

// Helper for DatePicker component
function DatePicker({ mode, selected, onSelect, initialFocus }: {
  mode: 'single';
  selected: Date;
  onSelect: (date: Date | undefined) => void;
  initialFocus?: boolean;
}) {
  return (
    <CalendarComponent
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
    />
  );
}

/**
 * Dialog for adding a new project phase
 */
export function AddPhaseDialog({ 
  isOpen, 
  onClose,
  phase,
  setPhase,
  onSave,
  // Backward compatibility props
  setIsOpen,
  newPhase,
  setNewPhase,
  handleAddPhase
}: AddPhaseDialogProps) {
  // For backward compatibility
  const actualPhase = phase || newPhase;
  const actualSetPhase = setPhase || setNewPhase;
  const actualOnClose = onClose || setIsOpen;
  const actualOnSave = onSave || handleAddPhase;

  if (!actualPhase || !actualSetPhase || !actualOnClose || !actualOnSave) {
    console.error("AddPhaseDialog: Missing required props");
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={actualOnClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project Phase</DialogTitle>
          <DialogDescription>
            Create a new phase for your construction project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="phase-name">Phase Name</Label>
            <Input
              id="phase-name"
              value={actualPhase.name}
              onChange={(e) => actualSetPhase({ ...actualPhase, name: e.target.value })}
              placeholder="e.g. Foundation Work"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(actualPhase.startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={actualPhase.startDate}
                    onSelect={(date) => date && actualSetPhase({ ...actualPhase, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(actualPhase.endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={actualPhase.endDate}
                    onSelect={(date) => date && actualSetPhase({ ...actualPhase, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phase-budget">Budget</Label>
            <Input
              id="phase-budget"
              value={actualPhase.budget}
              onChange={(e) => actualSetPhase({ ...actualPhase, budget: e.target.value })}
              placeholder="e.g. 25000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phase-description">Description</Label>
            <Textarea
              id="phase-description"
              value={actualPhase.description}
              onChange={(e) => actualSetPhase({ ...actualPhase, description: e.target.value })}
              placeholder="Describe the work to be done in this phase..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => actualOnClose(false)}>Cancel</Button>
          <Button onClick={actualOnSave}>Add Phase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 