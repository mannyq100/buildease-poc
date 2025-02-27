import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Clock,
  TrendingUp,
  Calendar,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  Eye,
  MessageSquare,
  Paperclip,
  Link,
  ArrowRight,
  ArrowLeft,
  Settings,
  BarChart,
  PieChart,
  LineChart,
  List,
  Grid as GridIcon,
  Layers,
  Flag,
  User,
  Clock as ClockIcon,
  Briefcase,
  HardHat,
  Hammer,
  Wrench,
  Truck,
  Clipboard,
  FileText,
  Save,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from '@/components/ui/progress';
import { 
  DashboardLayout, 
  DashboardSection, 
  Grid 
} from '@/components/layout/test';
import { 
  MetricCard,
  PageHeader
} from '@/components/shared';
import { 
  format, 
  addDays, 
  differenceInDays, 
  isBefore, 
  isToday, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  isSameDay 
} from 'date-fns';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import MainNavigation from '@/components/layout/MainNavigation';

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

  // Add new state variables for the redesigned UI
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'calendar'>('list');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('week');
  
  // Calculate task metrics for the new UI
  const taskMetrics = {
    total: tasks.length,
    completed: tasks.filter(task => task.completion === 100).length,
    inProgress: tasks.filter(task => task.completion > 0 && task.completion < 100).length,
    notStarted: tasks.filter(task => task.completion === 0).length,
    highPriority: tasks.filter(task => task.priority === 'High').length
  };
  
  // Calculate completion percentage
  const overallCompletion = taskMetrics.total > 0 
    ? Math.round((tasks.reduce((sum, task) => sum + task.completion, 0) / (taskMetrics.total * 100)) * 100) 
    : 0;
  
  // Generate chart data
  const tasksByStatusData = [
    { name: 'Completed', value: taskMetrics.completed, color: '#166534' },
    { name: 'In Progress', value: taskMetrics.inProgress, color: '#D97706' },
    { name: 'Not Started', value: taskMetrics.notStarted, color: '#1E3A8A' },
  ];
  
  const tasksByPriorityData = [
    { name: 'High', value: tasks.filter(task => task.priority === 'High').length, color: '#DC2626' },
    { name: 'Medium', value: tasks.filter(task => task.priority === 'Medium').length, color: '#D97706' },
    { name: 'Low', value: tasks.filter(task => task.priority === 'Low').length, color: '#166534' },
  ];
  
  // Filter tasks based on selected filters for the new UI
  const filteredTasksForUI = tasks.filter(task => {
    const projectMatch = selectedProject === 'all' || task.project === selectedProject;
    const phaseMatch = selectedPhase === 'all' || task.phase === selectedPhase;
    return projectMatch && phaseMatch;
  });
  
  // Get unique projects and phases for filters
  const projectOptions = Array.from(new Set(tasks.map(task => task.project)));
  const phaseOptions = Array.from(new Set(tasks.map(task => task.phase)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation />
      
      <PageHeader
        title="Schedule"
        subtitle="Manage and track all project tasks and timelines"
        icon={<Calendar className="h-6 w-6" />}
        actions={[
          {
            label: "Add Task",
            icon: <Plus />,
            variant: "construction",
            onClick: () => setIsAddTaskOpen(true)
          },
          {
            label: "Export",
            icon: <Download />,
            variant: "construction",
            onClick: () => exportTasks()
          }
        ]}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="blueprint">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <h3 className="text-2xl font-bold mt-1">{taskMetrics.total}</h3>
                </div>
                <div className="bg-deepblue-light bg-opacity-20 p-2 rounded-full">
                  <Clipboard className="h-5 w-5 text-deepblue-light" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Progress</span>
                  <span>{overallCompletion}%</span>
                </div>
                <Progress value={overallCompletion} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card variant="project">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold mt-1">{taskMetrics.completed}</h3>
                </div>
                <div className="bg-darkgreen-light bg-opacity-20 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-darkgreen-light" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>{taskMetrics.total > 0 ? Math.round((taskMetrics.completed / taskMetrics.total) * 100) : 0}%</span>
                </div>
                <Progress value={taskMetrics.total > 0 ? (taskMetrics.completed / taskMetrics.total) * 100 : 0} className="h-2 bg-gray-200">
                  <div className="bg-darkgreen-light h-full rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          <Card variant="material">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <h3 className="text-2xl font-bold mt-1">{taskMetrics.inProgress}</h3>
                </div>
                <div className="bg-burntorange-light bg-opacity-20 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-burntorange-light" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Tasks</span>
                  <span>{taskMetrics.total > 0 ? Math.round((taskMetrics.inProgress / taskMetrics.total) * 100) : 0}%</span>
                </div>
                <Progress value={taskMetrics.total > 0 ? (taskMetrics.inProgress / taskMetrics.total) * 100 : 0} className="h-2 bg-gray-200">
                  <div className="bg-burntorange-light h-full rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>

          <Card variant="task">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <h3 className="text-2xl font-bold mt-1">{taskMetrics.highPriority}</h3>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <Flag className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Priority Rate</span>
                  <span>{taskMetrics.total > 0 ? Math.round((taskMetrics.highPriority / taskMetrics.total) * 100) : 0}%</span>
                </div>
                <Progress value={taskMetrics.total > 0 ? (taskMetrics.highPriority / taskMetrics.total) * 100 : 0} className="h-2 bg-gray-200">
                  <div className="bg-red-500 h-full rounded-full" />
                </Progress>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectOptions.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {phaseOptions.map(phase => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <div className="flex justify-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'} 
                      size="icon" 
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={viewMode === 'board' ? 'default' : 'outline'} 
                      size="icon" 
                      onClick={() => setViewMode('board')}
                    >
                      <GridIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Board View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={viewMode === 'calendar' ? 'default' : 'outline'} 
                      size="icon" 
                      onClick={() => setViewMode('calendar')}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Calendar View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Data Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="default" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle>Tasks by Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={tasksByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {tasksByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle>Tasks by Priority</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={tasksByPriorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${value} tasks`, 'Count']} />
                    <Bar dataKey="value">
                      {tasksByPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card variant="default" className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b">
            <div className="flex justify-between items-center">
              <CardTitle>Project Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                  variant="modern"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={
                        filteredTasksForUI.length > 0 && 
                        filteredTasksForUI.every(task => selectedTasks.includes(task.id))
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks(filteredTasksForUI.map(task => task.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Project / Phase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasksForUI.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No tasks found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasksForUI.map(task => (
                    <TableRow key={task.id} className="group">
                      <TableCell>
                        <Checkbox 
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => {
                            toggleTaskSelection(task.id, !!checked);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {task.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{task.project}</span>
                          <span className="text-sm text-muted-foreground">{task.phase}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.status) as any}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(task.priority) as any}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          <span className={`text-sm ${getDaysUntilDue(task.dueDate) < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {getDaysUntilDue(task.dueDate) === 0 
                              ? 'Due today' 
                              : getDaysUntilDue(task.dueDate) > 0 
                                ? `${getDaysUntilDue(task.dueDate)} days left` 
                                : `${Math.abs(getDaysUntilDue(task.dueDate))} days overdue`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {typeof task.assignedTo === 'string' 
                              ? task.assignedTo.split(' ').map(n => n[0]).join('') 
                              : task.assignedTo[0]?.name[0] || ''}
                          </div>
                          <span>{typeof task.assignedTo === 'string' 
                            ? task.assignedTo 
                            : task.assignedTo.map(a => a.name).join(', ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span>{task.completion}%</span>
                          </div>
                          <Progress value={task.completion} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                setIsTaskDetailOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTask(task);
                                setIsEditTaskOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAddComment(task.id)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Comment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddAttachment(task.id)}>
                                <Paperclip className="mr-2 h-4 w-4" />
                                Add Attachment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                                <Trash className="mr-2 h-4 w-4 text-red-500" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredTasksForUI.length}</span> of{" "}
              <span className="font-medium">{tasks.length}</span> tasks
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={true}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-deepblue-light text-white hover:bg-deepblue-dark"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={true}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Keep all the existing modals */}
        {/* ... existing modals ... */}
      </div>
    </div>
  );
};

export default Schedule; 