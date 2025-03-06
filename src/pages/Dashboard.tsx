import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { darkModeDetector } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  Plus, 
  Package, 
  TrendingUp, 
  Users, 
  FileText, 
  ChevronRight,
  LayoutDashboard,
  Clock,
  AlertTriangle,
  BarChart3,
  Building,
  Construction,
  Sparkles,
  Search,
  ArrowRight,
  Calendar,
  CheckCircle,
  Settings,
  Bell,
  LogOut,
  Menu,
  User,
  Briefcase,
  Hammer,
  Headphones,
  HardHat,
  Clipboard,
  DollarSign,
  PieChart,
  ListTodo,
  X,
  RefreshCcw,
  Trash,
  Info,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HorizontalNav, type NavItem } from '@/components/navigation/HorizontalNav';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import DashboardCard from '@/components/dashboard/DashboardCard';
import DataVisualization from '@/components/dashboard/DataVisualization';
import { DashboardGrid, DashboardRow, DashboardSection } from '@/components/dashboard/DashboardGrid';
import { useToast } from '@/components/ui/toast-context';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import FormField from '@/components/ui/form-field';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = darkModeDetector.subscribe(setIsDarkMode);
    return unsubscribe;
  }, []);

  // Navigation items - memoized to prevent recreation on each render
  const navItems = React.useMemo<NavItem[]>(() => [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      label: 'Projects', 
      path: '/projects', 
      icon: <Briefcase className="w-5 h-5" />,
      badge: {
        text: '4',
        color: 'blue'
      }
    },
    { 
      label: 'Schedule', 
      path: '/schedule', 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      label: 'Materials', 
      path: '/materials', 
      icon: <Package className="w-5 h-5" /> 
    },
    { 
      label: 'Expenses', 
      path: '/expenses', 
      icon: <DollarSign className="w-5 h-5" /> 
    }
  ], []);

  // Memoized callback handlers to prevent recreating functions on every render
  const handleRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate data fetching
    setTimeout(() => {
      setIsRefreshing(false);
      
      // Show success toast
      toast({
        title: "Dashboard refreshed",
        description: "All data has been updated with the latest information",
        variant: "success",
        duration: 3000,
      });
    }, 1500);
  }, [toast]);

  // Sample data for visualizations
  const projectProgressData = [
    { name: 'Foundation', completed: 100, total: 100 },
    { name: 'Framing', completed: 75, total: 100 },
    { name: 'Electrical', completed: 30, total: 100 },
    { name: 'Plumbing', completed: 25, total: 100 },
    { name: 'Interior', completed: 0, total: 100 }
  ];

  const budgetData = [
    { name: 'Jan', Planned: 8000, Actual: 7200 },
    { name: 'Feb', Planned: 12000, Actual: 13100 },
    { name: 'Mar', Planned: 15000, Actual: 14800 },
    { name: 'Apr', Planned: 14000, Actual: 16500 },
    { name: 'May', Planned: 18000, Actual: 17300 },
    { name: 'Jun', Planned: 9000, Actual: 9200 }
  ];

  const materialUsageData = [
    { name: 'Concrete', value: 32 },
    { name: 'Steel', value: 24 },
    { name: 'Wood', value: 18 },
    { name: 'Glass', value: 12 },
    { name: 'Other', value: 14 }
  ];

  const taskStatusData = [
    { name: 'Completed', value: 42 },
    { name: 'In Progress', value: 18 },
    { name: 'Pending', value: 34 },
    { name: 'Delayed', value: 6 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className={cn(
          "relative overflow-hidden rounded-xl border shadow-lg mb-8 p-6",
            isDarkMode 
            ? "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700" 
            : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
        )}>
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, John!</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Here's what's happening with your projects today.</p>
              </div>
              <Button 
                onClick={() => navigate('/create-project')}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Active Projects</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Budget</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$120K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <ListTodo className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Open Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">28</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 dark:border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Team Members</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Project Progress */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Overview of all active project phases</CardDescription>
              </CardHeader>
              <CardContent>
                <DataVisualization
                  data={projectProgressData}
                  title="Progress by Phase"
                  xAxisKey="name"
                  yAxisKeys={["completed"]}
                  showToggle={true}
                  defaultChartType="bar"
                />
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Monthly planned vs actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <DataVisualization
                  data={budgetData}
                  title="Budget Overview"
                  xAxisKey="name"
                  yAxisKeys={["Planned", "Actual"]}
                  defaultChartType="line"
                />
              </CardContent>
            </Card>
              </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Task Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Task Status</CardTitle>
                <CardDescription>Distribution of tasks by status</CardDescription>
              </CardHeader>
              <CardContent>
                <DataVisualization
                  data={taskStatusData}
                  title="Task Status"
                  pieKey="name"
                  pieValueKey="value"
                  defaultChartType="pie"
                />
              </CardContent>
            </Card>

            {/* Material Usage */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Material Usage</CardTitle>
                <CardDescription>Current material distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <DataVisualization
                  data={materialUsageData}
                  title="Material Usage"
                  pieKey="name"
                  pieValueKey="value"
                  defaultChartType="pie"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => navigate('/schedule')}
            >
              <Calendar className="h-6 w-6 text-blue-600" />
              <span>Schedule Meeting</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => navigate('/materials')}
            >
              <Package className="h-6 w-6 text-green-600" />
              <span>Order Materials</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={() => navigate('/expenses')}
            >
              <DollarSign className="h-6 w-6 text-purple-600" />
              <span>Review Budget</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={() => navigate('/team')}
            >
              <Users className="h-6 w-6 text-amber-600" />
              <span>Team Management</span>
            </Button>
          </div>
        </div>
      </div>
      </div>
  );
};

export default Dashboard; 