import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Building, 
  Clock, 
  FileText, 
  Package, 
  Settings, 
  Plus,
  ChevronRight,
  BarChart3,
  Home,
  MessageSquare,
  Image,
  Briefcase,
  X,
  ListTodo,
  CheckSquare,
  ChevronDown,
  User
} from 'lucide-react';
import { 
  PageHeader, 
  MetricCard, 
  PhaseCard, 
  ActivityItem, 
  InsightItem 
} from '@/components/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardSection } from '@/components/layout/DashboardSection';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MainNavigation from '@/components/layout/MainNavigation';

interface DatePickerProps {
  mode: 'single';
  selected: Date;
  onSelect: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  mode, 
  selected, 
  onSelect, 
  initialFocus 
}) => {
  return (
    <CalendarComponent
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
    />
  );
};

interface Phase {
  id: number;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'warning';
  budget: string;
  spent: string;
}

interface Task {
  id: number;
  title: string;
  phaseId: number;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  assignedTo: string[];
  priority: 'Low' | 'Medium' | 'High';
}

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 1,
      name: "Foundation Work",
      progress: 100,
      startDate: "Jan 15, 2024",
      endDate: "Feb 28, 2024",
      status: "completed",
      budget: "$25,000",
      spent: "$23,450"
    },
    {
      id: 2,
      name: "Framing",
      progress: 80,
      startDate: "Mar 1, 2024",
      endDate: "Apr 15, 2024",
      status: "in-progress",
      budget: "$35,000",
      spent: "$28,000"
    },
    {
      id: 3,
      name: "Electrical & Plumbing",
      progress: 0,
      startDate: "Apr 16, 2024",
      endDate: "May 30, 2024",
      status: "upcoming",
      budget: "$40,000",
      spent: "$0"
    },
    {
      id: 4,
      name: "Interior & Finishing",
      progress: 0,
      startDate: "Jun 1, 2024",
      endDate: "Aug 15, 2024",
      status: "upcoming",
      budget: "$20,000",
      spent: "$1,000"
    }
  ]);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [newPhase, setNewPhase] = useState({
    name: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
    budget: "",
    description: ""
  });
  const [newTask, setNewTask] = useState({
    title: "",
    phaseId: 0,
    description: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
    priority: "Medium",
    assignee: ""
  });
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Check on mount
    checkDarkMode();
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);
  
  // Project navigation tabs
  const projectNavItems: NavItem[] = [
    {
      label: "Overview",
      value: "overview",
      icon: <Home className="h-4 w-4" />
    },
    {
      label: "Schedule",
      value: "schedule",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: "Budget",
      value: "budget",
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      label: "Team",
      value: "team",
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Materials",
      value: "materials",
      icon: <Package className="h-4 w-4" />
    },
    {
      label: "Documents",
      value: "documents",
      icon: <FileText className="h-4 w-4" />,
      badge: {
        text: "3",
        color: "blue"
      }
    },
    {
      label: "Photos",
      value: "photos",
      icon: <Image className="h-4 w-4" />
    }
  ];
  
  // Breadcrumb items for the page header
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: `Project #${id}` }
  ];

  const handleAddPhase = () => {
    const newId = phases.length > 0 ? Math.max(...phases.map(p => p.id)) + 1 : 1;
    
    const phaseToAdd: Phase = {
      id: newId,
      name: newPhase.name,
      progress: 0,
      startDate: format(newPhase.startDate, 'MMM d, yyyy'),
      endDate: format(newPhase.endDate, 'MMM d, yyyy'),
      status: "upcoming",
      budget: `$${parseFloat(newPhase.budget).toLocaleString()}`,
      spent: "$0"
    };
    
    setPhases([...phases, phaseToAdd]);
    setShowPhaseDialog(false);
    setNewPhase({
      name: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: "",
      description: ""
    });
  };

  const handleAddTask = () => {
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const taskToAdd: Task = {
      id: newId,
      title: newTask.title,
      phaseId: Number(newTask.phaseId),
      description: newTask.description,
      startDate: format(newTask.startDate, 'MMM d, yyyy'),
      endDate: format(newTask.endDate, 'MMM d, yyyy'),
      status: "Not Started",
      assignedTo: [newTask.assignee],
      priority: newTask.priority as 'Low' | 'Medium' | 'High'
    };
    
    setTasks([...tasks, taskToAdd]);
    setShowTaskDialog(false);
    setNewTask({
      title: "",
      phaseId: 0,
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: "Medium",
      assignee: ""
    });
  };

  const togglePhaseExpansion = (phaseId: number) => {
    if (expandedPhase === phaseId) {
      setExpandedPhase(null);
    } else {
      setExpandedPhase(phaseId);
    }
  };

  const getTasksForPhase = (phaseId: number) => {
    return tasks.filter(task => task.phaseId === phaseId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Not Started': return 'text-gray-600 bg-gray-100';
      case 'Delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <MainNavigation />

      {/* Project Header */}
      {/* <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white"> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <PageHeader
            title={`Residential Renovation #${id}`}
            subtitle="Modern home renovation project with eco-friendly materials"
            breadcrumbs={breadcrumbItems}
            gradient={true}
            action={
              <div className="flex items-center gap-3">
                <Badge 
                  className="px-3 py-1 text-sm bg-green-500 text-white"
                >
                  Active
                </Badge>
                <Button 
                  variant="construction" 
                  className="gap-2 border-white/20 text-white hover:bg-white/10"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Button>
              </div>
            }
          />

          {/* Project Stats */}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Timeline</p>
                  <p className="text-lg font-semibold">7 months</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Budget</p>
                  <p className="text-lg font-semibold">$120,000</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Team Size</p>
                  <p className="text-lg font-semibold">12 members</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Progress</p>
                  <p className="text-lg font-semibold">75% complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* </div> */}

      {/* Project Navigation */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <HorizontalNav
            items={projectNavItems}
            variant="underlined"
            showIcons={true}
            className="py-2"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Phases */}
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">Project Phases</CardTitle>
                  <CardDescription>Construction timeline breakdown</CardDescription>
                </div>
                <Button 
                  size="sm"
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                  onClick={() => setShowPhaseDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Phase
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {phases.map((phase) => (
                    <PhaseCard
                      key={phase.id}
                      name={phase.name}
                      progress={phase.progress}
                      startDate={phase.startDate}
                      endDate={phase.endDate}
                      status={phase.status}
                      budget={phase.budget}
                      spent={phase.spent}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem
                    icon={<FileText className="h-5 w-5" />}
                    title="Permit Approval"
                    description="Building permit has been approved by the city."
                    time="2 days ago"
                    iconColor="blue"
                  />
                  <ActivityItem
                    icon={<DollarSign className="h-5 w-5" />}
                    title="Payment Made"
                    description="$15,450 paid to contractor for foundation work."
                    time="5 days ago"
                    iconColor="green"
                  />
                  <ActivityItem
                    icon={<Users className="h-5 w-5" />}
                    title="Team Updated"
                    description="2 new contractors added to the team."
                    time="1 week ago"
                    iconColor="indigo"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Insights */}
            <Card className={cn(
              "border shadow-sm",
              isDarkMode 
                ? "bg-indigo-950/30 border-indigo-900/50" 
                : "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-100"
            )}>
              <CardHeader>
                <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">Project Insights</CardTitle>
                <CardDescription>AI-powered analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InsightItem
                    title="Budget Forecast"
                    description="Project is currently 5% under budget. Most savings from efficient material sourcing."
                    type="success"
                  />
                  <InsightItem
                    title="Schedule Analysis"
                    description="Current pace suggests completion 2 weeks ahead of schedule if weather permits."
                    type="default"
                  />
                  <InsightItem
                    title="Risk Detection"
                    description="Material delivery delays possible in May due to supplier capacity constraints."
                    type="warning"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#1E1E1E] dark:text-white">Quick Actions</CardTitle>
                <CardDescription>Frequent operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Team
                  </Button>
                  <Button variant="outline" className="justify-start hover:bg-[#D97706]/10 hover:text-[#D97706]">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                  <Button variant="outline" className="justify-start hover:bg-[#1E3A8A]/10 hover:text-[#1E3A8A]">
                    <Users className="h-4 w-4 mr-2" />
                    Update Team
                  </Button>
                  <Button variant="outline" className="justify-start hover:bg-[#D97706]/10 hover:text-[#D97706]">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DocumentItemProps {
  title: string;
  type: string;
  date: string;
  size: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ title, type, date, size }) => {
  const getIcon = () => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DWG':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'XLSX':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all hover:shadow-sm">
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-grow">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date} · {size}</p>
      </div>
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProjectDetails; 