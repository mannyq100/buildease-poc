import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  DollarSign,
  Settings,
  Plus,
  ChevronRight,
  Home,
  MessageSquare,
  Image,
  FileText,
  Package,
  CheckSquare
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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

// Shared Components
import {
  PageHeader,
  PhaseCard,
  ActivityItem,
  InsightItem
} from '@/components/shared';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  mode: 'single';
  selected: Date;
  onSelect: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

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

interface NewPhase {
  name: string;
  startDate: Date;
  endDate: Date;
  budget: string;
  description: string;
}

interface NewTask {
  title: string;
  phaseId: number;
  description: string;
  startDate: Date;
  endDate: Date;
  priority: string;
  assignee: string;
}

interface DocumentItemProps {
  title: string;
  type: string;
  date: string;
  size: string;
}

const INITIAL_NEW_PHASE: NewPhase = {
  name: "",
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
  budget: "",
  description: ""
};

const INITIAL_NEW_TASK: NewTask = {
  title: "",
  phaseId: 0,
  description: "",
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
  priority: "Medium",
  assignee: ""
};

function DatePicker({ mode, selected, onSelect, initialFocus }: DatePickerProps) {
  return (
    <CalendarComponent
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      initialFocus={initialFocus}
    />
  );
}

function DocumentItem({ title, type, date, size }: DocumentItemProps) {
  function getIcon() {
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
  }
  
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
}

// Main Component
export function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
  const [newPhase, setNewPhase] = useState<NewPhase>(INITIAL_NEW_PHASE);
  const [newTask, setNewTask] = useState<NewTask>(INITIAL_NEW_TASK);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  
  // Check dark mode on component mount and whenever it might change
  useEffect(() => {
    function checkDarkMode() {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
    
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
      path: `/projects/${id}/overview`,
      icon: <Home className="h-4 w-4" />
    },
    {
      label: "Schedule",
      value: "schedule",
      path: `/projects/${id}/schedule`,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: "Budget",
      value: "budget",
      path: `/projects/${id}/budget`,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      label: "Team",
      value: "team",
      path: `/projects/${id}/team`,
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Materials",
      value: "materials",
      path: `/projects/${id}/materials`,
      icon: <Package className="h-4 w-4" />
    },
    {
      label: "Documents",
      value: "documents",
      path: `/projects/${id}/documents`,
      icon: <FileText className="h-4 w-4" />,
      badge: {
        text: "3",
        color: "blue"
      }
    },
    {
      label: "Photos",
      value: "photos",
      path: `/projects/${id}/photos`,
      icon: <Image className="h-4 w-4" />
    }
  ];
  
  // Breadcrumb items for the page header
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: `Project #${id}` }
  ];

  function handleAddPhase() {
    if (!newPhase.name || !newPhase.budget) return;
    
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
    setNewPhase(INITIAL_NEW_PHASE);
  }

  function handleAddTask() {
    if (!newTask.title || !newTask.phaseId) return;
    
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
    setNewTask(INITIAL_NEW_TASK);
  }

  function togglePhaseExpansion(phaseId: number) {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  }

  function getTasksForPhase(phaseId: number) {
    return tasks.filter(task => task.phaseId === phaseId);
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Not Started': return 'text-gray-600 bg-gray-100';
      case 'Delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title={`Residential Renovation #${id}`}
          subtitle="Modern home renovation project with eco-friendly materials"
          breadcrumbs={breadcrumbItems}
          gradient={true}
          animated={true}
          actions={[
            {
              label: "Settings",
              icon: <Settings />,
              variant: "construction",
              onClick: () => navigate(`/project/${id}/settings`)
            }
          ]}
        />

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <ProjectStatCard
            icon={<Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            label="Timeline"
            value="7 months"
            colorScheme="blue"
          />
          
          <ProjectStatCard
            icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            label="Budget"
            value="$120,000"
            colorScheme="emerald"
          />
          
          <ProjectStatCard
            icon={<Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            label="Team Size"
            value="12"
            subtitle="members"
            colorScheme="purple"
          />
          
          <ProjectStatCard
            icon={<CheckSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            label="Progress"
            value="75%"
            subtitle="complete"
            colorScheme="amber"
          />
        </div>

        {/* Project Navigation */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-16 z-30 mt-8">
          <HorizontalNav
            items={projectNavItems}
            variant="underlined"
            showIcons={true}
            className="py-2"
          />
        </div>

        {/* Tab Content */}
        <div className="mt-8">
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
                  <div className="flex space-x-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-[#1E3A8A] border-[#1E3A8A] hover:bg-[#1E3A8A]/10"
                      onClick={() => setShowTaskDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Task
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                      onClick={() => setShowPhaseDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Phase
                    </Button>
                  </div>
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

        {/* Dialogs for adding phases and tasks */}
        <AddPhaseDialog 
          isOpen={showPhaseDialog}
          setIsOpen={setShowPhaseDialog}
          newPhase={newPhase}
          setNewPhase={setNewPhase}
          handleAddPhase={handleAddPhase}
        />
        
        <AddTaskDialog
          isOpen={showTaskDialog}
          setIsOpen={setShowTaskDialog}
          newTask={newTask}
          setNewTask={setNewTask}
          handleAddTask={handleAddTask}
          phases={phases}
        />
      </div>
    </div>
  );
}

interface ProjectStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  colorScheme: 'blue' | 'emerald' | 'purple' | 'amber';
}

function ProjectStatCard({ icon, label, value, subtitle, colorScheme }: ProjectStatCardProps) {
  const baseClasses = "bg-gradient-to-br shadow-sm hover:shadow-md transition-all duration-300 border";
  
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-200 dark:border-blue-800/30",
    emerald: "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800/30",
    purple: "from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-200 dark:border-purple-800/30",
    amber: "from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-200 dark:border-amber-800/30"
  };
  
  const iconBgClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/50",
    emerald: "bg-emerald-100 dark:bg-emerald-900/50",
    purple: "bg-purple-100 dark:bg-purple-900/50",
    amber: "bg-amber-100 dark:bg-amber-900/50"
  };
  
  return (
    <Card className={`${baseClasses} ${colorClasses[colorScheme]}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconBgClasses[colorScheme]} rounded-lg shadow-sm`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AddPhaseDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newPhase: NewPhase;
  setNewPhase: (phase: NewPhase) => void;
  handleAddPhase: () => void;
}

function AddPhaseDialog({ isOpen, setIsOpen, newPhase, setNewPhase, handleAddPhase }: AddPhaseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project Phase</DialogTitle>
          <DialogDescription>
            Create a new phase for your construction project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="phase-name">Phase Name</Label>
            <Input
              id="phase-name"
              value={newPhase.name}
              onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
              placeholder="e.g. Foundation Work"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(newPhase.startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={newPhase.startDate}
                    onSelect={(date) => date && setNewPhase({ ...newPhase, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(newPhase.endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={newPhase.endDate}
                    onSelect={(date) => date && setNewPhase({ ...newPhase, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phase-budget">Budget</Label>
            <Input
              id="phase-budget"
              value={newPhase.budget}
              onChange={(e) => setNewPhase({ ...newPhase, budget: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="e.g. 25000"
              type="text"
              inputMode="numeric"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phase-description">Description</Label>
            <Textarea
              id="phase-description"
              value={newPhase.description}
              onChange={(e) => setNewPhase({ ...newPhase, description: e.target.value })}
              placeholder="Describe the work to be done in this phase..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPhase}>Add Phase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddTaskDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newTask: NewTask;
  setNewTask: (task: NewTask) => void;
  handleAddTask: () => void;
  phases: Phase[];
}

function AddTaskDialog({ isOpen, setIsOpen, newTask, setNewTask, handleAddTask, phases }: AddTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for your project phase.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g. Pour concrete for foundation"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-phase">Project Phase</Label>
            <Select
              value={newTask.phaseId.toString()}
              onValueChange={(value) => setNewTask({ ...newTask, phaseId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id.toString()}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(newTask.startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={newTask.startDate}
                    onSelect={(date) => date && setNewTask({ ...newTask, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    {format(newTask.endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={newTask.endDate}
                    onSelect={(date) => date && setNewTask({ ...newTask, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <Input
              id="task-assignee"
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              placeholder="e.g. John Smith"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Describe the task..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 