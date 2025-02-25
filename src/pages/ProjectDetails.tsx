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
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      path: `/project/${id}?tab=overview`,
      icon: <Home className="h-4 w-4" />
    },
    {
      label: "Schedule",
      path: `/project/${id}?tab=schedule`,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: "Budget",
      path: `/project/${id}?tab=budget`,
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      label: "Team",
      path: `/project/${id}?tab=team`,
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Materials",
      path: `/project/${id}?tab=materials`,
      icon: <Package className="h-4 w-4" />
    },
    {
      label: "Documents",
      path: `/project/${id}?tab=documents`,
      icon: <FileText className="h-4 w-4" />,
      badge: {
        text: "3",
        color: "blue"
      }
    },
    {
      label: "Photos",
      path: `/project/${id}?tab=photos`,
      icon: <Image className="h-4 w-4" />
    }
  ];
  
  // Breadcrumb items for the page header
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: `Project #${id}`, href: `/project/${id}` }
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
    <DashboardLayout>
      <PageHeader
        title={`Residential Renovation #${id}`}
        subtitle="Modern home renovation project with eco-friendly materials"
        // breadcrumbs={breadcrumbItems}
        className="mb-6"
        action={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" /> Export
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4" /> New Update
            </Button>
          </div>
        }
      />

      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HorizontalNav 
          items={projectNavItems} 
          variant="glass" 
          showIcons={true} 
          size="md" 
        />
      </motion.div>

      {/* Project Progress Banner */}
      <motion.div 
        className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Project Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Estimated completion: August 15, 2024</p>
          </div>
          <div className="w-full md:w-2/3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Overall: 45% Complete</span>
              <span>3 of 7 phases finished</span>
            </div>
            <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <MetricCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          label="Timeline"
          value="7 months"
          subtext="Jan - Aug 2024"
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        />
        <MetricCard
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          label="Budget"
          value="$120,000"
          subtext="$52,450 spent"
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        />
        <MetricCard
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          label="Team Size"
          value="12"
          subtext="3 contractors"
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800"
        />
        <MetricCard
          icon={<Package className="h-5 w-5 text-purple-500" />}
          label="Materials"
          value="24"
          subtext="8 pending delivery"
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800"
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Phases */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <DashboardSection
            title="Project Phases"
            icon={<Briefcase className="h-5 w-5" />}
            subtitle="Construction timeline breakdown"
            variant="glass"
            collapsible
            animate
            className="mb-6"
            action={
              <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300">
                    <Plus className="h-4 w-4" />
                    Add Phase
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 shadow-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Project Phase</DialogTitle>
                    <DialogDescription>
                      Create a new phase for your construction project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="phase-name">Phase Name</Label>
                      <Input 
                        id="phase-name"
                        placeholder="e.g., Roofing, Landscaping"
                        value={newPhase.name}
                        onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newPhase.startDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {newPhase.startDate ? (
                                format(newPhase.startDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <DatePicker
                              mode="single"
                              selected={newPhase.startDate}
                              onSelect={(date) => date && setNewPhase({...newPhase, startDate: date})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newPhase.endDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {newPhase.endDate ? (
                                format(newPhase.endDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <DatePicker
                              mode="single"
                              selected={newPhase.endDate}
                              onSelect={(date) => date && setNewPhase({...newPhase, endDate: date})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phase-budget">Budget (USD)</Label>
                      <Input 
                        id="phase-budget"
                        placeholder="e.g., 15000"
                        type="number"
                        value={newPhase.budget}
                        onChange={(e) => setNewPhase({...newPhase, budget: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phase-description">Description</Label>
                      <Textarea 
                        id="phase-description"
                        placeholder="Enter details about this phase"
                        rows={3}
                        value={newPhase.description}
                        onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPhaseDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddPhase}
                      disabled={!newPhase.name || !newPhase.budget}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                    >
                      Add Phase
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          >
            <div className="space-y-4">
              {phases.map((phase) => (
                <div key={phase.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div 
                    className={`flex justify-between items-start p-4 cursor-pointer transition-colors ${
                      expandedPhase === phase.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => togglePhaseExpansion(phase.id)}
                  >
                    <div className="w-full">
                      <PhaseCard
                        name={phase.name}
                        progress={phase.progress}
                        startDate={phase.startDate}
                        endDate={phase.endDate}
                        status={phase.status}
                        budget={phase.budget}
                        spent={phase.spent}
                        simplified={expandedPhase === phase.id}
                        className="border-0 p-0 hover:shadow-none"
                      />
                    </div>
                    <div className="flex items-center p-2">
                      <ChevronDown 
                        className={`h-5 w-5 transition-transform duration-300 ${expandedPhase === phase.id ? 'rotate-180 text-blue-600' : 'text-gray-500'}`} 
                      />
                    </div>
                  </div>
                  
                  {expandedPhase === phase.id && (
                    <motion.div 
                      className="border-t p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Tasks</h4>
                        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1 border-dashed hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                              onClick={() => setNewTask({...newTask, phaseId: phase.id})}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Task
                            </Button>
                          </DialogTrigger>
                          
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add New Task</DialogTitle>
                              <DialogDescription>
                                Create a new task for phase "{phase.name}".
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="task-title">Task Title</Label>
                                <Input 
                                  id="task-title"
                                  placeholder="e.g., Install Drywall"
                                  value={newTask.title}
                                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Start Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !newTask.startDate && "text-muted-foreground"
                                        )}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {newTask.startDate ? (
                                          format(newTask.startDate, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <DatePicker
                                        mode="single"
                                        selected={newTask.startDate}
                                        onSelect={(date) => date && setNewTask({...newTask, startDate: date})}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="space-y-2">
                                  <Label>End Date</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !newTask.endDate && "text-muted-foreground"
                                        )}
                                      >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {newTask.endDate ? (
                                          format(newTask.endDate, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <DatePicker
                                        mode="single"
                                        selected={newTask.endDate}
                                        onSelect={(date) => date && setNewTask({...newTask, endDate: date})}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="task-priority">Priority</Label>
                                <Select 
                                  value={newTask.priority} 
                                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
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
                              <div className="space-y-2">
                                <Label htmlFor="task-assignee">Assigned To</Label>
                                <Select 
                                  value={newTask.assignee} 
                                  onValueChange={(value) => setNewTask({...newTask, assignee: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team member" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="John Doe">John Doe</SelectItem>
                                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                                    <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                                    <SelectItem value="Sarah Williams">Sarah Williams</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="task-description">Description</Label>
                                <Textarea 
                                  id="task-description"
                                  placeholder="Enter task details"
                                  rows={3}
                                  value={newTask.description}
                                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowTaskDialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddTask}
                                disabled={!newTask.title}
                              >
                                Add Task
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="space-y-2">
                        {tasks.filter(task => task.phaseId === phase.id).length > 0 ? (
                          tasks.filter(task => task.phaseId === phase.id).map((task) => (
                            <div 
                              key={task.id} 
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2 items-start">
                                  <div>
                                    {task.status === 'Completed' ? (
                                      <CheckSquare className="h-5 w-5 text-green-500" />
                                    ) : task.status === 'In Progress' ? (
                                      <Clock className="h-5 w-5 text-blue-500" />
                                    ) : task.status === 'Delayed' ? (
                                      <Clock className="h-5 w-5 text-red-500" />
                                    ) : (
                                      <ListTodo className="h-5 w-5 text-gray-500" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</div>
                                  </div>
                                </div>
                                <div>
                                  <Badge className={`${
                                    task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  }`}>
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>{task.startDate} - {task.endDate}</span>
                                <div className="flex items-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex -space-x-2">
                                          {task.assignedTo.map((assignee, index) => (
                                            <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                                              <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs">
                                                {assignee.substring(0, 2).toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          ))}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{task.assignedTo.join(', ')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm italic bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed">
                            No tasks added yet. Click "Add Task" to create one.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </DashboardSection>
          
          {/* Recent Documents */}
          <DashboardSection
            title="Recent Documents"
            icon={<FileText className="h-5 w-5" />}
            subtitle="Project documentation"
            variant="default"
            collapsible
            animate
            className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-3">
              <DocumentItem
                title="Construction Permit"
                type="PDF"
                date="Feb 15, 2024"
                size="1.2 MB"
              />
              <DocumentItem
                title="Architectural Plans"
                type="DWG"
                date="Jan 20, 2024"
                size="5.8 MB"
              />
              <DocumentItem
                title="Budget Breakdown"
                type="XLSX"
                date="Jan 18, 2024"
                size="842 KB"
              />
            </div>
          </DashboardSection>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Recent Activity */}
          <DashboardSection
            title="Recent Activity"
            icon={<Clock className="h-5 w-5" />}
            subtitle="Latest project updates"
            variant="default"
            collapsible
            animate
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
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
          </DashboardSection>
        
          {/* Project Insights */}
          <DashboardSection
            title="Project Insights"
            icon={<BarChart3 className="h-5 w-5" />}
            subtitle="AI-powered analysis"
            variant="default"
            collapsible
            animate
            className={cn(
              "rounded-lg border shadow-sm hover:shadow-md transition-all duration-300",
              isDarkMode 
                ? "bg-indigo-950/30 border-indigo-900/50" 
                : "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-100"
            )}
          >
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
          </DashboardSection>
        
          {/* Quick Actions */}
          <DashboardSection
            title="Quick Actions"
            icon={<Settings className="h-5 w-5" />}
            subtitle="Frequent operations"
            variant="default"
            collapsible
            animate
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Team
              </Button>
              <Button variant="outline" className="justify-start hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors">
                <FileText className="h-4 w-4 mr-2" />
                Add Document
              </Button>
              <Button variant="outline" className="justify-start hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors">
                <Users className="h-4 w-4 mr-2" />
                Update Team
              </Button>
              <Button variant="outline" className="justify-start hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </DashboardSection>

          {/* Project Stats - Reused for sidebar */}
          <DashboardSection
            title="Project Stats"
            icon={<BarChart3 className="h-5 w-5" />}
            subtitle="Key performance metrics"
            variant="default"
            collapsible
            animate
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget utilization</span>
                  <span className="font-medium">43%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                    style={{ width: '43%' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Schedule progress</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                    style={{ width: '45%' }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Team utilization</span>
                  <span className="font-medium">78%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                    style={{ width: '78%' }}
                  ></div>
                </div>
              </div>
            </div>
          </DashboardSection>
        </motion.div>
      </div>
    </DashboardLayout>
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