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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface Phase {
  id: number;
  name: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  budget?: string;
  spent?: string;
}

interface Task {
  name: string;
  description: string;
  dueDate: Date;
  assigneeId?: string;
}

// For backward compatibility
interface NewTask {
  title: string;
  phaseId: number;
  description: string;
  startDate: Date;
  endDate: Date;
  priority: string;
  assignee: string;
}

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  task: Task;
  setTask: (task: Task) => void;
  onSave: () => void;
  phases?: Phase[];
  // For backward compatibility
  setIsOpen?: (open: boolean) => void;
  newTask?: NewTask;
  setNewTask?: (task: NewTask) => void;
  handleAddTask?: () => void;
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
 * Dialog for adding a new task to a project phase
 */
export function AddTaskDialog({ 
  isOpen, 
  onClose,
  task,
  setTask,
  onSave,
  phases = [],
  // Backward compatibility props
  setIsOpen,
  newTask,
  setNewTask,
  handleAddTask
}: AddTaskDialogProps) {
  const actualOnClose = onClose || setIsOpen;
  const actualOnSave = onSave || handleAddTask;
  
  // Check if we're using the new interface or the old one
  const isNewInterface = !!task;
  
  if (!actualOnClose || !actualOnSave) {
    console.error("AddTaskDialog: Missing required props");
    return null;
  }
  
  // For new interface
  const handleNameChange = (value: string) => {
    if (isNewInterface && setTask) {
      setTask({ ...task, name: value });
    } else if (newTask && setNewTask) {
      setNewTask({ ...newTask, title: value });
    }
  };
  
  const handleDescriptionChange = (value: string) => {
    if (isNewInterface && setTask) {
      setTask({ ...task, description: value });
    } else if (newTask && setNewTask) {
      setNewTask({ ...newTask, description: value });
    }
  };
  
  const handleDueDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    if (isNewInterface && setTask) {
      setTask({ ...task, dueDate: date });
    } else if (newTask && setNewTask) {
      setNewTask({ ...newTask, endDate: date });
    }
  };
  
  const handleAssigneeChange = (value: string) => {
    if (isNewInterface && setTask) {
      setTask({ ...task, assigneeId: value });
    } else if (newTask && setNewTask) {
      setNewTask({ ...newTask, assignee: value });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={actualOnClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for your project phase.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={isNewInterface ? task.name : (newTask?.title || '')}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Pour concrete for foundation"
            />
          </div>
          
          {newTask && setNewTask && phases && phases.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="task-phase">Project Phase</Label>
              <Select
                value={newTask.phaseId.toString()}
                onValueChange={(value) => setNewTask({ ...newTask, phaseId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id.toString()}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {isNewInterface 
                    ? format(task.dueDate, 'PPP') 
                    : (newTask ? format(newTask.endDate, 'PPP') : 'Select date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <DatePicker
                  mode="single"
                  selected={isNewInterface ? task.dueDate : (newTask?.endDate || new Date())}
                  onSelect={handleDueDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {newTask && setNewTask && (
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <Input
              id="task-assignee"
              value={isNewInterface ? (task.assigneeId || '') : (newTask?.assignee || '')}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              placeholder="e.g. John Smith"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={isNewInterface ? task.description : (newTask?.description || '')}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe the task..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => actualOnClose(false)}>Cancel</Button>
          <Button onClick={actualOnSave}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 