import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  Link,
  ExternalLink
} from 'lucide-react';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  MetricCard
} from '@/components/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Mock data for tasks and events
const initialTasks = [
  {
    id: 1,
    title: 'Foundation Inspection',
    project: 'Villa Construction',
    phase: 'Foundation',
    startDate: '2024-05-15',
    dueDate: '2024-05-16',
    status: 'Completed',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/avatars/john-doe.png' },
      { id: 2, name: 'Jane Smith', avatar: '/avatars/jane-smith.png' }
    ],
    completion: 100
  },
  {
    id: 2,
    title: 'Framing Work',
    project: 'Villa Construction',
    phase: 'Structure',
    startDate: '2024-05-17',
    dueDate: '2024-05-25',
    status: 'In Progress',
    priority: 'High',
    assignedTo: [
      { id: 3, name: 'Mike Johnson', avatar: '/avatars/mike-johnson.png' },
      { id: 4, name: 'Sarah Williams', avatar: '/avatars/sarah-williams.png' }
    ],
    completion: 45
  },
  {
    id: 3,
    title: 'Electrical Wiring',
    project: 'Villa Construction',
    phase: 'Electrical',
    startDate: '2024-05-26',
    dueDate: '2024-06-02',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 5, name: 'David Brown', avatar: '/avatars/david-brown.png' }
    ],
    completion: 0
  },
  {
    id: 4,
    title: 'Plumbing Installation',
    project: 'Villa Construction',
    phase: 'Plumbing',
    startDate: '2024-05-26',
    dueDate: '2024-06-02',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 6, name: 'Emily Davis', avatar: '/avatars/emily-davis.png' }
    ],
    completion: 0
  },
  {
    id: 5,
    title: 'Interior Painting',
    project: 'Office Renovation',
    phase: 'Finishing',
    startDate: '2024-05-20',
    dueDate: '2024-05-27',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: [
      { id: 7, name: 'Robert Wilson', avatar: '/avatars/robert-wilson.png' },
      { id: 8, name: 'Lisa Taylor', avatar: '/avatars/lisa-taylor.png' }
    ],
    completion: 60
  },
  {
    id: 6,
    title: 'Flooring Installation',
    project: 'Office Renovation',
    phase: 'Finishing',
    startDate: '2024-05-28',
    dueDate: '2024-06-04',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 9, name: 'Thomas Moore', avatar: '/avatars/thomas-moore.png' }
    ],
    completion: 0
  },
  {
    id: 7,
    title: 'Final Inspection',
    project: 'Office Renovation',
    phase: 'Completion',
    startDate: '2024-06-05',
    dueDate: '2024-06-06',
    status: 'Not Started',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/avatars/john-doe.png' },
      { id: 10, name: 'Amanda Clark', avatar: '/avatars/amanda-clark.png' }
    ],
    completion: 0
  },
  {
    id: 8,
    title: 'Client Walkthrough',
    project: 'Villa Construction',
    phase: 'Completion',
    startDate: '2024-06-10',
    dueDate: '2024-06-10',
    status: 'Not Started',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/avatars/john-doe.png' },
      { id: 11, name: 'Michael Scott', avatar: '/avatars/michael-scott.png' }
    ],
    completion: 0
  }
];

// Project options for filtering
const projects = [
  'All Projects',
  'Villa Construction',
  'Office Renovation'
];

// Phase options for filtering
const phases = [
  'All Phases',
  'Foundation',
  'Structure',
  'Electrical',
  'Plumbing',
  'Finishing',
  'Completion'
];

// Status options for filtering
const statuses = [
  'All Statuses',
  'Not Started',
  'In Progress',
  'Completed',
  'Delayed'
];

// Priority options for filtering
const priorities = [
  'All Priorities',
  'Low',
  'Medium',
  'High'
];

const Schedule = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [phaseFilter, setPhaseFilter] = useState('All Phases');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    phase: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [],
    completion: 0
  });

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.phase.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = 
      projectFilter === 'All Projects' || 
      task.project === projectFilter;
    
    const matchesPhase = 
      phaseFilter === 'All Phases' || 
      task.phase === phaseFilter;
    
    const matchesStatus = 
      statusFilter === 'All Statuses' || 
      task.status === statusFilter;
    
    const matchesPriority = 
      priorityFilter === 'All Priorities' || 
      task.priority === priorityFilter;
    
    return matchesSearch && matchesProject && matchesPhase && matchesStatus && matchesPriority;
  });

  // Calculate schedule statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const upcomingTasks = tasks.filter(t => t.status === 'Not Started' && new Date(t.startDate) <= new Date(new Date().setDate(new Date().getDate() + 7))).length;

  // Handle adding a new task
  const handleAddTask = () => {
    const id = Math.max(...tasks.map(t => t.id)) + 1;
    
    const newTaskItem = {
      ...newTask,
      id,
      completion: newTask.status === 'Completed' ? 100 : 0
    };
    
    setTasks([...tasks, newTaskItem]);
    setNewTask({
      title: '',
      project: '',
      phase: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
      status: 'Not Started',
      priority: 'Medium',
      assignedTo: [],
      completion: 0
    });
    setIsAddTaskOpen(false);
  };

  // Handle updating task status
  const handleUpdateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        status: newStatus,
        completion: newStatus === 'Completed' ? 100 : task.completion
      } : task
    ));
  };

  // Handle deleting a task
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <DashboardLayout>
      {/* Top Header with Actions */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Project Schedule</h1>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Enter the details of the new task to add to the schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="project" className="text-right text-sm font-medium">
                  Project
                </label>
                <Select 
                  onValueChange={(value) => setNewTask({...newTask, project: value})}
                  value={newTask.project}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p !== 'All Projects').map(project => (
                      <SelectItem key={project} value={project}>{project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phase" className="text-right text-sm font-medium">
                  Phase
                </label>
                <Select 
                  onValueChange={(value) => setNewTask({...newTask, phase: value})}
                  value={newTask.phase}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.filter(p => p !== 'All Phases').map(phase => (
                      <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="startDate" className="text-right text-sm font-medium">
                  Start Date
                </label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.startDate ? format(new Date(newTask.startDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={new Date(newTask.startDate)}
                        onSelect={(date) => setNewTask({...newTask, startDate: format(date as Date, 'yyyy-MM-dd')})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="dueDate" className="text-right text-sm font-medium">
                  Due Date
                </label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? format(new Date(newTask.dueDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={new Date(newTask.dueDate)}
                        onSelect={(date) => setNewTask({...newTask, dueDate: format(date as Date, 'yyyy-MM-dd')})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="priority" className="text-right text-sm font-medium">
                  Priority
                </label>
                <Select 
                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
                  value={newTask.priority}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.filter(p => p !== 'All Priorities').map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedule Stats */}
      <Grid cols={4} className="mb-6">
        <MetricCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed"
          value={completedTasks.toString()}
          subtext={`${Math.round((completedTasks / totalTasks) * 100)}% of total`}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="In Progress"
          value={inProgressTasks.toString()}
          subtext="Currently active"
        />
        <MetricCard
          icon={<Calendar className="w-5 h-5" />}
          label="Upcoming"
          value={upcomingTasks.toString()}
          subtext="Next 7 days"
        />
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Total Tasks"
          value={totalTasks.toString()}
          subtext="Across all projects"
        />
      </Grid>

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                className="pl-10" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={projectFilter} 
              onValueChange={setProjectFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={phaseFilter} 
              onValueChange={setPhaseFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map(phase => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={priorityFilter} 
              onValueChange={setPriorityFilter}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <DashboardSection>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Task</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Project / Phase</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Timeline</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium hidden md:table-cell">Priority</th>
                    <th className="text-center py-3 px-4 font-medium">Assigned To</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{task.title}</div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div>{task.project}</div>
                        <div className="text-sm text-gray-500">{task.phase}</div>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span>{format(new Date(task.startDate), 'MMM d')}</span>
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                          <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <Badge className={
                            task.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' 
                              ? 'bg-blue-100 text-blue-800' :
                            task.status === 'Delayed'
                              ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                          }>
                            {task.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex justify-center">
                          <Badge className={
                            task.priority === 'High' 
                              ? 'bg-red-100 text-red-800' : 
                            task.priority === 'Medium' 
                              ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                          }>
                            {task.priority}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <div className="flex -space-x-2">
                            {task.assignedTo.slice(0, 3).map((person, index) => (
                              <Avatar key={person.id} className="border-2 border-white h-8 w-8">
                                <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                            ))}
                            {task.assignedTo.length > 3 && (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 border-2 border-white text-xs font-medium">
                                +{task.assignedTo.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              <span>Edit Task</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'Not Started')}>
                              <span>Not Started</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}>
                              <span>In Progress</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}>
                              <span>Completed</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, 'Delayed')}>
                              <span>Delayed</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tasks found matching your search criteria.
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="calendar">
          <DashboardSection>
            <div className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Calendar View</h3>
              <p className="text-gray-500 mb-4">
                View your tasks and deadlines in a monthly calendar format.
              </p>
              <Button>Open Full Calendar</Button>
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="gantt">
          <DashboardSection>
            <div className="p-6 text-center">
              <ExternalLink className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Gantt Chart View</h3>
              <p className="text-gray-500 mb-4">
                Visualize project timelines and dependencies in a Gantt chart.
              </p>
              <Button>Open Gantt Chart</Button>
            </div>
          </DashboardSection>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Schedule; 