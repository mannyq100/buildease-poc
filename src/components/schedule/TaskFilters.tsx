import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
}

const statusOptions = [
  'All Statuses',
  'Completed', 
  'In Progress', 
  'Not Started', 
  'Delayed', 
  'Blocked'
];

const priorityOptions = [
  'All Priorities',
  'High', 
  'Medium', 
  'Low'
];

export const TaskFilters = ({ onFilterChange, onReset }: TaskFiltersProps) => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const [phases, setPhases] = useState<string[]>([]);
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [assigneeFilter, setAssigneeFilter] = useState('All Team Members');
  
  useEffect(() => {
    // Apply filters whenever they change
    const activeFilters: TaskFilters = {};
    
    if (projectFilter !== 'All Projects') {
      activeFilters.project = projectFilter;
      setSelectedProject(projectFilter);
      setPhases(phasesByProject[projectFilter] || []);
    }
    
    if (statusFilter !== 'All Statuses') {
      activeFilters.status = statusFilter;
    }
    
    if (priorityFilter !== 'All Priorities') {
      activeFilters.priority = priorityFilter;
    }
    
    if (assigneeFilter !== 'All Team Members') {
      const memberId = parseInt(assigneeFilter);
      if (!isNaN(memberId)) {
        activeFilters.assignedTo = memberId;
      }
    }
    
    setFilters(activeFilters);
    onFilterChange(activeFilters);
  }, [projectFilter, statusFilter, priorityFilter, assigneeFilter, onFilterChange]);
  
  const handleReset = () => {
    setProjectFilter('All Projects');
    setStatusFilter('All Statuses');
    setPriorityFilter('All Priorities');
    setAssigneeFilter('All Team Members');
    setSelectedProject(undefined);
    setPhases([]);
    setFilters({});
    onReset();
  };
  
  const hasActiveFilters = 
    projectFilter !== 'All Projects' || 
    statusFilter !== 'All Statuses' || 
    priorityFilter !== 'All Priorities' || 
    assigneeFilter !== 'All Team Members';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Projects">All Projects</SelectItem>
            {availableProjects.map(project => (
              <SelectItem key={project} value={project}>{project}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(priority => (
              <SelectItem key={priority} value={priority}>{priority}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Team Members">All Team Members</SelectItem>
              {teamMembers.map(member => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            className="whitespace-nowrap"
          >
            Clear
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}; 