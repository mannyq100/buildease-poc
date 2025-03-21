import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Clipboard,
  DollarSign,
  Download,
  FileText,
  Package,
  Plus,
  Sparkles,
  Users,
  Activity as LucideActivity
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LazyMotion, domAnimation, m } from 'framer-motion';

// Import common shared components
import {
  PageHeader,
  StatCard,
  DocumentItem,
  TaskCard,
  MaterialCard
} from '@/components/shared';

// Import phase-specific components
// import { PhaseCard } from '@/components/phases';

// These components will be created as needed
// For now, we'll use shared components or create temporary versions
const TaskItem = TaskCard; // Temporarily use TaskCard from shared
const MaterialItem = ({ name, quantity, status, deliveryDate, supplier }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'in-stock':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'ordered':
      case 'low-stock':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'pending':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'out-of-stock':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</h4>
          <Badge className={cn("text-xs px-1.5 py-0.5", getStatusColor(status))}>
            {status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Package className="h-3 w-3 mr-1" />
            <span>{quantity}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Building2 className="h-3 w-3 mr-1" />
            <span>{supplier}</span>
          </div>
          {deliveryDate && (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{deliveryDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * InsightItem Component
 * Displays project insights with appropriate styling
 */
function InsightItem({
  title,
  description,
  type,
  icon
}: {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  icon: React.ReactNode;
}) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'info':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'error':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-start p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <div className={cn(
        "flex items-center justify-center h-7 w-7 rounded-full mr-3",
        getTypeStyles()
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

/**
 * CriticalItem Component
 * Displays information about a critical item in a project phase
 */
function CriticalItem({
  title,
  description,
  dueDate,
  status,
  assignee
}: {
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'not-started' | 'in-progress' | 'completed' | 'overdue';
  assignee: string;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'pending':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'not-started':
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
          <Badge className={cn("text-xs px-1.5 py-0.5", getStatusColor(status))}>
            {status.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{dueDate}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Users className="h-3 w-3 mr-1" />
            <span>{assignee}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DependencyItem Component
 * Displays information about a dependency in a project phase
 */
function DependencyItem({
  title,
  description,
  status
}: {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'blocked' | 'pending';
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'pending':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'blocked':
        return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-start justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h4>
          <Badge className={cn("text-xs px-1.5 py-0.5", getStatusColor(status))}>
            {status.replace('-', ' ')}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

// Create a simple PhaseTabs component
const PhaseTabs = ({ activeTab, setActiveTab, children }: { activeTab: string, setActiveTab: (tab: string) => void, children: any }) => {
  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={cn(
              'py-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center',
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Clipboard className={cn('mr-2 h-5 w-5', activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-400')} />
            Tasks
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={cn(
              'py-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center',
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <FileText className={cn('mr-2 h-5 w-5', activeTab === 'documents' ? 'text-blue-500' : 'text-gray-400')} />
            Documents
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={cn(
              'py-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center',
              activeTab === 'materials'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Package className={cn('mr-2 h-5 w-5', activeTab === 'materials' ? 'text-blue-500' : 'text-gray-400')} />
            Materials
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={cn(
              'py-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center',
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Calendar className={cn('mr-2 h-5 w-5', activeTab === 'timeline' ? 'text-blue-500' : 'text-gray-400')} />
            Timeline
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

// Mock data for phases
const phaseData = {
  '1': {
    id: '1',
    name: 'Foundation Phase',
    description: 'Track and manage the foundation phase of Villa Construction project',
    progress: 65,
    projectName: 'Villa Construction',
    startDate: 'Feb 2',
    endDate: 'Mar 15, 2024',
    durationWeeks: 6,
    status: 'in-progress',
    budget: '$45,000',
    spent: '$28,500',
    teamSize: 8,
    teamComposition: '2 contractors, 6 workers'
  },
  '2': {
    id: '2',
    name: 'Framing Phase',
    description: 'Track and manage the framing phase of Villa Construction project',
    progress: 30,
    projectName: 'Villa Construction',
    startDate: 'Mar 16',
    endDate: 'Apr 20, 2024',
    durationWeeks: 5,
    status: 'upcoming',
    budget: '$60,000',
    spent: '$12,000',
    teamSize: 12,
    teamComposition: '3 contractors, 9 workers'
  },
  '3': {
    id: '3',
    name: 'Roofing Phase',
    description: 'Track and manage the roofing phase of Villa Construction project',
    progress: 0,
    projectName: 'Villa Construction',
    startDate: 'Apr 21',
    endDate: 'May 15, 2024',
    durationWeeks: 3.5,
    status: 'upcoming',
    budget: '$35,000',
    spent: '$0',
    teamSize: 6,
    teamComposition: '2 contractors, 4 workers'
  },
};

interface Phase {
  id: string;
  name: string;
  description: string;
  progress: number;
  projectName: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  status: string;
  budget: string;
  spent: string;
  teamSize: number;
  teamComposition: string;
}

interface Assignee {
  id: number;
  name: string;
  avatar: string | null;
}

interface TaskCardProps {
  title: string;
  description: string;
  dueDate: string;
  status: string;
  priority: string;
  assignees: Assignee[];
  comments: number;
  attachments: number;
}

const PhaseDetails = () => {
  const navigate = useNavigate();
  const { phaseId } = useParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    // Check for dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Fetch phase data based on ID
    if (phaseId && phaseData[phaseId]) {
      setPhase(phaseData[phaseId]);
    } else {
      // Handle phase not found
      navigate('/projects');
    }
  }, [phaseId, navigate]);

  if (!phase) {
    return <div>Loading...</div>;
  }

  // Calculate budget percentage
  const budgetPercentage = Math.round(
    (parseInt(phase.spent.replace('$', '').replace(',', '')) /
      parseInt(phase.budget.replace('$', '').replace(',', ''))) * 100
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20
      }
    }
  };

  const handleBackClick = () => {
    navigate('/projects');
  };

  // Render phase details
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Button
          size="sm"
          onClick={handleBackClick}
          variant="outline"
          className="mb-4 text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-800/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
              {phase.name}
            </h1>
            <div className="flex items-center mt-2 mb-1">
              <Badge
                className={cn(
                  "mr-2 px-2.5 py-0.5 text-xs font-medium",
                  phase.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    phase.status === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                )}
              >
                {phase.status}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Part of <span className="font-medium text-gray-700 dark:text-gray-300">{phase.projectName}</span>
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              {phase.description}
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button size="sm" variant="outline" className="text-gray-700 dark:text-gray-300">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Phase Summary Section */}
      <div className="mt-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Critical Items & Dependencies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Critical Items */}
            <Card className={cn(
              "border shadow-sm",
              isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                    Critical Items
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 dark:text-blue-400 h-7 px-2"
                  >
                    View All <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <CriticalItem
                    title="Weather Delay Risk"
                    description="High chance of rain may delay foundation work"
                    dueDate="Mar 15"
                    status="pending"
                    assignee="John Smith"
                  />
                  
                  <CriticalItem
                    title="Material Shortage"
                    description="Potential shortage of concrete mix may impact project timeline"
                    dueDate="Mar 20"
                    status="not-started"
                    assignee="Alex Jones"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Dependencies */}
            <Card className={cn(
              "border shadow-sm",
              isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Package className="mr-2 h-4 w-4 text-blue-500" />
                  Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <DependencyItem
                    title="Foundation Completion"
                    description="Foundation must be complete before framing can begin"
                    status="completed"
                  />
                  
                  <DependencyItem
                    title="Electrical Rough-In"
                    description="Electrical work must be inspected before drywall installation"
                    status="in-progress"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Insights */}
          <div>
            <Card className={cn(
              "border shadow-sm h-full",
              isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InsightItem
                    title="Budget Savings"
                    description="Found $2,500 savings by adjusting material orders"
                    type="success"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  />
                  
                  <InsightItem
                    title="Schedule Optimization"
                    description="Can save 3 days by overlapping tasks"
                    type="info"
                    icon={<Clock className="h-4 w-4" />}
                  />
                  
                  <InsightItem
                    title="Quality Improvement"
                    description="Additional curing time improved strength by 12%"
                    type="success"
                    icon={<Sparkles className="h-4 w-4" />}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <LazyMotion features={domAnimation}>
          <m.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <m.div variants={itemVariants}>
              <Card className="border shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <div className="h-1 w-full bg-blue-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</p>
                      <h3 className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-50">{phase.durationWeeks} weeks</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{phase.startDate} - {phase.endDate}</p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </m.div>

            <m.div variants={itemVariants}>
              <Card className="border shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <div className="h-1 w-full bg-purple-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team</p>
                      <h3 className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-50">{phase.teamSize} members</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{phase.teamComposition}</p>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </m.div>

            <m.div variants={itemVariants}>
              <Card className="border shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <div className="h-1 w-full bg-green-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</p>
                      <h3 className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-50">{phase.budget}</h3>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{phase.spent} spent</p>
                        <div className="ml-2 px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700">
                          <span className={cn(
                            budgetPercentage > 90 ? 'text-red-600 dark:text-red-400' :
                              budgetPercentage > 70 ? 'text-amber-600 dark:text-amber-400' :
                                'text-green-600 dark:text-green-400'
                          )}>
                            {budgetPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </m.div>

            <m.div variants={itemVariants}>
              <Card className="border shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <div className="h-1 w-full bg-amber-500"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</p>
                      <h3 className="text-xl font-bold mt-1 text-gray-900 dark:text-gray-50">{phase.progress}%</h3>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            phase.progress >= 100 ? 'bg-green-500' :
                              phase.progress >= 70 ? 'bg-amber-500' :
                                'bg-blue-500'
                          )}
                          style={{ width: `${phase.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{phase.status}</p>
                    </div>
                    <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <LucideActivity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </m.div>
          </m.div>
        </LazyMotion>

        {/* Enhanced Tabs with better styling */}
        <PhaseTabs activeTab={activeTab} setActiveTab={setActiveTab}>
          {activeTab === 'tasks' && (
            <div className="p-4 pt-6 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Phase Tasks</h3>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Task
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TaskCard
                  title="Foundation Preparation"
                  description="Clear site and prepare for foundation pouring"
                  dueDate="Feb 15"
                  status="completed"
                  priority="high"
                  assignees={[{
                    id: 1,
                    name: "John Smith",
                    avatar: null
                  }]}
                  comments={3}
                  attachments={2}
                />

                <TaskCard
                  title="Excavation and Grading"
                  description="Prepare the ground surface to match engineering plans"
                  dueDate="Feb 20"
                  status="completed"
                  priority="medium"
                  assignees={[{
                    id: 2,
                    name: "Alex Jones",
                    avatar: null
                  }]}
                  comments={5}
                  attachments={1}
                />

                <TaskCard
                  title="Formwork Construction"
                  description="Build wooden forms to contain concrete pour"
                  dueDate="Feb 28"
                  status="in-progress"
                  priority="high"
                  assignees={[{
                    id: 3,
                    name: "Robert Chen",
                    avatar: null
                  }]}
                  comments={2}
                  attachments={3}
                />

                <TaskCard
                  title="Rebar Installation"
                  description="Place and secure reinforcement steel as per design"
                  dueDate="Mar 5"
                  status="in-progress"
                  priority="high"
                  assignees={[{
                    id: 4,
                    name: "Emily Wong",
                    avatar: null
                  }]}
                  comments={1}
                  attachments={2}
                />

                <TaskCard
                  title="Utility Rough-Ins"
                  description="Install plumbing and electrical conduits before concrete pour"
                  dueDate="Mar 8"
                  status="pending"
                  priority="medium"
                  assignees={[{
                    id: 5,
                    name: "Mike Stevens",
                    avatar: null
                  }]}
                  comments={0}
                  attachments={1}
                />

                <TaskCard
                  title="Concrete Pouring"
                  description="Pour concrete for foundations and initial curing"
                  dueDate="Mar 12"
                  status="pending"
                  priority="high"
                  assignees={[{
                    id: 6,
                    name: "David Miller",
                    avatar: null
                  }]}
                  comments={0}
                  attachments={0}
                />

                <TaskCard
                  title="Concrete Curing"
                  description="Regular watering and protection during curing period"
                  dueDate="Mar 15"
                  status="pending"
                  priority="medium"
                  assignees={[{
                    id: 7,
                    name: "Sarah Johnson",
                    avatar: null
                  }]}
                  comments={0}
                  attachments={0}
                />

                <TaskCard
                  title="Waterproofing Application"
                  description="Apply foundation waterproofing and drainage systems"
                  dueDate="Mar 15"
                  status="pending"
                  priority="medium"
                  assignees={[{
                    id: 8,
                    name: "Tom Wilson",
                    avatar: null
                  }]}
                  comments={0}
                  attachments={1}
                />

                <TaskCard
                  title="Foundation Inspection"
                  description="Final inspection before backfilling and moving to framing"
                  dueDate="Mar 15"
                  status="pending"
                  priority="high"
                  assignees={[{
                    id: 9,
                    name: "Karen Taylor",
                    avatar: null
                  }]}
                  comments={0}
                  attachments={0}
                />
              </div>
            </div>
          )}
          {activeTab === 'documents' && (
            <div className="p-4 pt-6 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Documents</h3>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Document
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Document list */}
                {/* Would use DocumentItem components here */}
              </div>
            </div>
          )}
          {activeTab === 'materials' && (
            <div className="p-4 pt-6 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Materials</h3>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Material
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Materials list */}
                {/* Would repeat MaterialCard components here */}
              </div>
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="p-4 pt-6 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">Timeline</h3>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Event
                </Button>
              </div>

              {/* Would include a calendar or timeline component here */}
              <div className="h-96 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-muted-foreground">Timeline chart would be displayed here</p>
              </div>
            </div>
          )}
        </PhaseTabs>
      </div>
    </div>
  );
};

export default PhaseDetails;
