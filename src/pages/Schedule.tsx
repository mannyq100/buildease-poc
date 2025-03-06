/**
 * Schedule.tsx - Task scheduling and management page
 * Allows users to create, view, and manage project tasks with different views
 */
import { useState, useEffect } from 'react';
import { Task, NewTaskForm, ViewMode, TeamMember, TaskViewLayout } from '@/types/schedule';
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
  LayoutGrid,
  RefreshCw,
  Clock
} from 'lucide-react';

// Shared Components
import { PageHeader } from '@/components/shared';

/**
 * Schedule page component for task management
 */
export function Schedule() {
  // State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [taskViewLayout, setTaskViewLayout] = useState<TaskViewLayout>('grid');
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
  
  // Task handlers
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
    if (data.id) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === data.id 
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
                completion: data.completion ?? task.completion,
                assignedTo: getTeamMembersFromIds(data.assignedTo),
                dependencies: data.dependencies ?? task.dependencies
              } 
            : task
        )
      );
    } else {
      // Create a new task
      const newTask: Task = {
        id: Date.now(), // Generate a simple ID
        title: data.title,
        description: data.description,
        project: data.project,
        phase: data.phase,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        completion: data.completion ?? 0,
        assignedTo: getTeamMembersFromIds(data.assignedTo),
        dependencies: data.dependencies
      };
      
      setTasks([...tasks, newTask]);
    }
    
    setIsTaskFormOpen(false);
  };
  
  // Filter handlers
  const handleFilterChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTasks(initialTasks);
      setIsLoading(false);
    }, 1000);
  };
  
  const toggleTaskViewLayout = () => {
    setTaskViewLayout(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  // Calculate metrics for header
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const upcomingDeadlines = tasks.filter(task => 
    task.status !== 'Completed' && 
    new Date(task.dueDate) > new Date() && 
    new Date(task.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Schedule"
          subtitle="Manage and track project tasks and timelines"
          icon={<Clock className="h-6 w-6" />}
          gradient={true}
          animated={true}
          theme="blue"
          actions={[
            {
              label: "Refresh",
              icon: <RefreshCw className={isLoading ? 'animate-spin' : ''} />,
              variant: "blueprint",
              onClick: handleRefresh
            },
            {
              label: "New Task",
              icon: <Plus />,
              variant: "construction",
              onClick: handleCreateTask
            }
          ]}
        />
        
        <div className="mt-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="tasks" className="flex items-center">
                  <List className="h-4 w-4 mr-1" />
                  Tasks
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
              
              {viewMode === 'tasks' && (
                <div className="flex gap-2">
                  <Button
                    variant={taskViewLayout === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskViewLayout('grid')}
                    className="flex items-center"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Grid
                  </Button>
                  <Button
                    variant={taskViewLayout === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTaskViewLayout('list')}
                    className="flex items-center"
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                </div>
              )}
            </div>
            
            <TabsContent value="tasks" className="mt-4">
              <TaskList 
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                sortBy="dueDate"
                viewLayout={taskViewLayout}
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
        </div>
        
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
    </div>
  );
} 