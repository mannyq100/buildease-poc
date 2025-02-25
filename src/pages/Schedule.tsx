import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  ExternalLink,
  ChevronDown,
  Bell,
  FileDown,
  CheckSquare,
  X,
  Info,
  Paperclip,
  MessageSquare,
  ChevronUp,
  BarChart,
  ListFilter,
  Clock8,
  CircleDashed,
  AlertCircle,
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
import { format, addDays, differenceInDays, isBefore, isAfter, parseISO, isToday, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define task type
interface Task {
  id: number;
  title: string;
  description?: string;
  project: string;
  phase: string;
  startDate: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: TeamMember[];
  completion: number;
  dependencies?: number[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  selected?: boolean;
}

// Define team member type
interface TeamMember {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
  department?: string;
}

// Define task comment type
interface TaskComment {
  id: number;
  author: TeamMember;
  text: string;
  date: string;
}

// Define task attachment type
interface TaskAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: TeamMember;
  uploadDate: string;
}

// Define task dependency type
interface TaskDependency {
  id: number;
  sourceTaskId: number;
  targetTaskId: number;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

// Mock data for tasks and events
const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Foundation Inspection',
    description: 'Perform comprehensive inspection of foundation work to ensure compliance with building codes and project specifications.',
    project: 'Villa Construction',
    phase: 'Foundation',
    startDate: '2024-05-15',
    dueDate: '2024-05-16',
    status: 'Completed',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
      { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/32/32', role: 'Civil Engineer' }
    ],
    completion: 100,
    comments: [
      { 
        id: 1, 
        author: { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32' },
        text: 'Inspection completed successfully. All foundation elements meet specifications.',
        date: '2024-05-16T14:30:00'
      }
    ],
    attachments: [
      {
        id: 1,
        name: 'foundation_inspection_report.pdf',
        type: 'application/pdf',
        size: '2.4 MB',
        uploadedBy: { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32' },
        uploadDate: '2024-05-16T16:00:00'
      }
    ]
  },
  {
    id: 2,
    title: 'Framing Work',
    description: 'Complete structural framing including wall frames, roof trusses, and floor joists according to architectural plans.',
    project: 'Villa Construction',
    phase: 'Structure',
    startDate: '2024-05-17',
    dueDate: '2024-05-25',
    status: 'In Progress',
    priority: 'High',
    assignedTo: [
      { id: 3, name: 'Mike Johnson', avatar: '/api/placeholder/32/32', role: 'Lead Carpenter' },
      { id: 4, name: 'Sarah Williams', avatar: '/api/placeholder/32/32', role: 'Structural Engineer' }
    ],
    completion: 45,
    dependencies: [1],
    comments: [
      { 
        id: 2, 
        author: { id: 3, name: 'Mike Johnson', avatar: '/api/placeholder/32/32' },
        text: 'First floor framing completed. Moving to second floor tomorrow.',
        date: '2024-05-20T17:15:00'
      }
    ]
  },
  {
    id: 3,
    title: 'Electrical Wiring',
    description: 'Install all electrical systems including wiring, outlets, switches, and panel boxes according to electrical plans.',
    project: 'Villa Construction',
    phase: 'Electrical',
    startDate: '2024-05-26',
    dueDate: '2024-06-02',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 5, name: 'David Brown', avatar: '/api/placeholder/32/32', role: 'Electrician' }
    ],
    completion: 0,
    dependencies: [2]
  },
  {
    id: 4,
    title: 'Plumbing Installation',
    description: 'Install all plumbing systems including water supply lines, drainage, fixtures, and water heater.',
    project: 'Villa Construction',
    phase: 'Plumbing',
    startDate: '2024-05-26',
    dueDate: '2024-06-02',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 6, name: 'Emily Davis', avatar: '/api/placeholder/32/32', role: 'Plumber' }
    ],
    completion: 0,
    dependencies: [2]
  },
  {
    id: 5,
    title: 'Interior Painting',
    description: 'Complete interior painting including walls, ceilings, trim, and doors according to color scheme.',
    project: 'Office Renovation',
    phase: 'Finishing',
    startDate: '2024-05-20',
    dueDate: '2024-05-27',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: [
      { id: 7, name: 'Robert Wilson', avatar: '/api/placeholder/32/32', role: 'Painter' },
      { id: 8, name: 'Lisa Taylor', avatar: '/api/placeholder/32/32', role: 'Interior Designer' }
    ],
    completion: 60,
    comments: [
      { 
        id: 3, 
        author: { id: 7, name: 'Robert Wilson', avatar: '/api/placeholder/32/32' },
        text: 'Main area and conference room completed. Starting on offices tomorrow.',
        date: '2024-05-23T16:45:00'
      }
    ]
  },
  {
    id: 6,
    title: 'Flooring Installation',
    description: 'Install all flooring materials including hardwood, carpet, and tile according to floor plans.',
    project: 'Office Renovation',
    phase: 'Finishing',
    startDate: '2024-05-28',
    dueDate: '2024-06-04',
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [
      { id: 9, name: 'Thomas Moore', avatar: '/api/placeholder/32/32', role: 'Flooring Specialist' }
    ],
    completion: 0,
    dependencies: [5]
  },
  {
    id: 7,
    title: 'Final Inspection',
    description: 'Conduct final inspection to ensure all work meets quality standards and project requirements.',
    project: 'Office Renovation',
    phase: 'Completion',
    startDate: '2024-06-05',
    dueDate: '2024-06-06',
    status: 'Not Started',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
      { id: 10, name: 'Amanda Clark', avatar: '/api/placeholder/32/32', role: 'Quality Inspector' }
    ],
    completion: 0,
    dependencies: [6]
  },
  {
    id: 8,
    title: 'Client Walkthrough',
    description: 'Final walkthrough with client to demonstrate completed project and address any questions or concerns.',
    project: 'Villa Construction',
    phase: 'Completion',
    startDate: '2024-06-10',
    dueDate: '2024-06-10',
    status: 'Not Started',
    priority: 'High',
    assignedTo: [
      { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager' },
      { id: 11, name: 'Michael Scott', avatar: '/api/placeholder/32/32', role: 'Client Representative' }
    ],
    completion: 0,
    dependencies: [3, 4]
  }
];

// Define team members
const teamMembers: TeamMember[] = [
  { id: 1, name: 'John Doe', avatar: '/api/placeholder/32/32', role: 'Project Manager', department: 'Management' },
  { id: 2, name: 'Jane Smith', avatar: '/api/placeholder/32/32', role: 'Civil Engineer', department: 'Engineering' },
  { id: 3, name: 'Mike Johnson', avatar: '/api/placeholder/32/32', role: 'Lead Carpenter', department: 'Construction' },
  { id: 4, name: 'Sarah Williams', avatar: '/api/placeholder/32/32', role: 'Structural Engineer', department: 'Engineering' },
  { id: 5, name: 'David Brown', avatar: '/api/placeholder/32/32', role: 'Electrician', department: 'Electrical' },
  { id: 6, name: 'Emily Davis', avatar: '/api/placeholder/32/32', role: 'Plumber', department: 'Plumbing' },
  { id: 7, name: 'Robert Wilson', avatar: '/api/placeholder/32/32', role: 'Painter', department: 'Finishing' },
  { id: 8, name: 'Lisa Taylor', avatar: '/api/placeholder/32/32', role: 'Interior Designer', department: 'Design' },
  { id: 9, name: 'Thomas Moore', avatar: '/api/placeholder/32/32', role: 'Flooring Specialist', department: 'Finishing' },
  { id: 10, name: 'Amanda Clark', avatar: '/api/placeholder/32/32', role: 'Quality Inspector', department: 'Quality Assurance' },
  { id: 11, name: 'Michael Scott', avatar: '/api/placeholder/32/32', role: 'Client Representative', department: 'Client' }
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

// Function to get task color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Delayed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Function to get task color based on priority
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Function to calculate days until due
const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Function to get progress color based on completion percentage
const getProgressColor = (completion: number) => {
  if (completion < 25) return 'bg-red-500';
  if (completion < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

const Schedule = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [phaseFilter, setPhaseFilter] = useState('All Phases');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isBatchActionDialogOpen, setIsBatchActionDialogOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<'start' | 'complete' | 'delay' | 'delete' | ''>('');
  const [taskProgressValue, setTaskProgressValue] = useState(0);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTaskFilter, setActiveTaskFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    project: '',
    phase: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    status: 'Not Started',
    priority: 'Medium',
    assignedTo: [],
    completion: 0,
    dependencies: []
  });

  // Update selected state when isAllSelected changes
  useEffect(() => {
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        selected: isAllSelected
      }))
    );
    
    if (isAllSelected) {
      setSelectedTasks(filteredTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  }, [isAllSelected]);

  // Get filtered tasks based on search and filters
  const getFilteredTasks = () => {
    let filtered = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.phase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
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

    // Additional filtering based on active task filter
    if (activeTaskFilter === 'today') {
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        return isToday(dueDate);
      });
    } else if (activeTaskFilter === 'upcoming') {
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const inNextWeek = differenceInDays(dueDate, today) <= 7 && differenceInDays(dueDate, today) > 0;
        return inNextWeek && task.status !== 'Completed';
      });
    } else if (activeTaskFilter === 'overdue') {
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return isBefore(dueDate, today) && task.status !== 'Completed';
      });
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Calculate schedule statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const upcomingTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    const inNextWeek = differenceInDays(dueDate, today) <= 7 && differenceInDays(dueDate, today) > 0;
    return t.status !== 'Completed' && inNextWeek;
  }).length;
  const overdueTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return isBefore(dueDate, today) && t.status !== 'Completed';
  }).length;

  // Toggle task selection
  const toggleTaskSelection = (id: number, selected: boolean) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, selected } : task
      )
    );
    
    setSelectedTasks(prevSelectedTasks => {
      if (selected) {
        return [...prevSelectedTasks, id];
      } else {
        return prevSelectedTasks.filter(taskId => taskId !== id);
      }
    });
  };

  // Handle adding a new task
  const handleAddTask = () => {
    const id = Math.max(...tasks.map(t => t.id)) + 1;
    
    const newTaskItem: Task = {
      ...newTask as Task,
      id,
      completion: newTask.status === 'Completed' ? 100 : 0,
      assignedTo: newTask.assignedTo || [],
      dependencies: newTask.dependencies || []
    };
    
    setTasks([...tasks, newTaskItem]);
    setNewTask({
      title: '',
      description: '',
      project: '',
      phase: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      status: 'Not Started',
      priority: 'Medium',
      assignedTo: [],
      completion: 0,
      dependencies: []
    });
    setIsAddTaskOpen(false);
  };

  // Handle updating a task
  const handleUpdateTask = () => {
    if (!selectedTask) return;
    
    setTasks(tasks.map(task => 
      task.id === selectedTask.id ? { ...selectedTask, completion: taskProgressValue } : task
    ));
    
    setIsEditTaskOpen(false);
  };

  // Handle updating task status
  const handleUpdateTaskStatus = (id: number, newStatus: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed') => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        status: newStatus,
        completion: newStatus === 'Completed' ? 100 : task.completion
      } : task
    ));
  };

  // Handle batch actions
  const handleBatchAction = (action: 'start' | 'complete' | 'delay' | 'delete') => {
    setBatchAction(action);
    setIsBatchActionDialogOpen(true);
  };

  // Confirm batch action
  const confirmBatchAction = () => {
    if (batchAction === 'delete') {
      setTasks(tasks.filter(task => !selectedTasks.includes(task.id)));
    } else if (batchAction === 'start' || batchAction === 'complete' || batchAction === 'delay') {
      setTasks(tasks.map(task => {
        if (selectedTasks.includes(task.id)) {
          const newStatus = batchAction === 'start' ? 'In Progress' : 
                           batchAction === 'complete' ? 'Completed' : 'Delayed';
          const newCompletion = newStatus === 'Completed' ? 100 : task.completion;
          return { ...task, status: newStatus, completion: newCompletion };
        }
        return task;
      }));
    }
    
    setIsBatchActionDialogOpen(false);
    setBatchAction('');
    setSelectedTasks([]);
    setIsAllSelected(false);
  };

  // Handle deleting a task
  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(null);
      setIsTaskDetailOpen(false);
    }
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (!selectedTask || !newComment.trim()) return;
    
    const newCommentObj: TaskComment = {
      id: selectedTask.comments ? Math.max(...selectedTask.comments.map(c => c.id)) + 1 : 1,
      author: teamMembers[0], // Assume current user is the first team member
      text: newComment,
      date: new Date().toISOString()
    };
    
    const updatedTask = {
      ...selectedTask,
      comments: selectedTask.comments ? [...selectedTask.comments, newCommentObj] : [newCommentObj]
    };
    
    setSelectedTask(updatedTask);
    setTasks(tasks.map(task => task.id === selectedTask.id ? updatedTask : task));
    setNewComment('');
  };

  // Get tasks for calendar view
  const getCalendarTasks = () => {
    let dateRange;
    
    if (calendarView === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      dateRange = eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      dateRange = eachDayOfInterval({ start, end });
    }
    
    return dateRange.map(date => {
      const dayTasks = filteredTasks.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.dueDate);
        
        return isWithinInterval(date, { start: taskStart, end: taskEnd }) ||
               isSameDay(date, taskStart) || 
               isSameDay(date, taskEnd);
      });
      
      return {
        date,
        tasks: dayTasks,
        isCurrentMonth: date.getMonth() === currentDate.getMonth()
      };
    });
  };

  // Get task dependencies
  const getTaskDependencies = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) return [];
    
    return task.dependencies.map(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask ? `${depTask.title} (${depTask.status})` : 'Unknown Task';
    });
  };

  // Generate Gantt chart data
  const generateGanttData = () => {
    const sortedTasks = [...filteredTasks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    if (sortedTasks.length === 0) return { tasks: [], startDate: new Date(), endDate: addDays(new Date(), 30) };
    
    const earliestStartDate = new Date(sortedTasks[0].startDate);
    const latestEndDate = sortedTasks.reduce((latest, task) => {
      const taskEnd = new Date(task.dueDate);
      return taskEnd > latest ? taskEnd : latest;
    }, new Date(sortedTasks[0].dueDate));
    
    return {
      tasks: sortedTasks,
      startDate: earliestStartDate,
      endDate: latestEndDate
    };
  };
  
  const ganttData = generateGanttData();
  const totalDuration = differenceInDays(ganttData.endDate, ganttData.startDate) + 1;

  // Export tasks to CSV
  const exportTasks = () => {
    const headers = ['Title', 'Project', 'Phase', 'Start Date', 'Due Date', 'Status', 'Priority', 'Completion', 'Assigned To'];
    
    const csvContent = [
      headers.join(','),
      ...filteredTasks.map(task => [
        `"${task.title}"`,
        `"${task.project}"`,
        `"${task.phase}"`,
        task.startDate,
        task.dueDate,
        task.status,
        task.priority,
        `${task.completion}%`,
        `"${task.assignedTo.map(a => a.name).join(', ')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tasks_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      {/* Top Header with Actions */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <div>
        <h1 className="text-2xl font-bold">Project Schedule</h1>
          <p className="text-gray-500 mt-1">Manage and track your project tasks and timelines</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportTasks}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
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
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="description" className="text-right text-sm font-medium pt-2">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
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
                            !newTask.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.startDate ? format(new Date(newTask.startDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                          selected={new Date(newTask.startDate || '')}
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
                            !newTask.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? format(new Date(newTask.dueDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                          selected={new Date(newTask.dueDate || '')}
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
                    onValueChange={(value) => setNewTask({...newTask, priority: value as 'Low' | 'Medium' | 'High'})}
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="dependencies" className="text-right text-sm font-medium">
                    Dependencies
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select dependencies (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map(task => (
                        <SelectItem key={task.id} value={task.id.toString()}>{task.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="assignedTo" className="text-right text-sm font-medium">
                    Assigned To
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Assign team members" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                            {member.role && <span className="text-gray-500 ml-2 text-xs">({member.role})</span>}
                          </div>
                        </SelectItem>
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
      </div>

      {/* Schedule Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">{completedTasks}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% of total
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <Progress 
              className={cn("h-2 mt-3", totalTasks > 0 && (completedTasks / totalTasks) * 100 >= 66 ? "bg-green-500" : 
                            totalTasks > 0 && (completedTasks / totalTasks) * 100 >= 33 ? "bg-yellow-500" : "bg-red-500")} 
              value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">{inProgressTasks}</h3>
                  <span className="ml-2 text-sm text-gray-500">
                    {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}% of total
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <Progress 
              className="h-2 mt-3 bg-blue-500" 
              value={totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming (7d)</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">{upcomingTasks}</h3>
                  <span className="ml-2 text-sm text-gray-500">Next 7 days</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            {upcomingTasks > 0 && (
              <Badge className="mt-3 bg-purple-100 text-purple-800 border-purple-200">
                {upcomingTasks} task{upcomingTasks !== 1 ? 's' : ''} upcoming
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <div className="flex items-baseline mt-1">
                  <h3 className="text-2xl font-bold">{overdueTasks}</h3>
                  <span className="ml-2 text-sm text-gray-500">Past due date</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            {overdueTasks > 0 && (
              <Badge className="mt-3 bg-red-100 text-red-800 border-red-200">
                Action needed
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Quick Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeTaskFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTaskFilter('all')}
          >
            <ListFilter className="w-4 h-4 mr-2" />
            All Tasks
          </Button>
          <Button 
            variant={activeTaskFilter === 'today' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTaskFilter('today')}
          >
            <Clock8 className="w-4 h-4 mr-2" />
            Due Today
          </Button>
          <Button 
            variant={activeTaskFilter === 'upcoming' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTaskFilter('upcoming')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming (7d)
          </Button>
          <Button 
            variant={activeTaskFilter === 'overdue' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTaskFilter('overdue')}
            className={activeTaskFilter === 'overdue' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Overdue
            {overdueTasks > 0 && <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">{overdueTasks}</span>}
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedTasks.length > 0 && (
        <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <AlertTitle className="mr-2">{selectedTasks.length} tasks selected</AlertTitle>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                onClick={() => handleBatchAction('start')}
              >
                Mark as In Progress
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                onClick={() => handleBatchAction('complete')}
              >
                Mark as Complete
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                onClick={() => handleBatchAction('delay')}
              >
                Mark as Delayed
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                onClick={() => handleBatchAction('delete')}
              >
                <Trash className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setIsAllSelected(false);
                  setSelectedTasks([]);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-flex">
          <TabsTrigger value="list" className="flex items-center">
            <ListFilter className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="gantt" className="flex items-center">
            <BarChart className="w-4 h-4 mr-2" />
            Gantt Chart
          </TabsTrigger>
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
                    <th className="py-3 px-4 text-left">
                      <Checkbox 
                        checked={isAllSelected} 
                        onCheckedChange={(checked) => setIsAllSelected(!!checked)}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Task</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Project / Phase</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Timeline</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium hidden md:table-cell">Priority</th>
                    <th className="text-center py-3 px-4 font-medium hidden lg:table-cell">Progress</th>
                    <th className="text-center py-3 px-4 font-medium">Assigned</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const daysUntilDue = getDaysUntilDue(task.dueDate);
                    const isOverdue = daysUntilDue < 0 && task.status !== 'Completed';
                    const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0 && task.status !== 'Completed';
                    
                    return (
                      <tr key={task.id} className={`border-b hover:bg-gray-50 transition-colors duration-150 ${isOverdue ? 'bg-red-50' : isUrgent ? 'bg-yellow-50' : ''}`}>
                      <td className="py-3 px-4">
                          <Checkbox 
                            checked={task.selected || false}
                            onCheckedChange={(checked) => toggleTaskSelection(task.id, !!checked)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div 
                            className="font-medium hover:text-blue-600 cursor-pointer flex items-center"
                            onClick={() => {
                              setSelectedTask(task);
                              setTaskProgressValue(task.completion);
                              setIsTaskDetailOpen(true);
                            }}
                          >
                            {task.title}
                            {isOverdue && (
                              <AlertCircle className="w-4 h-4 ml-2 text-red-500" aria-label="Overdue" />
                            )}
                            {isUrgent && (
                              <Clock className="w-4 h-4 ml-2 text-yellow-500" aria-label="Due soon" />
                            )}
                          </div>
                          {task.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {task.description.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
                            </div>
                          )}
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
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                          {isOverdue ? (
                            <div className="text-xs text-red-600 mt-1 font-medium">
                              {Math.abs(daysUntilDue)} days overdue
                            </div>
                          ) : task.status !== 'Completed' ? (
                            <div className="text-xs text-gray-500 mt-1">
                              {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days remaining`}
                            </div>
                          ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                            <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex justify-center">
                            <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative">
                            <div 
                              className={`h-2.5 rounded-full ${getProgressColor(task.completion)}`} 
                              style={{ width: `${task.completion}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-center mt-1">{task.completion}%</div>
                        </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <div className="flex -space-x-2">
                              {task.assignedTo.slice(0, 3).map((person) => (
                              <Avatar key={person.id} className="border-2 border-white h-8 w-8">
                                  <AvatarImage src={person.avatar} alt={person.name} />
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
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskProgressValue(task.completion);
                                  setIsTaskDetailOpen(true);
                                }}
                              >
                                <Info className="w-4 h-4 mr-2" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskProgressValue(task.completion);
                                  setIsEditTaskOpen(true);
                                }}
                              >
                              <Edit className="w-4 h-4 mr-2" />
                              <span>Edit Task</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateTaskStatus(task.id, 'Not Started')}
                                className={task.status === 'Not Started' ? 'bg-gray-100' : ''}
                              >
                                <CircleDashed className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Not Started</span>
                            </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}
                                className={task.status === 'In Progress' ? 'bg-gray-100' : ''}
                              >
                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                              <span>In Progress</span>
                            </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}
                                className={task.status === 'Completed' ? 'bg-gray-100' : ''}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              <span>Completed</span>
                            </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateTaskStatus(task.id, 'Delayed')}
                                className={task.status === 'Delayed' ? 'bg-gray-100' : ''}
                              >
                                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
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
                    );
                  })}
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
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Calendar View</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, -1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-medium">
                    {format(currentDate, calendarView === 'month' ? 'MMMM yyyy' : "'Week of' MMMM d, yyyy")}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
            </div>
                <div className="flex space-x-2">
                  <Button 
                    variant={calendarView === 'month' ? 'secondary' : 'outline'} 
                    size="sm"
                    onClick={() => setCalendarView('month')}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={calendarView === 'week' ? 'secondary' : 'outline'} 
                    size="sm"
                    onClick={() => setCalendarView('week')}
                  >
                    Week
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid ${calendarView === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-2`}>
                {/* Day headers */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="py-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {getCalendarTasks().map(({ date, tasks, isCurrentMonth }) => (
                  <div 
                    key={date.toISOString()}
                    className={`border rounded-lg p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${
                      isToday(date) ? 'ring-2 ring-blue-500' : ''
                    } min-h-[120px] overflow-y-auto`}
                  >
                    <div className="text-right text-sm font-medium mb-1">
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {tasks.map((task) => (
                        <div 
                          key={task.id}
                          className={`py-1 px-2 rounded-md text-xs ${getStatusColor(task.status)} cursor-pointer transition-colors hover:opacity-80`}
                          onClick={() => {
                            setSelectedTask(task);
                            setTaskProgressValue(task.completion);
                            setIsTaskDetailOpen(true);
                          }}
                        >
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="flex items-center mt-1 justify-between">
                            <Badge variant="outline" className="text-[10px] py-0 h-4">
                              {task.project}
                            </Badge>
                            <div className="flex">
                              {task.assignedTo.slice(0, 1).map((person) => (
                                <Avatar key={person.id} className="border-white h-4 w-4">
                                  <AvatarFallback className="text-[8px]">{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                              ))}
                              {task.assignedTo.length > 1 && (
                                <span className="text-[10px] ml-1">+{task.assignedTo.length - 1}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gantt">
          <Card>
            <CardHeader>
              <CardTitle>Gantt Chart</CardTitle>
              <CardDescription>
                View project timeline and task dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Timeline header */}
                  <div className="flex">
                    <div className="w-64 flex-shrink-0">
                      <div className="h-8 font-medium pl-4 flex items-center border-b">
                        Task
            </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex">
                        {Array.from({ length: totalDuration }).map((_, index) => {
                          const date = addDays(ganttData.startDate, index);
                          return (
                            <div 
                              key={index} 
                              className={`w-12 h-8 flex-shrink-0 text-center text-xs flex flex-col justify-center border-b ${
                                isToday(date) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="font-medium">{format(date, 'd')}</div>
                              <div className="text-gray-500">{format(date, 'MMM')}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tasks rows */}
                  {ganttData.tasks.map((task) => {
                    const startOffset = differenceInDays(new Date(task.startDate), ganttData.startDate);
                    const duration = differenceInDays(new Date(task.dueDate), new Date(task.startDate)) + 1;
                    
                    return (
                      <div key={task.id} className="flex hover:bg-gray-50">
                        <div className="w-64 flex-shrink-0 p-2 border-b">
                          <div 
                            className="truncate font-medium cursor-pointer"
                            onClick={() => {
                              setSelectedTask(task);
                              setTaskProgressValue(task.completion);
                              setIsTaskDetailOpen(true);
                            }}
                          >
                            {task.title}
                          </div>
                          <div className="truncate text-xs text-gray-500">{task.project}</div>
                        </div>
                        <div className="flex-grow relative h-12 border-b">
                          <div 
                            className={`absolute h-8 top-2 rounded-md ${getStatusColor(task.status)} border cursor-pointer`}
                            style={{ 
                              left: `${startOffset * 3}rem`, 
                              width: `${duration * 3}rem`,
                            }}
                            onClick={() => {
                              setSelectedTask(task);
                              setTaskProgressValue(task.completion);
                              setIsTaskDetailOpen(true);
                            }}
                          >
                            <div 
                              className={getProgressColor(task.completion)}
                              style={{ width: `${task.completion}%`, height: '100%', borderRadius: '0.375rem' }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-between px-2">
                              <span className="text-xs font-medium truncate max-w-[90%]">
                                {task.title}
                              </span>
                              <span className="text-xs">{task.completion}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <DialogDescription className="text-sm">
                  {selectedTask.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Project & Phase</h4>
                    <div className="flex items-center">
                      <span className="font-medium">{selectedTask.project}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-gray-600">{selectedTask.phase}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
                    <Badge className={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Timeline</h4>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                      <span>{format(new Date(selectedTask.startDate), 'MMM d, yyyy')}</span>
                      <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                      <span>{format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                    {getDaysUntilDue(selectedTask.dueDate) < 0 && selectedTask.status !== 'Completed' ? (
                      <div className="text-xs text-red-600 mt-1 font-medium">
                        {Math.abs(getDaysUntilDue(selectedTask.dueDate))} days overdue
                      </div>
                    ) : selectedTask.status !== 'Completed' ? (
                      <div className="text-xs text-gray-500 mt-1">
                        {getDaysUntilDue(selectedTask.dueDate) === 0 ? 'Due today' : `${getDaysUntilDue(selectedTask.dueDate)} days remaining`}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Progress</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(selectedTask.completion)}`} 
                          style={{ width: `${selectedTask.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{selectedTask.completion}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Assigned Team Members</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assignedTo.map((person) => (
                      <div key={person.id} className="flex items-center space-x-2 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={person.avatar} alt={person.name} />
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{person.name}</div>
                          {person.role && <div className="text-xs text-gray-500">{person.role}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Dependencies</h4>
                    <div className="flex flex-wrap gap-2">
                      {getTaskDependencies(selectedTask.id).map((dep, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          <Link className="w-3 h-3 mr-1" />
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                    <div className="space-y-2">
                      {selectedTask.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium">{attachment.name}</div>
                              <div className="text-xs text-gray-500">
                                {attachment.size} • Uploaded by {attachment.uploadedBy.name} on {format(new Date(attachment.uploadDate), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <FileDown className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Comments</h4>
                  <div className="space-y-3">
                    {selectedTask.comments && selectedTask.comments.length > 0 ? (
                      selectedTask.comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{comment.author.name}</span>
                              <span className="text-xs text-gray-500">{format(new Date(comment.date), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                            <p className="text-sm mt-1">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic">No comments yet</div>
                    )}
                    
                    <div className="flex space-x-2 mt-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input 
                          placeholder="Add a comment..." 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-2"
                        />
                        <Button size="sm" onClick={handleAddComment}>Post Comment</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => handleDeleteTask(selectedTask.id)} className="text-red-600">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>Close</Button>
                    <Button onClick={() => {
                      setIsEditTaskOpen(true);
                      setIsTaskDetailOpen(false);
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Task
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update task details and progress
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Task Progress</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={taskProgressValue}
                      onChange={(e) => setTaskProgressValue(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">{taskProgressValue}%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Status</h4>
                  <Select 
                    value={selectedTask.status}
                    onValueChange={(value) => 
                      setSelectedTask({
                        ...selectedTask, 
                        status: value as 'Not Started' | 'In Progress' | 'Completed' | 'Delayed',
                        completion: value === 'Completed' ? 100 : taskProgressValue
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.filter(s => s !== 'All Statuses').map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Start Date</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedTask.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedTask.startDate ? format(new Date(selectedTask.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={new Date(selectedTask.startDate)}
                          onSelect={(date) => setSelectedTask({...selectedTask, startDate: format(date as Date, 'yyyy-MM-dd')})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Due Date</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedTask.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={new Date(selectedTask.dueDate)}
                          onSelect={(date) => setSelectedTask({...selectedTask, dueDate: format(date as Date, 'yyyy-MM-dd')})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Priority</h4>
                  <Select 
                    value={selectedTask.priority}
                    onValueChange={(value) => 
                      setSelectedTask({
                        ...selectedTask, 
                        priority: value as 'Low' | 'Medium' | 'High'
                      })
                    }
                  >
                    <SelectTrigger>
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
                <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateTask}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Batch Action Confirmation Dialog */}
      <Dialog open={isBatchActionDialogOpen} onOpenChange={setIsBatchActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={
              batchAction === 'delete' ? 'text-red-600' : 
              batchAction === 'complete' ? 'text-green-600' : 
              batchAction === 'delay' ? 'text-orange-600' : ''
            }>
              {batchAction === 'delete' && <AlertCircle className="w-5 h-5 mr-2 inline-block" />}
              Confirm Batch {batchAction === 'delete' ? 'Deletion' : batchAction === 'complete' ? 'Completion' : batchAction === 'delay' ? 'Delay' : 'Start'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {batchAction === 'delete' ? 'delete' : batchAction === 'complete' ? 'mark as completed' : batchAction === 'delay' ? 'mark as delayed' : 'mark as in progress'} {selectedTasks.length} selected task{selectedTasks.length > 1 ? 's' : ''}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              {batchAction === 'delete' 
                ? 'Selected tasks will be permanently removed. This action cannot be undone.'
                : batchAction === 'complete'
                  ? 'Selected tasks will be marked as completed with 100% progress.'
                  : batchAction === 'delay'
                    ? 'Selected tasks will be marked as delayed.'
                    : 'Selected tasks will be marked as in progress.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={batchAction === 'delete' ? 'destructive' : 'default'}
              onClick={confirmBatchAction}
              className={
                batchAction === 'complete' ? 'bg-green-600 hover:bg-green-700' :
                batchAction === 'delay' ? 'bg-orange-600 hover:bg-orange-700' :
                batchAction === 'start' ? 'bg-blue-600 hover:bg-blue-700' : ''
              }
            >
              {batchAction === 'delete' && <Trash className="w-4 h-4 mr-2" />}
              {batchAction === 'complete' && <CheckCircle2 className="w-4 h-4 mr-2" />}
              {batchAction === 'delay' && <AlertTriangle className="w-4 h-4 mr-2" />}
              {batchAction === 'start' && <Clock className="w-4 h-4 mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Schedule; 