/**
 * Schedule.tsx - Task scheduling and management page
 * Allows users to create, view, and manage project tasks with different views
 */
import { useState, useEffect, useCallback } from 'react';
import { Task, NewTaskForm, ViewMode, TeamMember, TaskViewLayout, TaskFiltersType } from '@/types/schedule';
import { initialTasks, teamMembers } from '@/data/scheduleData';
import { filterTasks, searchTasks } from '@/utils/scheduleUtils';

// UI Components
import { PageHeader } from '@/components/shared';
import { TaskList } from '@/components/schedule/TaskList';
import { TaskFilters } from '@/components/schedule/TaskFilters';
import { TaskDetail } from '@/components/schedule/TaskDetail';
import { TaskForm } from '@/components/schedule/TaskForm';
import { TaskCalendar } from '@/components/schedule/TaskCalendar';
import { TaskMetrics } from '@/components/schedule/TaskMetrics';
import { StatCard } from '@/components/shared/StatCard';

// UI Elements
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  Plus,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Calendar,
  BarChart,
  Clock,
  Clipboard,
  CheckSquare,
  AlertTriangle,
  Users,
  Filter,
  CalendarDays
} from 'lucide-react';

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
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [taskViewLayout, setTaskViewLayout] = useState<TaskViewLayout>('grid');
  const [isLoading, setIsLoading] = useState(false);
  
  // Apply filters and search - memoized to prevent infinite loops
  const applyFiltersAndSearch = useCallback(() => {
    let result = [...tasks];
    
    // Apply search
    if (searchQuery) {
      result = searchTasks(result, searchQuery);
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = filterTasks(result, filters);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, filters]);
  
  // Use the memoized function in useEffect
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);
  
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
    return memberIds.map(id => {
      const member = teamMembers.find(m => m.id === id);
      if (!member) {
        throw new Error(`Team member with ID ${id} not found`);
      }
      return member;
    });
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
                status: data.status as Task['status'],
                priority: data.priority as Task['priority'],
                completion: data.completion,
                assignedTo: getTeamMembersFromIds(data.assignedTo)
              }
            : task
        )
      );
    } else {
      // Create a new task
      const newTask: Task = {
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        title: data.title,
        description: data.description,
        project: data.project,
        phase: data.phase,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status as Task['status'],
        priority: data.priority as Task['priority'],
        completion: data.completion,
        assignedTo: getTeamMembersFromIds(data.assignedTo)
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
    
    setIsTaskFormOpen(false);
  };
  
  // Filter handlers - memoized to prevent infinite loops
  const handleFilterChange = useCallback((newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  }, []);
  
  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  const toggleTaskViewLayout = () => {
    setTaskViewLayout(prev => prev === 'grid' ? 'list' : 'grid');
  };
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const delayedTasks = tasks.filter(task => task.status === 'Delayed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const upcomingDeadlines = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const oneWeek = new Date();
    oneWeek.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= oneWeek && task.status !== 'Completed';
  }).length;
  const assignedToTeam = tasks.filter(task => task.assignedTo.length > 0).length;
  
  return (
    <div className="container mx-auto py-4 px-4 max-w-7xl">
      <PageHeader 
        title="Schedule" 
        description="Manage and track project tasks and timelines"
        icon={<Clock className="h-6 w-6 text-blue-600" />}
        actions={[
          {
            label: "New Task",
            icon: <Plus className="h-4 w-4" />,
            onClick: handleCreateTask,
            variant: "default"
          },
          {
            label: "Refresh",
            icon: <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />,
            onClick: handleRefresh,
            variant: "outline"
          }
        ]}
      />
      
      <div className="mt-4 space-y-4">
        {/* Task Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard 
            title="Total Tasks" 
            value={totalTasks.toString()} 
            icon={<Clipboard className="h-5 w-5 text-blue-600" />}
            subtitle="tasks"
            className="shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100"
          />
          <StatCard 
            title="Completion Rate" 
            value={`${completionRate}%`} 
            icon={<CheckSquare className="h-5 w-5 text-green-600" />}
            subtitle={`of ${totalTasks} tasks`}
            colorScheme="green"
            className="shadow-md hover:shadow-lg transition-shadow duration-300 border-green-100"
          />
          <StatCard 
            title="Upcoming Deadlines" 
            value={upcomingDeadlines.toString()} 
            icon={<CalendarDays className="h-5 w-5 text-amber-600" />}
            subtitle="this week"
            colorScheme="amber"
            className="shadow-md hover:shadow-lg transition-shadow duration-300 border-amber-100"
          />
          <StatCard 
            title="Assigned Tasks" 
            value={assignedToTeam.toString()} 
            icon={<Users className="h-5 w-5 text-blue-600" />}
            subtitle="with team members"
            colorScheme="blue"
            className="shadow-md hover:shadow-lg transition-shadow duration-300 border-blue-100"
          />
        </div>
        
        {/* Search, Filters and View Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 items-center p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 h-9 w-full border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-1 flex-wrap gap-2">
              <div className="relative w-[150px]">
                <Select defaultValue="all-projects">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-projects">All Projects</SelectItem>
                    <SelectItem value="villa-construction">Villa Construction</SelectItem>
                    <SelectItem value="office-renovation">Office Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-[150px]">
                <Select defaultValue="all-statuses">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All Statuses</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-[150px]">
                <Select defaultValue="all-priorities">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-priorities">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative w-[180px]">
                <Select defaultValue="all-members">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="All Team Members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-members">All Team Members</SelectItem>
                    <SelectItem value="john-smith">John Smith</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 items-center ml-auto">
              <Button
                variant={taskViewLayout === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTaskViewLayout('grid')}
                className="h-9 px-3 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              
              <Button
                variant={taskViewLayout === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTaskViewLayout('list')}
                className={`h-9 px-3 flex items-center gap-1 ${taskViewLayout === 'list' ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700' : 'border-blue-300 text-blue-700 hover:bg-blue-50'}`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-50 p-1 text-gray-700 mb-4 border border-gray-200 shadow-sm">
            <TabsTrigger value="tasks" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm hover:bg-gray-100/50 data-[state=active]:hover:bg-white">
              <Clipboard className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm hover:bg-gray-100/50 data-[state=active]:hover:bg-white">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="metrics" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm hover:bg-gray-100/50 data-[state=active]:hover:bg-white">
              <BarChart className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>
          
          {/* Main Content Area */}
          <div className="grid grid-cols-1 gap-4">
            <TabsContent value="tasks" className="mt-0">
              <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-0">
                  <TaskList 
                    tasks={filteredTasks} 
                    onTaskClick={handleTaskClick}
                    viewLayout={taskViewLayout}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-0">
              <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-0">
                  <TaskCalendar tasks={filteredTasks} onTaskClick={handleTaskClick} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-0">
              <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-4">
                  <TaskMetrics tasks={filteredTasks} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          allTasks={tasks}
          isOpen={isTaskDetailOpen} 
          onClose={handleCloseTaskDetail}
          onEdit={() => handleEditTask(selectedTask)}
          onDelete={() => {
            handleDeleteTask(selectedTask.id);
            handleCloseTaskDetail();
          }}
          onStatusChange={(taskId, newStatus) => handleStatusChange(taskId, newStatus)}
        />
      )}
      
      {/* Task Form Modal */}
      <TaskForm 
        open={isTaskFormOpen} 
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        teamMembers={teamMembers}
      />
    </div>
  );
}