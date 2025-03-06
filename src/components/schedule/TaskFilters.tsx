import { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { TeamMember } from '@/types/schedule';
import { availableProjects, phasesByProject, teamMembers } from '@/data/scheduleData';

interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilters) => void;
  onReset: () => void;
}

export interface TaskFilters {
  project?: string;
  phase?: string;
  status?: string;
  priority?: string;
  assignedTo?: number;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

const statusOptions = [
  'Completed', 
  'In Progress', 
  'Not Started', 
  'Delayed', 
  'Blocked'
];

const priorityOptions = [
  'High', 
  'Medium', 
  'Low'
];

export const TaskFilters = ({ onFilterChange, onReset }: TaskFiltersProps) => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [phases, setPhases] = useState<string[]>([]);
  
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    setPhases(phasesByProject[value] || []);
    
    const newFilters = {
      ...filters,
      project: value,
      // Clear phase when project changes
      phase: undefined
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleDateChange = (key: keyof TaskFilters, date: Date | undefined) => {
    const newFilters = {
      ...filters,
      [key]: date ? format(date, 'yyyy-MM-dd') : undefined
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const handleReset = () => {
    setFilters({});
    setSelectedProject(undefined);
    setPhases([]);
    onReset();
  };
  
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear filters
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
          {/* Project Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Project</label>
            <Select
              value={filters.project}
              onValueChange={(value) => handleProjectChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map(project => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Phase Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Phase</label>
            <Select
              value={filters.phase}
              onValueChange={(value) => handleFilterChange('phase', value)}
              disabled={!selectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="All phases" />
              </SelectTrigger>
              <SelectContent>
                {phases.map(phase => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Priority Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Assigned To Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <Select
              value={filters.assignedTo?.toString()}
              onValueChange={(value) => handleFilterChange('assignedTo', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Anyone" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range Pickers */}
          <div className="space-y-4 lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date Range</label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !filters.startDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDateFrom ? format(parseISO(filters.startDateFrom), 'PPP') : <span>From</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDateFrom ? parseISO(filters.startDateFrom) : undefined}
                        onSelect={(date) => handleDateChange('startDateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !filters.startDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.startDateTo ? format(parseISO(filters.startDateTo), 'PPP') : <span>To</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDateTo ? parseISO(filters.startDateTo) : undefined}
                        onSelect={(date) => handleDateChange('startDateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Due Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date Range</label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !filters.dueDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateFrom ? format(parseISO(filters.dueDateFrom), 'PPP') : <span>From</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateFrom ? parseISO(filters.dueDateFrom) : undefined}
                        onSelect={(date) => handleDateChange('dueDateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !filters.dueDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateTo ? format(parseISO(filters.dueDateTo), 'PPP') : <span>To</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateTo ? parseISO(filters.dueDateTo) : undefined}
                        onSelect={(date) => handleDateChange('dueDateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 