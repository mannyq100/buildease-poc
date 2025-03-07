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
  Clock,
  Clipboard,
  CheckSquare,
  Users
} from 'lucide-react';

// Shared Components
import { PageHeader } from '@/components/shared';
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent } from '@/components/ui/card';

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
          description="Manage and track project tasks and timelines"
          icon={<Clock className="h-8 w-8" />}
          actions={
            <div className="flex items-center gap-2">
              <Button 
                variant="default"
                className="bg-white hover:bg-gray-100 text-blue-700 border border-white/20"
                onClick={() => setIsTaskFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> New Task
              </Button>
              <Button 
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={handleRefresh}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          }
        />

        {/* Task Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            icon={<Clipboard className="h-6 w-6" />}
            color="blue"
            subtitle="tasks"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={<CheckSquare className="h-6 w-6" />}
            color="green"
            subtitle={`${completedTasks} of ${totalTasks} tasks`}
          />
          <StatCard
            title="Upcoming Deadlines"
            value={upcomingDeadlines}
            icon={<Calendar className="h-6 w-6" />}
            color="amber"
            subtitle="this week"
          />
          <StatCard
            title="Assigned Tasks"
            value={tasks.filter(task => task.assignees && task.assignees.length > 0).length}
            icon={<Users className="h-6 w-6" />}
            color="purple"
            subtitle="with team members"
          />
                  </div>

        <div className="mt-8">
          {/* Filters and Controls */}
          <Card className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search tasks..." 
                    className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
                
                <div className="lg:col-span-3">
                  <TaskFilters 
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                  />
                          </div>
                
                {viewMode === 'tasks' && (
                  <div className="flex items-center justify-end lg:col-span-1 gap-2">
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
            </CardContent>
          </Card>

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