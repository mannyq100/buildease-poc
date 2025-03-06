import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Task, NewTaskForm, TeamMember } from '@/types/schedule';
import { availableProjects, phasesByProject, teamMembers } from '@/data/scheduleData';

const statusOptions = [
  'Not Started',
  'In Progress',
  'Delayed',
  'Blocked',
  'Completed'
];

const priorityOptions = [
  'High',
  'Medium',
  'Low'
];

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTaskForm) => void;
  task?: Task;
  allTasks?: Task[];
}

// Form schema
const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  project: z.string().min(1, 'Project is required'),
  phase: z.string().min(1, 'Phase is required'),
  startDate: z.date(),
  dueDate: z.date(),
  status: z.string().min(1, 'Status is required'),
  priority: z.string().min(1, 'Priority is required'),
  assignedTo: z.array(z.number()).min(1, 'At least one team member must be assigned'),
  completion: z.number().min(0).max(100),
  dependencies: z.array(z.number()).optional(),
});

export const TaskForm = ({ isOpen, onClose, onSubmit, task, allTasks = [] }: TaskFormProps) => {
  const isEditing = !!task;
  const [phases, setPhases] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(task?.project);
  
  // Set up form with default values
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      project: task?.project || '',
      phase: task?.phase || '',
      startDate: task?.startDate ? parseISO(task.startDate) : new Date(),
      dueDate: task?.dueDate ? parseISO(task.dueDate) : new Date(),
      status: task?.status || 'Not Started',
      priority: task?.priority || 'Medium',
      assignedTo: task?.assignedTo.map(member => member.id) || [],
      completion: task?.completion || 0,
      dependencies: task?.dependencies || [],
    },
  });
  
  // Update phases when project changes
  useEffect(() => {
    if (selectedProject) {
      setPhases(phasesByProject[selectedProject] || []);
    }
  }, [selectedProject]);
  
  // Handle project change
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    form.setValue('project', value);
    form.setValue('phase', ''); // Reset phase when project changes
  };
  
  // Handle form submission
  const handleSubmit = (data: z.infer<typeof taskFormSchema>) => {
    const formattedData: NewTaskForm = {
      ...data,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      dueDate: format(data.dueDate, 'yyyy-MM-dd'),
      id: task?.id, // Include ID if editing
    };
    
    onSubmit(formattedData);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the task details below.' 
              : 'Fill in the details below to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the task"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Project Field */}
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={handleProjectChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableProjects.map(project => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Phase Field */}
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedProject}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select phase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {phases.map(phase => (
                          <SelectItem key={phase} value={phase}>
                            {phase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date Field */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Due Date Field */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Priority Field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Assigned Team Members */}
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between w-full",
                            !field.value.length && "text-muted-foreground"
                          )}
                        >
                          {field.value.length > 0
                            ? `${field.value.length} team member${field.value.length > 1 ? 's' : ''} selected`
                            : "Select team members"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search team members..." />
                        <CommandList>
                          <CommandEmpty>No team members found.</CommandEmpty>
                          <CommandGroup>
                            {teamMembers.map((member) => (
                              <CommandItem
                                key={member.id}
                                value={member.name}
                                onSelect={() => {
                                  const current = new Set(field.value);
                                  if (current.has(member.id)) {
                                    current.delete(member.id);
                                  } else {
                                    current.add(member.id);
                                  }
                                  field.onChange(Array.from(current));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.includes(member.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {member.name} ({member.role})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select one or more team members responsible for this task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Completion */}
            <FormField
              control={form.control}
              name="completion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Dependencies */}
            {allTasks.length > 0 && (
              <FormField
                control={form.control}
                name="dependencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dependencies</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between w-full",
                              !field.value?.length && "text-muted-foreground"
                            )}
                          >
                            {field.value?.length > 0
                              ? `${field.value.length} dependenc${field.value.length > 1 ? 'ies' : 'y'} selected`
                              : "No dependencies"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search tasks..." />
                          <CommandList>
                            <CommandEmpty>No tasks found.</CommandEmpty>
                            <CommandGroup>
                              {allTasks
                                // Can't depend on itself or future tasks
                                .filter(t => t.id !== task?.id)
                                .map((dependencyTask) => (
                                  <CommandItem
                                    key={dependencyTask.id}
                                    value={dependencyTask.title}
                                    onSelect={() => {
                                      const current = new Set(field.value || []);
                                      if (current.has(dependencyTask.id)) {
                                        current.delete(dependencyTask.id);
                                      } else {
                                        current.add(dependencyTask.id);
                                      }
                                      field.onChange(Array.from(current));
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value?.includes(dependencyTask.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {dependencyTask.title}
                                    <Badge className="ml-2" variant="outline">
                                      {dependencyTask.status}
                                    </Badge>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select tasks that must be completed before this task can start.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 