import { useState, useEffect } from 'react';
import { Task, NewTaskForm, ViewMode, TeamMember } from '@/types/schedule';
import { initialTasks, teamMembers } from '@/data/scheduleData';
import { filterTasks, searchTasks } from '@/utils/scheduleUtils';
import { TaskList } from '@/components/schedule/TaskList';
import { TaskFilters, TaskFilters as TaskFiltersType } from '@/components/schedule/TaskFilters';
import { TaskDetail } from '@/components/schedule/TaskDetail';
import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskMetrics } from '@/components/schedule/TaskMetrics';
import { TaskCalendar } from '@/components/schedule/TaskCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Calendar, 
  BarChart2, 
  List,
  RefreshCw
} from 'lucide-react';

export default function Schedule() {
  // State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search
    if (searchQuery) {
      result = searchTasks(result, searchQuery);
    }
    
    // Apply filters
    if (Object.values(filters).some(value => value !== undefined)) {
      result = filterTasks(result, filters);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, filters]);
  
  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };
  
  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };
  
  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
    setIsTaskDetailOpen(false);
  };
  
  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };
  
  const handleStatusChange = (taskId: number, newStatus: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus as Task['status'],
              // If marked as completed, set completion to 100%
              completion: newStatus === 'Completed' ? 100 : task.completion
            } 
          : task
      )
    );
  };
  
  // Helper function to get team members from IDs
  const getTeamMembersFromIds = (memberIds: number[]): TeamMember[] => {
    return teamMembers.filter(member => memberIds.includes(member.id));
  };
  
  const handleTaskSubmit = (data: NewTaskForm) => {
    // Check if we're editing an existing task
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === editingTask.id 
            ? { 
                ...task,
                title: data.title,
                description: data.description,
                project: data.project,
                phase: data.phase,
                startDate: data.startDate,
                dueDate: data.dueDate,
                status: data.status,
                priority: data.priority,
                assignedTo: getTeamMembersFromIds(data.assignedTo),
                // Keep existing values for fields not in the form
                completion: data.completion ?? task.completion,
                dependencies: data.dependencies ?? task.dependencies
              } 
            : task
        )
      );
    } else {
      // Create new task
      const newTask: Task = {
        id: Math.max(...tasks.map(t => t.id)) + 1,
        title: data.title,
        description: data.description,
        project: data.project,
        phase: data.phase,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        assignedTo: getTeamMembersFromIds(data.assignedTo),
        completion: data.completion ?? 0, // Default to 0% completion for new tasks
        dependencies: data.dependencies ?? [], // Default to no dependencies
        comments: [],
        attachments: []
      };
      
      setTasks([...tasks, newTask]);
    }
  };
  
  const handleFilterChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTasks(initialTasks);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-gray-500">Manage and track project tasks</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <TaskFilters 
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>
      </div>
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center">
            <List className="h-4 w-4 mr-1" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-1" />
            Metrics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <TaskList 
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            sortBy="dueDate"
            emptyStateMessage={
              searchQuery || Object.values(filters).some(Boolean)
                ? "No tasks match your search or filters"
                : "No tasks found. Create your first task to get started."
            }
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <TaskCalendar 
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
          />
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <TaskMetrics tasks={filteredTasks} />
        </TabsContent>
      </Tabs>
      
      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          allTasks={tasks}
          isOpen={isTaskDetailOpen}
          onClose={handleCloseTaskDetail}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {/* Task Form Dialog */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        allTasks={tasks}
      />
    </div>
  );
} 